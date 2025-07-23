import { warning as ghWarning } from "@actions/core";
import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";
import { TestRun } from "@alwaysmeticulous/client";
import log from "loglevel";
import { Duration } from "luxon";
import { CodeChangeEvent } from "../types";
import { DOCS_URL } from "./constants";
import {
  DEFAULT_FAILED_OCTOKIT_REQUEST_MESSAGE,
  isGithubPermissionsError,
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
const WORKFLOW_RUN_COMPLETION_TIMEOUT_ON_PUSH_EVENT = Duration.fromObject({
  minutes: 10,
});

const POLL_FOR_BASE_TEST_RUN_INTERVAL = Duration.fromObject({
  seconds: 10,
});

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
    return { baseTestRunExists: false };
  }
};

export const ensureBaseTestsExists = async ({
  event,
  base, // from the PR event
  context,
  octokit,
  getBaseTestRun,
  logger,
}: {
  event: CodeChangeEvent;
  apiToken: string;
  base: string | null;
  context: Context;
  octokit: InstanceType<typeof GitHub>;
  getBaseTestRun: (options: { baseSha: string }) => Promise<TestRun | null>;
  logger: log.Logger;
}): Promise<{ baseTestRunExists: boolean }> => {
  if (!base) {
    return { baseTestRunExists: false };
  }

  const testRun = await getBaseTestRun({ baseSha: base });

  if (testRun != null) {
    logger.info(`Tests already exist for commit ${base} (${testRun.id})`);
    return { baseTestRunExists: true };
  }

  return await tryTriggerTestsWorkflowOnBase({
    logger,
    event,
    base,
    context,
    octokit,
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
): Promise<{ baseTestRunExists: boolean }> => {
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
  const result = await Promise.race([workflowRunPromise, baseTestRunPromise]);
  isDone = true;
  return result;
};

const waitOnWorkflowRun = async (
  opts: TryTriggerTestsWorkflowOnBaseOpts,
  isCancelled: () => boolean
): Promise<{ baseTestRunExists: boolean }> => {
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
  if (alreadyPending != null && false) {
    logger.info(
      `Waiting on workflow run on base commit (${base}) to compare against: ${alreadyPending.html_url}`
    );

    if (event.type === "pull_request") {
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
      return { baseTestRunExists: true };
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

  // We can only trigger a workflow_run against the head of the base branch
  // This will give some spurious diffs if it's different from `base`, but it's the best we can do
  const baseRef = "nick-tests-workflows";

  logger.log(JSON.stringify({ base, baseRef }, null, 2));

  const currentBaseSha = await getHeadCommitForRef({
    owner,
    repo,
    ref: baseRef,
    octokit,
    logger,
  });

  logger.log(
    JSON.stringify({ owner, repo, base, baseRef, currentBaseSha }, null, 2)
  );
  if (base !== currentBaseSha) {
    const message = `Meticulous tests on base commit ${base} haven't started running so we have nothing to compare against.
    In addition we were not able to trigger a run on ${base} since the '${baseRef}' branch is now pointing to ${currentBaseSha}.
    Therefore no diffs will be reported for this run. Re-running the tests may fix this.`;
    logger.warn(message);
    ghWarning(message);
    return { baseTestRunExists: false };
  }

  const workflowRun = await startNewWorkflowRun({
    owner,
    repo,
    workflowId,
    ref: baseRef,
    commitSha: base,
    octokit,
    logger,
  });

  if (workflowRun == null) {
    const message = `Warning: Could not retrieve dispatched workflow run. Will not perform diffs against ${base}.`;
    logger.warn(message);
    ghWarning(message);
    return { baseTestRunExists: false };
  }

  logger.info(`Waiting on workflow run: ${workflowRun.html_url}`);
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

  return { baseTestRunExists: true };
};

const waitOnBaseTestRun = async (
  getBaseTestRun: () => Promise<TestRun | null>,
  isCancelled: () => boolean
): Promise<{ baseTestRunExists: boolean }> => {
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
  return { baseTestRunExists: true };
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
      throw new Error(
        `Missing permission to get the head commit of the branch '${ref}'. This is required in order to correctly calculate the two commits to compare.` +
          ` Please add the 'contents: read' permission to your workflow YAML file: see ${DOCS_URL} for the correct setup.`
      );
    }
    logger.error(
      `Unable to get head commit of branch '${ref}'. This is required in order to correctly calculate the two commits to compare. ${DEFAULT_FAILED_OCTOKIT_REQUEST_MESSAGE}`
    );
    throw err;
  }
};
