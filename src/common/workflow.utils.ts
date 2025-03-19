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

const WORKFLOW_RUN_SEARCH_COMMIT_INTERVAL = Duration.fromObject({ hours: 1 });

const GITHUB_DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss'Z'";

const MAX_COMMITS_TO_SEARCH = 500;

const MAX_WORKFLOW_RUNS_TO_SEARCH = 500;

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

/**
 * Searches for a pending workflow in the commit passed in or one of it's parents
 * within the last hour.
 */
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
  try {
    const since = DateTime.utc()
      .minus(WORKFLOW_RUN_SEARCH_COMMIT_INTERVAL)
      .toFormat(GITHUB_DATE_FORMAT);
    const commitResponses = octokit.paginate.iterator(
      octokit.rest.repos.listCommits,
      {
        owner,
        repo,
        per_page: 100,
        sha: commitSha,
        since,
      }
    );
    const commits: Awaited<
      ReturnType<typeof octokit.rest.repos.listCommits>
    >["data"] = [];
    for await (const commitResponse of commitResponses) {
      commits.push(...commitResponse.data);
      if (commits.length >= MAX_COMMITS_TO_SEARCH) break;
    }
    const workflowRunsResponses = octokit.paginate.iterator(
      octokit.rest.actions.listWorkflowRuns,
      {
        owner,
        repo,
        workflow_id: workflowId,
        per_page: 100,
        created: `>${since}`,
      }
    );
    const workflowRuns: Awaited<
      ReturnType<typeof octokit.rest.actions.listWorkflowRuns>
    >["data"]["workflow_runs"] = [];
    for await (const workflowRunResponse of workflowRunsResponses) {
      workflowRuns.push(...workflowRunResponse.data);
      if (workflowRuns.length >= MAX_WORKFLOW_RUNS_TO_SEARCH) break;
    }
    let shaToCheck = commitSha;
    while (shaToCheck) {
      const workflowRunsForCommit = workflowRuns.filter(
        (run) => run.head_sha === shaToCheck
      );
      if (workflowRunsForCommit.length > 0) {
        // We've found a commit that we ran on. If there's a pending run, return it.
        // In any case we can stop searching.
        const pendingRun = workflowRunsForCommit.find((run) =>
          isPendingStatus(run.status)
        );
        if (pendingRun) {
          return {
            ...pendingRun,
            workflowRunId: pendingRun.id,
          };
        }
        return undefined;
      }
      // If we don't find a workflow on the commit passed in, we search through the parents as the
      // workflow may be selectively executed. Note we _always_ check the commit passed in first,
      // which may be one that's older than an hour ago but that we just triggered a workflow on.
      const commit = commits.find((c) => c.sha === shaToCheck);
      if (!commit) {
        // This must mean the commit is older than an hour ago, so we can stop searching.
        return undefined;
      }
      if (commit.parents.length === 0) {
        // We've reached the root commit, so we can stop searching.
        return undefined;
      }
      shaToCheck = commit.parents[0].sha;
    }
    return undefined;
  } catch (err) {
    logger.warn(
      `Encountered an error while searching for a pending workflow run: ${err}`
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
