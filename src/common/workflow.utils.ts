import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";
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
  logger,
}: {
  owner: string;
  repo: string;
  workflowId: number;
  ref: string;
  commitSha: string;
  octokit: InstanceType<typeof GitHub>;
  logger: log.Logger;
}): Promise<{ workflowRunId: number; [key: string]: unknown } | undefined> => {
  try {
    await octokit.rest.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id: workflowId,
      ref,
    });
  } catch (err: unknown) {
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
    logger,
  });
  return newRun;
};

export const waitForWorkflowCompletion = async ({
  owner,
  repo,
  workflowRunId,
  octokit,
  timeout,
  isCancelled,
  logger,
}: {
  owner: string;
  repo: string;
  workflowRunId: number;
  octokit: InstanceType<typeof GitHub>;
  timeout: Duration;
  isCancelled: () => boolean;
  logger: log.Logger;
}): Promise<{
  id: number;
  status: string | null;
  conclusion: string | null;
  [key: string]: unknown;
} | null> => {
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
    if (isCancelled()) return null;
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
  logger,
}: {
  owner: string;
  repo: string;
  workflowId: number;
  commitSha: string;
  octokit: InstanceType<typeof GitHub>;
  logger: log.Logger;
}): Promise<{ workflowRunId: number; [key: string]: unknown } | undefined> => {
  // Search through original commit and then parents if needed
  return await searchForPendingWorkflowRun({
    owner,
    repo,
    workflowId,
    commitSha,
    octokit,
    logger,
  });
};

/**
 * Searches for a pending workflow run on the specified commit.
 * If none is found, searches through parent commits until either:
 * - we get to a commit that we ran on (regardless of whether it is pending)
 * - we've looked at 20 commits
 * - we get to a commit older than 1 hour
 */
export const searchForPendingWorkflowRun = async ({
  owner,
  repo,
  workflowId,
  commitSha,
  octokit,
  logger,
  depth = 0,
}: {
  owner: string;
  repo: string;
  workflowId: number;
  commitSha: string;
  octokit: InstanceType<typeof GitHub>;
  logger: log.Logger;
  depth?: number;
}): Promise<{ workflowRunId: number; [key: string]: unknown } | undefined> => {
  // The paginate method automatically handles pagination to get all the runs, see more information here:
  // https://github.com/octokit/octokit.js?tab=readme-ov-file#pagination
  const workflowRuns = await octokit.paginate(
    octokit.rest.actions.listWorkflowRuns,
    {
      owner,
      repo,
      workflow_id: workflowId,
      head_sha: commitSha,
      per_page: 100,
    }
  );

  if (workflowRuns.length > 0) {
    logger.debug(`Found workflow runs on commit ${shortSha(commitSha)}`);
    const workflowRun = workflowRuns.find((run) => isPendingStatus(run.status));
    if (workflowRun != null) {
      return {
        ...workflowRun,
        workflowRunId: workflowRun.id,
      };
    }
    return undefined;
  }

  // If we've looked at 20 commits, stop searching
  if (depth >= 20) {
    logger.debug(`Reached maximum depth of 20 commits, stopping search`);
    return undefined;
  }

  try {
    // Get the commit to find its parent and timestamp
    const { data: commit } = await octokit.rest.repos.getCommit({
      owner,
      repo,
      ref: commitSha,
    });

    // Check if the commit is more than one hour old
    const commitDate = DateTime.fromISO(
      commit.commit.author?.date || commit.commit.committer?.date || ""
    );
    const ageInHours = DateTime.now().diff(commitDate, "hours").hours;

    if (ageInHours > 1) {
      logger.debug(
        `Commit ${shortSha(
          commitSha
        )} is more than one hour old (${ageInHours.toFixed(
          2
        )} hours), stopping search`
      );
      return undefined;
    }

    // If no parents, or no first parent, stop the search
    if (!commit.parents || commit.parents.length === 0) {
      logger.debug(
        `Commit ${shortSha(commitSha)} has no parents, stopping search`
      );
      return undefined;
    }

    // Get the first parent commit SHA
    const parentSha = commit.parents[0].sha;
    logger.debug(
      `No pending workflow run found on commit ${shortSha(
        commitSha
      )}, checking parent ${shortSha(parentSha)}`
    );

    // Recursively search for pending workflow runs on the parent commit
    return await searchForPendingWorkflowRun({
      owner,
      repo,
      workflowId,
      commitSha: parentSha,
      octokit,
      logger,
      depth: depth + 1,
    });
  } catch (error) {
    logger.error(
      `Error while retrieving parent commit for ${shortSha(commitSha)}:`,
      error
    );
    return undefined;
  }
};

export const isPendingStatus = (status: string | null): boolean => {
  return ["in_progress", "queued", "requested", "waiting"].some(
    (pending) => pending === status
  );
};

const delay = async (delay: Duration): Promise<void> => {
  return new Promise<void>((resolve) => setTimeout(resolve, delay.toMillis()));
};
