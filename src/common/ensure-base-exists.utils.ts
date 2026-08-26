import { warning as ghWarning } from "@actions/core";
import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";
import { BaseResolutionDetails } from "@alwaysmeticulous/api";
import { TestRun } from "@alwaysmeticulous/client";
import log from "loglevel";
import { Duration } from "luxon";
import { CodeChangeEvent } from "../types";
import { COMMIT_SHA_WORKFLOW_INPUT, DOCS_URL } from "./constants";
import {
  DEFAULT_FAILED_OCTOKIT_REQUEST_MESSAGE,
  isGithubPermissionsError,
  getDetailedGitHubPermissionsError,
} from "./error.utils";
import {
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
  const { logger, event, base, context, octokit } = opts;
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
      const waitStartMs = Date.now();
      await waitForWorkflowCompletionAndThrowIfFailed({
        owner,
        repo,
        workflowRunId: alreadyPending.workflowRunId,
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
          workflowId: `${alreadyPending.workflowRunId}`,
          baseCommitSha: base,
          msTaken: Date.now() - waitStartMs,
        },
      };
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
