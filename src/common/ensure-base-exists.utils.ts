import { warning as ghWarning } from "@actions/core";
import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";
import { BaseResolutionDetails } from "@alwaysmeticulous/api";
import {
  createClient,
  takeBaseWorkflowDispatchLease,
  TestRun,
} from "@alwaysmeticulous/client";
import log from "loglevel";
import { DateTime, Duration } from "luxon";
import { CodeChangeEvent } from "../types";
import { COMMIT_SHA_WORKFLOW_INPUT, DOCS_URL } from "./constants";
import {
  DEFAULT_FAILED_OCTOKIT_REQUEST_MESSAGE,
  isGithubPermissionsError,
  getDetailedGitHubPermissionsError,
} from "./error.utils";
import {
  DISPATCH_CLOCK_SKEW_ALLOWANCE,
  findRecentlyDispatchedRun,
  getCurrentWorkflowId,
  getPendingWorkflowRun,
  isPendingStatus,
  startNewWorkflowRun,
  waitForWorkflowCompletion,
} from "./workflow.utils";

const WORKFLOW_RUN_COMPLETION_TIMEOUT_ON_PULL_REQUEST = Duration.fromObject({
  minutes: 30,
});

const POLL_FOR_BASE_TEST_RUN_INTERVAL = Duration.fromObject({
  seconds: 10,
});

/**
 * How long to leave between looks for a run another caller dispatched, and so also how long we
 * leave before the first one. Comfortably longer than the delay before GitHub lists a dispatched
 * run, because that delay is what decides whether the listing shows us the holder's run or only
 * whatever else happens to be in the window, and we're waiting out a dispatch whose exact moment
 * we don't know.
 */
const POLL_FOR_ANOTHER_CALLERS_RUN_INTERVAL = Duration.fromObject({
  seconds: 30,
});

/**
 * How long the backend holds a dispatch lease for, and so both how old the dispatch we were
 * refused for can already be, and how long a dispatch has to become visible to us before we
 * stop looking for it: the lease exists to cover the seconds in which GitHub won't yet list a
 * dispatched run, so a run we still can't see once it has expired is one we were never going to
 * recognise. Kept in step with `LEASE_DURATION` on the backend.
 */
const BASE_DISPATCH_LEASE_DURATION = Duration.fromObject({ minutes: 2 });

export interface BaseTestsResolutionResult {
  baseTestRunExists: boolean;
  baseResolutionDetails?: BaseResolutionDetails;
}

export const safeEnsureBaseTestsExists: typeof ensureBaseTestsExists = async (
  ...params
) => {
  try {
    return await ensureBaseTestsExists(...params);
  } catch (error) {
    params[0].logger.error(error);
    const message = `Error while running tests on base ${params[0].base}. No diffs will be reported for this run.`;
    params[0].logger.warn(message);
    ghWarning(message);
    return {
      baseTestRunExists: false,
      baseResolutionDetails: {
        type: "failed-for-other-reason",
        message,
      },
    };
  }
};

