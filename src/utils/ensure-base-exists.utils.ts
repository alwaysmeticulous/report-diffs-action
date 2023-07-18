import { warning as ghWarning } from "@actions/core";
import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";
import {
  createClient,
  getLatestTestRunResults,
} from "@alwaysmeticulous/client";
import { METICULOUS_LOGGER_NAME } from "@alwaysmeticulous/common";
import log from "loglevel";
import { Duration } from "luxon";
import { CodeChangeEvent } from "../types";
import { DOCS_URL, LOGICAL_ENVIRONMENT_VERSION } from "./constants";
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
    return { shaToCompareAgainst: null };
  }
};

export const ensureBaseTestsExists = async ({
  event,
  apiToken,
  base, // from the PR event
  context,
  octokit,
}: {
  event: CodeChangeEvent;
  apiToken: string;
  base: string | null;
  context: Context;
  octokit: InstanceType<typeof GitHub>;
}): Promise<{ shaToCompareAgainst: string | null }> => {
  const logger = log.getLogger(METICULOUS_LOGGER_NAME);

  const { owner, repo } = context.repo;

  if (!base) {
    return { shaToCompareAgainst: null };
  }

  const testRun = await getLatestTestRunResults({
    client: createClient({ apiToken }),
    commitSha: base,
    logicalEnvironmentVersion: LOGICAL_ENVIRONMENT_VERSION,
  });

  if (testRun != null) {
    logger.log(`Tests already exist for commit ${base} (${testRun.id})`);
    return { shaToCompareAgainst: base };
  }

  const { workflowId } = await getCurrentWorkflowId({ context, octokit });

  const alreadyPending = await getPendingWorkflowRun({
    owner,
    repo,
    workflowId,
    commitSha: base,
    octokit,
  });
  if (alreadyPending != null) {
    logger.log(
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
      return { shaToCompareAgainst: base };
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
    return { shaToCompareAgainst: null };
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
    return { shaToCompareAgainst: null };
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
    return { shaToCompareAgainst: null };
  }

  logger.log(`Waiting on workflow run: ${workflowRun.html_url}`);
  await waitForWorkflowCompletionAndThrowIfFailed({
    owner,
    repo,
    workflowRunId: workflowRun.workflowRunId,
    octokit,
    commitSha: base,
    timeout: WORKFLOW_RUN_COMPLETION_TIMEOUT_ON_PULL_REQUEST,
  });

  return { shaToCompareAgainst: base };
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
      `Comparing against screenshots taken on ${commitSha}, but the corresponding workflow run [${finalWorkflowRun.id}] did not complete successfully. See: ${finalWorkflowRun.html_url}`
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
}) => {
  const finalWorkflowRun = await waitForWorkflowCompletion(otherOpts);

  if (finalWorkflowRun == null || isPendingStatus(finalWorkflowRun.status)) {
    logger.warn(
      `Timed out while waiting for workflow run (${otherOpts.workflowRunId}) to complete. Running without comparisons.`
    );
    return { shaToCompareAgainst: null };
  }

  if (
    finalWorkflowRun.status !== "completed" ||
    finalWorkflowRun.conclusion !== "success"
  ) {
    logger.warn(
      `Comparing against screenshots taken on ${commitSha}, but the corresponding workflow run [${finalWorkflowRun.id}] did not complete successfully. See: ${finalWorkflowRun.html_url}. Running without comparisons.`
    );
    return { shaToCompareAgainst: null };
  }

  return { shaToCompareAgainst: commitSha };
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
