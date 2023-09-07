import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";
import { METICULOUS_LOGGER_NAME } from "@alwaysmeticulous/common";
import log from "loglevel";
import { DateTime, Duration } from "luxon";
import { DOCS_URL } from "./constants";
import { isGithubPermissionsError } from "./error.utils";
import { shortSha } from "./logger.utils";

// The GitHub REST API will not list a workflow run immediately after it has been dispatched
const LISTING_AFTER_DISPATCH_DELAY = Duration.fromObject({ seconds: 10 });

const WORKFLOW_RUN_UPDATE_STATUS_INTERVAL = Duration.fromObject({ seconds: 5 });

export const getCurrentWorkflowId = async ({
  context,
  octokit,
}: {
  context: Context;
  octokit: InstanceType<typeof GitHub>;
}): Promise<{ workflowId: number }> => {
  const { owner, repo } = context.repo;
  const workflowRunId = context.runId;
  const { data } = await octokit.rest.actions.getWorkflowRun({
    owner,
    repo,
    run_id: workflowRunId,
  });
  const workflowId = data.workflow_id;
  return { workflowId };
};

export const startNewWorkflowRun = async ({
  owner,
  repo,
  workflowId,
  ref,
  commitSha,
  octokit,
}: {
  owner: string;
  repo: string;
  workflowId: number;
  ref: string;
  commitSha: string;
  octokit: InstanceType<typeof GitHub>;
}): Promise<{ workflowRunId: number; [key: string]: unknown } | undefined> => {
  try {
    await octokit.rest.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id: workflowId,
      ref,
    });
  } catch (err: unknown) {
    const logger = log.getLogger(METICULOUS_LOGGER_NAME);
    const message = (err as { message?: string } | null)?.message ?? "";
    if (
      message.includes("Workflow does not have 'workflow_dispatch' trigger")
    ) {
      logger.error(
        `Could not trigger a workflow run on commit ${shortSha(
          commitSha
        )} of the base branch (${ref}) to compare against, because there was no Meticulous workflow with the 'workflow_dispatch' trigger on the ${ref} branch.` +
          ` Visual snapshots of the new flows will be taken, but no comparisons will be made.` +
          ` If you haven't merged the PR to setup Meticulous in Github Actions to the ${ref} branch yet then this is expected.` +
          ` Otherwise please check that Meticulous is running on the ${ref} branch, that it has a 'workflow_dispatch' trigger, and has the appropiate permissions.` +
          ` See ${DOCS_URL} for the correct setup.`
      );
      logger.debug(err);
      return undefined;
    }
    if (isGithubPermissionsError(err)) {
      // https://docs.github.com/en/rest/overview/permissions-required-for-github-apps?apiVersion=2022-11-28#repository-permissions-for-actions
      logger.error(
        `Missing permission to trigger a workflow run on the base branch (${ref}).` +
          ` Visual snapshots of the new flows will be taken, but no comparisons will be made.` +
          ` Please add the 'actions: write' permission to your workflow YAML file: see ${DOCS_URL} for the correct setup.`
      );
      logger.debug(err);
      return undefined;
    }

    logger.error(
      `Could not trigger a workflow run on commit ${shortSha(
        commitSha
      )} of the base branch (${ref}) to compare against.` +
        ` Visual snapshots of the new flows will be taken, but no comparisons will be made.` +
        ` Please check that Meticulous is running on the ${ref} branch, that it has a 'workflow_dispatch' trigger, and has the appropiate permissions.` +
        ` See ${DOCS_URL} for the correct setup.`,
      err
    );
    return undefined;
  }

  // Wait before listing again
  await delay(LISTING_AFTER_DISPATCH_DELAY);

  const newRun = await getPendingWorkflowRun({
    owner,
    repo,
    workflowId,
    commitSha,
    octokit,
  });
  return newRun;
};

export const waitForWorkflowCompletion = async ({
  owner,
  repo,
  workflowRunId,
  octokit,
  timeout,
}: {
  owner: string;
  repo: string;
  workflowRunId: number;
  octokit: InstanceType<typeof GitHub>;
  timeout: Duration;
}): Promise<{
  id: number;
  status: string | null;
  conclusion: string | null;
  [key: string]: unknown;
} | null> => {
  const logger = log.getLogger(METICULOUS_LOGGER_NAME);

  let workflowRun: {
    id: number;
    status: string | null;
    conclusion: string | null;
    [key: string]: unknown;
  } | null = null;

  const start = DateTime.now();

  while (
    (workflowRun == null || isPendingStatus(workflowRun.status)) &&
    DateTime.now().diff(start) < timeout
  ) {
    const workflowRunResult = await octokit.rest.actions.getWorkflowRun({
      owner,
      repo,
      run_id: workflowRunId,
    });
    workflowRun = workflowRunResult.data;
    logger.debug(
      JSON.stringify(
        {
          id: workflowRun.id,
          status: workflowRun.status,
          conclusion: workflowRun.conclusion,
        },
        null,
        2
      )
    );
    // Wait before listing again
    await delay(WORKFLOW_RUN_UPDATE_STATUS_INTERVAL);
  }

  return workflowRun;
};

export const getPendingWorkflowRun = async ({
  owner,
  repo,
  workflowId,
  commitSha,
  octokit,
}: {
  owner: string;
  repo: string;
  workflowId: number;
  commitSha: string;
  octokit: InstanceType<typeof GitHub>;
}): Promise<{ workflowRunId: number; [key: string]: unknown } | undefined> => {
  const logger = log.getLogger(METICULOUS_LOGGER_NAME);
  const listRunsResult = await octokit.rest.actions.listWorkflowRuns({
    owner,
    repo,
    workflow_id: workflowId,
    head_sha: commitSha,
  });
  logger.debug(
    `Workflow runs list: ${JSON.stringify(listRunsResult.data, null, 2)}`
  );
  const workflowRun = listRunsResult.data.workflow_runs.find((run) =>
    isPendingStatus(run.status)
  );
  if (workflowRun == null) {
    return undefined;
  }
  return {
    ...workflowRun,
    workflowRunId: workflowRun.id,
  };
};

export const isPendingStatus = (status: string | null): boolean => {
  return ["in_progress", "queued", "requested", "waiting"].some(
    (pending) => pending === status
  );
};

const delay = async (delay: Duration): Promise<void> => {
  return new Promise<void>((resolve) => setTimeout(resolve, delay.toMillis()));
};