export const ensureBaseTestsExists = async ({
  event,
  apiToken,
  base, // from the PR event
  context,
  octokit,
  getBaseTestRun,
  getBaseTestRunResolvedByBackend,
  logger,
}: {
  event: CodeChangeEvent;
  apiToken: string;
  base: string | null;
  context: Context;
  octokit: InstanceType<typeof GitHub>;
  getBaseTestRun: (options: { baseSha: string }) => Promise<TestRun | null>;
  /**
   * A second, optional source of an already-usable base, asked only if nothing has been tested at
   * `base` itself. Callers that can reach the backend's own base resolution pass it so that a base
   * only the backend knows about — an older tested ancestor, under a monorepo setup — still counts
   * as covered, rather than us building a commit it was never going to compare against.
   */
  getBaseTestRunResolvedByBackend?: () => Promise<TestRun | null>;
  logger: log.Logger;
}): Promise<BaseTestsResolutionResult> => {
  if (!base) {
    return { baseTestRunExists: false };
  }

  const testRun = await getBaseTestRun({ baseSha: base });

  if (testRun != null) {
    logger.info(`Tests already exist for commit ${base} (${testRun.id})`);
    return {
      baseTestRunExists: true,
      baseResolutionDetails: {
        type: "suitable-test-run-already-existed",
        testRunId: testRun.id,
      },
    };
  }

  // Only worth asking on a pull request, since that's the only event we'd build a base for.
  if (event.type === "pull_request") {
    const backendResolvedTestRun = await getBaseTestRunResolvedByBackend?.();

    if (backendResolvedTestRun != null) {
      logger.info(
        `No tests exist for commit ${base}, but this pull request already has a base test run to compare against (${backendResolvedTestRun.id})`
      );
      return {
        baseTestRunExists: true,
        baseResolutionDetails: {
          type: "suitable-test-run-already-existed",
          testRunId: backendResolvedTestRun.id,
        },
      };
    }
  }

  return await tryTriggerTestsWorkflowOnBase({
    logger,
    event,
    apiToken,
    base,
    context,
    octokit,
    // Racing the workflow against a poll for the test run lets someone else's build of the same
    // base finish the job for us, which matters when two dispatches land close enough together
    // that neither can tell which run is its own.
    getBaseTestRun: () => getBaseTestRun({ baseSha: base }),
  });
};

export interface TryTriggerTestsWorkflowOnBaseOpts {
  logger: log.Logger;
  event: CodeChangeEvent;
  apiToken: string;
  base: string;
  getBaseTestRun?: () => Promise<TestRun | null>;
  context: Context;
  octokit: InstanceType<typeof GitHub>;
}

export const tryTriggerTestsWorkflowOnBase = async (
  opts: TryTriggerTestsWorkflowOnBaseOpts
): Promise<BaseTestsResolutionResult> => {
  let isDone = false;
  const isCancelled = () => {
    return isDone;
  };
  const workflowRunPromise = waitOnWorkflowRun(opts, isCancelled);
  if (!opts.getBaseTestRun) {
    return workflowRunPromise;
  }
  const baseTestRunPromise = waitOnBaseTestRun(
    opts.getBaseTestRun,
    isCancelled
  );
  try {
    return await Promise.race([workflowRunPromise, baseTestRunPromise]);
  } finally {
    // A workflow run that fails or times out throws, and the poll has no timeout of its own, so
    // cancelling only on the happy path leaves it running until the job exits.
    isDone = true;
  }
};

