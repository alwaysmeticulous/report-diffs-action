import { warning as ghWarning } from "@actions/core";
import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";
import { TestRun } from "@alwaysmeticulous/client";
import { METICULOUS_LOGGER_NAME } from "@alwaysmeticulous/common";
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

export const safeEnsureBaseTestsExists: typeof ensureBaseTestsExists = async (
  ...params
) => {
  const logger = log.getLogger(METICULOUS_LOGGER_NAME);
  try {
    return await ensureBaseTestsExists(...params);
  } catch (error) {
    logger.error(error);
    const message = `Error while running tests on base ${params[0].base}. No diffs will be reported for this run.`;
    logger.warn(message);
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
}: {
  event: CodeChangeEvent;
  apiToken: string;
  base: string | null;
  context: Context;
  octokit: InstanceType<typeof GitHub>;
  getBaseTestRun: (options: { baseSha: string }) => Promise<TestRun | null>;
}): Promise<{ baseTestRunExists: boolean | null }> => {
  const logger = log.getLogger(METICULOUS_LOGGER_NAME);

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
export const tryTriggerTestsWorkflowOnBase = async ({
  logger,
  event,
  base,
  context,
  octokit,
}: {
  logger: log.Logger;
  event: CodeChangeEvent;
  base: string;
  context: Context;
  octokit: InstanceType<typeof GitHub>;
}): Promise<{ baseTestRunExists: boolean | null }> => {
  const { owner, repo } = context.repo;
  const { workflowId } = await getCurrentWorkflowId({ context, octokit });

  const alreadyPending = await getPendingWorkflowRun({
    owner,
    repo,
    workflowId,
    commitSha: base,
    octokit,
  });
  if (alreadyPending != null) {
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
      });
      return { baseTestRunExists: true };
    } else {
      // If it's a push event to the main branch then the comparisons aren't as essential
      // (it's unlikely anyone will be looking at the comparison results). However we do want to
      // perform comparisons _if possible_ since we want to detect any flakes, so that we can determine
      // the most common variant, and future runs comparing against us as a base can compare against the most
      // common variant, reducing the chance of an undetected flake.
      //
      // So we wait for a shorter amount of time, and if we timeout or fail then we just disable comparisons,
      // rather than disabling the whole run.
      return await waitForWorkflowCompletionAndSkipComparisonsIfFailed({
        owner,
        repo,
        workflowRunId: alreadyPending.workflowRunId,
        octokit,
        commitSha: base,
        timeout: WORKFLOW_RUN_COMPLETION_TIMEOUT_ON_PUSH_EVENT,
        logger,
      });
    }
  }

  // Running missing tests on base is only supported for Pull Request events
  if (event.type !== "pull_request") {
    return { baseTestRunExists: null };
  }

  // We can only trigger a workflow_run against the head of the base branch
  // This will give some spurious diffs if it's different from `base`, but it's the best we can do
  const baseRef = event.payload.pull_request.base.ref;

  logger.debug(JSON.stringify({ base, baseRef }, null, 2));

  const currentBaseSha = await getHeadCommitForRef({
    owner,
    repo,
    ref: baseRef,
    octokit,
  });

  logger.debug(
    JSON.stringify({ owner, repo, base, baseRef, currentBaseSha }, null, 2)
  );
  if (base !== currentBaseSha) {
    const message = `Meticulous tests on base commit ${base} haven't started running so we have nothing to compare against.
    In addition we were not able to trigger a run on ${base} since the '${baseRef}' branch is now pointing to ${currentBaseSha}.
    Therefore no diffs will be reported for this run. Re-running the tests may fix this.`;
    logger.warn(message);
    ghWarning(message);
    return { baseTestRunExists: null };
  }

  const workflowRun = await startNewWorkflowRun({
    owner,
    repo,
    workflowId,
    ref: baseRef,
    commitSha: base,
    octokit,
  });

  if (workflowRun == null) {
    const message = `Warning: Could not retrieve dispatched workflow run. Will not perform diffs against ${base}.`;
    logger.warn(message);
    ghWarning(message);
    return { baseTestRunExists: null };
  }

  logger.info(`Waiting on workflow run: ${workflowRun.html_url}`);
  await waitForWorkflowCompletionAndThrowIfFailed({
    owner,
    repo,
    workflowRunId: workflowRun.workflowRunId,
    octokit,
    commitSha: base,
    timeout: WORKFLOW_RUN_COMPLETION_TIMEOUT_ON_PULL_REQUEST,
  });

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

const waitForWorkflowCompletionAndSkipComparisonsIfFailed = async ({
  commitSha,
  logger,
  ...otherOpts
}: {
  logger: log.Logger;
  owner: string;
  repo: string;
  workflowRunId: number;
  octokit: InstanceType<typeof GitHub>;
  commitSha: string;
  timeout: Duration;
}): Promise<{ baseTestRunExists: boolean }> => {
  const finalWorkflowRun = await waitForWorkflowCompletion(otherOpts);

  if (finalWorkflowRun == null || isPendingStatus(finalWorkflowRun.status)) {
    logger.warn(
      `Timed out while waiting for workflow run (${otherOpts.workflowRunId}) to complete. Running without comparisons.`
    );
    return { baseTestRunExists: false };
  }

  if (
    finalWorkflowRun.status !== "completed" ||
    finalWorkflowRun.conclusion !== "success"
  ) {
    logger.warn(
      `Comparing against visual snapshots taken on ${commitSha}, but the corresponding workflow run [${finalWorkflowRun.id}] did not complete successfully. See: ${finalWorkflowRun.html_url}. Running without comparisons.`
    );
    return { baseTestRunExists: false };
  }

  return { baseTestRunExists: true };
};

const getHeadCommitForRef = async ({
  owner,
  repo,
  ref,
  octokit,
}: {
  owner: string;
  repo: string;
  ref: string;
  octokit: InstanceType<typeof GitHub>;
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
    const logger = log.getLogger(METICULOUS_LOGGER_NAME);
    logger.error(
      `Unable to get head commit of branch '${ref}'. This is required in order to correctly calculate the two commits to compare. ${DEFAULT_FAILED_OCTOKIT_REQUEST_MESSAGE}`
    );
    throw err;
  }
};