const waitOnWorkflowRun = async (
  opts: TryTriggerTestsWorkflowOnBaseOpts,
  isCancelled: () => boolean
): Promise<BaseTestsResolutionResult> => {
  const { logger, event, apiToken, base, context, octokit } = opts;
  const { owner, repo } = context.repo;
  const { workflowId } = await getCurrentWorkflowId({ context, octokit });

  const alreadyPending = await getPendingWorkflowRun({
    owner,
    repo,
    workflowId,
    commitSha: base,
    octokit,
    logger,
  });
  if (alreadyPending != null) {
    logger.info(
      `Waiting on workflow run on base commit (${base}) to compare against: ${alreadyPending.html_url}`
    );

    if (event.type === "pull_request") {
      return await waitOnRunBuildingTheBase({
        owner,
        repo,
        workflowRun: alreadyPending,
        base,
        octokit,
        isCancelled,
        logger,
      });
    }
    // If we are not a PR event, then it's unlikely anyone will be looking at the comparisons. However,
    // it is very possible that someone is waiting for _us_ to complete. So let's not delay the workflow
    // and let's proceed without a base test run, skipping comparisons.
    return { baseTestRunExists: false };
  }

  // Running missing tests on base is only supported for Pull Request events
  if (event.type !== "pull_request") {
    return { baseTestRunExists: false };
  }

  // A dispatch ref can only be a branch or a tag, so we ask the workflow on the base branch to
  // build `base` by naming it in an input. Workflows that don't declare that input build their
  // branch head instead, which is the commit we want only while the branch hasn't moved on.
  const baseRef = event.payload.pull_request.base.ref;

  // Several projects can share a workflow and each runs this action independently, so a missing
  // base has them all deciding to build the same commit at the same moment — and none of their
  // checks above can see the others, because GitHub doesn't list a run for several seconds after
  // it's dispatched. The backend is the only participant that sees them all, so it picks one.
  //
  // Asked here rather than earlier on purpose: a lease taken and then not used holds every other
  // caller off a commit that nothing goes on to build.
  // A refusal can come at any point in the lease's life, so the dispatch we'd be refused for can
  // already be that old. Anything older than that can't be it — and looking back further than we
  // must only makes an unrelated dispatch more likely to muddy the search.
  const couldHaveBeenDispatchedSince = DateTime.utc()
    .minus(BASE_DISPATCH_LEASE_DURATION)
    .minus(DISPATCH_CLOCK_SKEW_ALLOWANCE);
  const shouldDispatch = await takeBaseWorkflowDispatchLease({
    client: createClient({ apiToken }),
    baseCommitSha: base,
    workflowId: `${workflowId}`,
  });

  if (!shouldDispatch) {
    logger.info(
      `Another job is already building the base commit (${base}), so waiting for it rather than building the same commit twice`
    );
    return await waitOnAnotherCallersBuild({
      owner,
      repo,
      workflowId,
      baseRef,
      dispatchedAfter: couldHaveBeenDispatchedSince,
      base,
      octokit,
      isCancelled,
      logger,
    });
  }

  logger.debug(JSON.stringify({ base, baseRef }, null, 2));

  let dispatch = await startNewWorkflowRun({
    owner,
    repo,
    workflowId,
    ref: baseRef,
    commitSha: base,
    pinCommitSha: true,
    octokit,
    logger,
  });

  if (dispatch.type === "commit-pinning-unsupported") {
    const currentBaseSha = await getHeadCommitForRef({
      owner,
      repo,
      ref: baseRef,
      octokit,
      logger,
    });

    logger.debug(
      JSON.stringify({ owner, repo, base, baseRef, currentBaseSha }, null, 2)
    );
    if (base !== currentBaseSha) {
      const message = `Meticulous tests on base commit ${base} haven't started running so we have nothing to compare against.
    In addition we were not able to trigger a run on ${base} since the '${baseRef}' branch is now pointing to ${currentBaseSha}, and the Meticulous workflow on '${baseRef}' does not accept the '${COMMIT_SHA_WORKFLOW_INPUT}' input that would let us ask for ${base} specifically.
    Therefore no diffs will be reported for this run. Re-running the tests may fix this, as would adding the input: see ${DOCS_URL}.`;
      logger.warn(message);
      ghWarning(message);
      return {
        baseTestRunExists: false,
        baseResolutionDetails: {
          type: "required-new-workflow-run-but-failed-due-to-new-commit-to-base-branch",
          baseRef,
          targetBaseCommitSha: base,
          currentLastestBaseCommitSha: currentBaseSha,
        },
      };
    }

    dispatch = await startNewWorkflowRun({
      owner,
      repo,
      workflowId,
      ref: baseRef,
      commitSha: base,
      pinCommitSha: false,
      octokit,
      logger,
    });
  }

  const workflowRun =
    dispatch.type === "started" ? dispatch.workflowRun : undefined;

  if (workflowRun == null) {
    const message = `Warning: Could not retrieve dispatched workflow run. Will not perform diffs against ${base}.`;
    logger.warn(message);
    ghWarning(message);
    return {
      baseTestRunExists: false,
      baseResolutionDetails: {
        type: "failed-for-other-reason",
        message,
      },
    };
  }

  logger.info(
    `Waiting on workflow run: ${
      workflowRun.html_url ?? workflowRun.workflowRunId
    }`
  );
  const waitStartMs = Date.now();
  await waitForWorkflowCompletionAndThrowIfFailed({
    owner,
    repo,
    workflowRunId: workflowRun.workflowRunId,
    octokit,
    commitSha: base,
    timeout: WORKFLOW_RUN_COMPLETION_TIMEOUT_ON_PULL_REQUEST,
    isCancelled,
    logger,
  });

  return {
    baseTestRunExists: true,
    baseResolutionDetails: {
      type: "triggered-new-workflow-run-successfully",
      workflowId: `${workflowRun.workflowRunId}`,
      msTaken: Date.now() - waitStartMs,
    },
  };
};

/**
 * Waits out a build of the base that we were told not to make ourselves.
 *
 * The caller holding the lease dispatched at about the moment we asked for it, and GitHub takes
 * a few seconds to list a run, so we look again for a short while and then wait on what it
 * dispatched as we would any run we'd found already pending. We look for a dispatch rather than
 * for our commit because a pinned dispatch is listed under the head of the branch it was
 * dispatched against, so the run building the base often can't be recognised by the base.
 *
 * Where the listing can't say — several dispatches in the same window are indistinguishable, and
 * a holder that failed to dispatch leaves none at all — the poll for the base test run racing
 * alongside is what resolves this, and all we do here is stay out of its way until it does. That
 * costs a job whose lease holder failed to dispatch the wait it would otherwise have spent
 * failing; it ends up without a base either way.
 */
const waitOnAnotherCallersBuild = async ({
  owner,
  repo,
  workflowId,
  baseRef,
  dispatchedAfter,
  base,
  octokit,
  isCancelled,
  logger,
}: {
  owner: string;
  repo: string;
  workflowId: number;
  baseRef: string;
  dispatchedAfter: DateTime;
  base: string;
  octokit: InstanceType<typeof GitHub>;
  isCancelled: () => boolean;
  logger: log.Logger;
}): Promise<BaseTestsResolutionResult> => {
  const startedAtMs = Date.now();
  const stopLookingAtMs =
    startedAtMs + BASE_DISPATCH_LEASE_DURATION.as("milliseconds");
  const giveUpAtMs =
    startedAtMs +
    WORKFLOW_RUN_COMPLETION_TIMEOUT_ON_PULL_REQUEST.as("milliseconds");

  while (Date.now() < giveUpAtMs) {
    // Look only once GitHub has had time to list the holder's dispatch. Reading the listing while
    // that run is still missing is what would let some unrelated dispatch of the same workflow
    // stand alone in the window and be taken for the build we're waiting on; once the holder's
    // run is listed, an unrelated one alongside it is a pair we can't tell apart, and we
    // correctly wait on neither.
    await new Promise((resolve) =>
      setTimeout(
        resolve,
        POLL_FOR_ANOTHER_CALLERS_RUN_INTERVAL.as("milliseconds")
      )
    );
    if (isCancelled()) {
      return { baseTestRunExists: false };
    }
    // Only look while the run could still be turning up: past that we're waiting on the test run,
    // and listing on a loop for half an hour would spend the job's rate limit on nothing.
    if (Date.now() < stopLookingAtMs) {
      const workflowRun = await findRecentlyDispatchedRun({
        owner,
        repo,
        workflowId,
        ref: baseRef,
        dispatchedAfter,
        octokit,
        logger,
      });
      if (workflowRun != null) {
        logger.info(
          `Waiting on the workflow run building the base commit (${base}): ${workflowRun.html_url}`
        );
        try {
          return await waitOnRunBuildingTheBase({
            owner,
            repo,
            workflowRun,
            base,
            octokit,
            isCancelled,
            logger,
          });
        } catch (error) {
          // A run we found pending on the base was building it beyond doubt, and its failure is
          // the caller's to hear about. This one we only inferred, from it being the sole
          // dispatch in the window, so report the outcome we're sure of — no base — rather than
          // failing the job over a run that might have been building something else.
          const message = `The workflow run we understood to be building the base commit ${base} did not complete successfully, so no diffs will be reported for this run: ${error}`;
          logger.warn(message);
          ghWarning(message);
          return {
            baseTestRunExists: false,
            baseResolutionDetails: {
              type: "failed-for-other-reason",
              message,
            },
          };
        }
      }
    }
  }

  const message = `Another job was asked to build the base commit ${base}, but nothing to compare against appeared in time. No diffs will be reported for this run.`;
  logger.warn(message);
  ghWarning(message);
  return {
    baseTestRunExists: false,
    baseResolutionDetails: {
      type: "failed-for-other-reason",
      message,
    },
  };
};

const waitOnRunBuildingTheBase = async ({
  owner,
  repo,
  workflowRun,
  base,
  octokit,
  isCancelled,
  logger,
}: {
  owner: string;
  repo: string;
  workflowRun: { workflowRunId: number };
  base: string;
  octokit: InstanceType<typeof GitHub>;
  isCancelled: () => boolean;
  logger: log.Logger;
}): Promise<BaseTestsResolutionResult> => {
  const waitStartMs = Date.now();
  await waitForWorkflowCompletionAndThrowIfFailed({
    owner,
    repo,
    workflowRunId: workflowRun.workflowRunId,
    octokit,
    commitSha: base,
    timeout: WORKFLOW_RUN_COMPLETION_TIMEOUT_ON_PULL_REQUEST,
    isCancelled,
    logger,
  });
  return {
    baseTestRunExists: true,
    baseResolutionDetails: {
      type: "waited-for-existing-workflow-run",
      workflowId: `${workflowRun.workflowRunId}`,
      baseCommitSha: base,
      msTaken: Date.now() - waitStartMs,
    },
  };
};

const waitOnBaseTestRun = async (
  getBaseTestRun: () => Promise<TestRun | null>,
  isCancelled: () => boolean
): Promise<BaseTestsResolutionResult> => {
  let baseTestRun = await getBaseTestRun();
  while (!baseTestRun) {
    if (isCancelled()) {
      return { baseTestRunExists: false };
    }
    await new Promise((resolve) =>
      setTimeout(resolve, POLL_FOR_BASE_TEST_RUN_INTERVAL.as("milliseconds"))
    );
    baseTestRun = await getBaseTestRun();
  }
  return {
    baseTestRunExists: true,
    baseResolutionDetails: {
      type: "suitable-test-run-already-existed",
      testRunId: baseTestRun.id,
    },
  };
};

const waitForWorkflowCompletionAndThrowIfFailed = async ({
  commitSha,
  ...otherOpts
}: {
  owner: string;
  repo: string;
  workflowRunId: number;
  octokit: InstanceType<typeof GitHub>;
  commitSha: string;
  timeout: Duration;
  isCancelled: () => boolean;
  logger: log.Logger;
}) => {
  const finalWorkflowRun = await waitForWorkflowCompletion(otherOpts);

  if (finalWorkflowRun == null || isPendingStatus(finalWorkflowRun.status)) {
    throw new Error(
      `Timed out while waiting for workflow run (${otherOpts.workflowRunId}) to complete.`
    );
  }

  if (
    finalWorkflowRun.status !== "completed" ||
    finalWorkflowRun.conclusion !== "success"
  ) {
    throw new Error(
      `Comparing against visual snapshots taken on ${commitSha}, but the corresponding workflow run [${finalWorkflowRun.id}] did not complete successfully. See: ${finalWorkflowRun.html_url}`
    );
  }
};

const getHeadCommitForRef = async ({
  owner,
  repo,
  ref,
  octokit,
  logger,
}: {
  owner: string;
  repo: string;
  ref: string;
  octokit: InstanceType<typeof GitHub>;
  logger: log.Logger;
}): Promise<string> => {
  try {
    const result = await octokit.rest.repos.getBranch({
      owner,
      repo,
      branch: ref,
    });
    const commitSha = result.data.commit.sha;
    return commitSha;
  } catch (err: unknown) {
    if (isGithubPermissionsError(err)) {
      // https://docs.github.com/en/rest/overview/permissions-required-for-github-apps?apiVersion=2022-11-28#repository-permissions-for-contents
      const detailedError = getDetailedGitHubPermissionsError(err, {
        operation: "get_branch",
        requiredPermissions: ["contents: read"],
      });
      throw new Error(
        `Missing permission to get the head commit of the branch '${ref}'. This is required in order to correctly calculate the two commits to compare.\n\n${detailedError}`
      );
    }
    logger.error(
      `Unable to get head commit of branch '${ref}'. This is required in order to correctly calculate the two commits to compare. ${DEFAULT_FAILED_OCTOKIT_REQUEST_MESSAGE}`
    );
    throw err;
  }
};
