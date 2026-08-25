import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";
import log from "loglevel";
import { DateTime, Duration } from "luxon";
import { COMMIT_SHA_WORKFLOW_INPUT, DOCS_URL } from "./constants";
import {
  isGithubPermissionsError,
  getDetailedGitHubPermissionsError,
} from "./error.utils";
import { shortSha } from "./logger.utils";

// The GitHub REST API will not list a workflow run immediately after it has been dispatched
const LISTING_AFTER_DISPATCH_DELAY = Duration.fromObject({ seconds: 10 });

// Our clock and GitHub's need not agree, so widen the window we accept a dispatched run in.
export const DISPATCH_CLOCK_SKEW_ALLOWANCE = Duration.fromObject({
  seconds: 30,
});

const MAX_DISPATCHED_RUNS_TO_SEARCH = 20;

// How GitHub refuses a dispatch that names an input the workflow doesn't declare.
const UNEXPECTED_INPUTS_MESSAGE = "Unexpected inputs provided";

const WORKFLOW_RUN_UPDATE_STATUS_INTERVAL = Duration.fromObject({ seconds: 5 });

const WORKFLOW_RUN_SEARCH_COMMIT_INTERVAL = Duration.fromObject({ hours: 1 });

const GITHUB_DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss'Z'";

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

  try {
    const { data } = await octokit.rest.actions.getWorkflowRun({
      owner,
      repo,
      run_id: workflowRunId,
    });
    const workflowId = data.workflow_id;
    return { workflowId };
  } catch (err: unknown) {
    if (isGithubPermissionsError(err)) {
      const detailedError = getDetailedGitHubPermissionsError(err, {
        operation: "get_workflow_run",
        requiredPermissions: ["actions: read"],
      });
      throw new Error(detailedError);
    }
    throw err;
  }
};

export interface WorkflowRunHandle {
  workflowRunId: number;
  [key: string]: unknown;
}

export type StartWorkflowRunResult =
  | { type: "started"; workflowRun: WorkflowRunHandle | undefined }
  | { type: "commit-pinning-unsupported" }
  | { type: "failed" };

export const startNewWorkflowRun = async ({
  owner,
  repo,
  workflowId,
  ref,
  commitSha,
  pinCommitSha,
  octokit,
  logger,
}: {
  owner: string;
  repo: string;
  workflowId: number;
  ref: string;
  commitSha: string;
  /**
   * Ask the workflow to build `commitSha` rather than whatever `ref` currently points at.
   * Only workflows declaring the {@link COMMIT_SHA_WORKFLOW_INPUT} input can honour this;
   * against any other workflow the dispatch is rejected and we report
   * `commit-pinning-unsupported` so the caller can decide whether the branch head will do.
   */
  pinCommitSha: boolean;
  octokit: InstanceType<typeof GitHub>;
  logger: log.Logger;
}): Promise<StartWorkflowRunResult> => {
  const dispatchedAfter = DateTime.utc().minus(DISPATCH_CLOCK_SKEW_ALLOWANCE);
  let dispatchedRun: WorkflowRunHandle | undefined;

  try {
    dispatchedRun = await dispatchAndReadRun({
      owner,
      repo,
      workflowId,
      ref,
      commitSha,
      pinCommitSha,
      octokit,
      logger,
    });
  } catch (err: unknown) {
    const message = (err as { message?: string } | null)?.message ?? "";
    // A workflow that doesn't declare the input is rejected with 422 "Unexpected inputs
    // provided". We key off the status rather than the wording alone so that a rephrasing on
    // GitHub's side degrades to the branch-head behaviour we had before pinning, rather than
    // failing outright.
    const status = (err as { status?: number } | null)?.status;
    if (
      pinCommitSha &&
      (status === 422 || message.includes(UNEXPECTED_INPUTS_MESSAGE))
    ) {
      logger.debug(
        `The Meticulous workflow on '${ref}' did not accept the '${COMMIT_SHA_WORKFLOW_INPUT}' input,` +
          ` so it can only build whatever that branch currently points at. ${message}`
      );
      return { type: "commit-pinning-unsupported" };
    }
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
      return { type: "failed" };
    }
    if (isGithubPermissionsError(err)) {
      // https://docs.github.com/en/rest/overview/permissions-required-for-github-apps?apiVersion=2022-11-28#repository-permissions-for-actions
      const detailedError = getDetailedGitHubPermissionsError(err, {
        operation: "trigger_workflow",
        requiredPermissions: ["actions: write"],
      });
      logger.error(
        `Missing permission to trigger a workflow run on the base branch (${ref}).` +
          ` Visual snapshots of the new flows will be taken, but no comparisons will be made.\n\n${detailedError}`
      );
      logger.debug(err);
      return { type: "failed" };
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
    return { type: "failed" };
  }

  if (dispatchedRun != null) {
    return { type: "started", workflowRun: dispatchedRun };
  }

  // Wait before listing again
  await delay(LISTING_AFTER_DISPATCH_DELAY);

  // A pinned run can't be found by commit: it was dispatched against a branch, so its head_sha
  // is that branch's head rather than the commit it was asked to check out.
  const workflowRun = pinCommitSha
    ? await findRecentlyDispatchedRun({
        owner,
        repo,
        workflowId,
        ref,
        dispatchedAfter,
        octokit,
        logger,
      })
    : await getPendingWorkflowRun({
        owner,
        repo,
        workflowId,
        commitSha,
        octokit,
        logger,
      });

  return { type: "started", workflowRun };
};

/**
 * Dispatches the workflow and reports the run it created, where the API will say.
 *
 * `return_run_details` is what makes it say: without that flag the endpoint answers an empty
 * `204` and the run has to be picked out of a listing afterwards, which is guesswork whenever
 * more than one dispatch lands at once. GitHub Enterprise Server 3.20 and earlier reject
 * unknown body fields, so a refusal sends us round again without the flag — back to guesswork,
 * but that beats failing a dispatch that would otherwise have worked.
 */
const dispatchAndReadRun = async ({
  owner,
  repo,
  workflowId,
  ref,
  commitSha,
  pinCommitSha,
  octokit,
  logger,
}: {
  owner: string;
  repo: string;
  workflowId: number;
  ref: string;
  commitSha: string;
  pinCommitSha: boolean;
  octokit: InstanceType<typeof GitHub>;
  logger: log.Logger;
}): Promise<WorkflowRunHandle | undefined> => {
  const dispatch = {
    owner,
    repo,
    workflow_id: workflowId,
    ref,
    ...(pinCommitSha
      ? { inputs: { [COMMIT_SHA_WORKFLOW_INPUT]: commitSha } }
      : {}),
  };

  try {
    // Assigned before the call so that `return_run_details`, which postdates the
    // @octokit/openapi-types we pin, isn't rejected as an excess property.
    const withRunDetails = { ...dispatch, return_run_details: true };
    return readDispatchedWorkflowRun(
      await octokit.rest.actions.createWorkflowDispatch(withRunDetails)
    );
  } catch (err: unknown) {
    if (!isUnknownBodyFieldRefusal(err)) {
      throw err;
    }
    logger.debug(
      `This GitHub API rejected 'return_run_details', so the run dispatched on '${ref}' will have to be searched for.`
    );
  }

  await octokit.rest.actions.createWorkflowDispatch(dispatch);
  return undefined;
};

/**
 * Whether a dispatch was refused for carrying `return_run_details`, rather than for naming a
 * workflow input the workflow doesn't declare.
 *
 * They have to be told apart by message, not status. A server that validates the body strictly
 * answers `400` on some versions and `422` on others, and `422` is also what an undeclared
 * input produces. Going by status alone, a strict server would look like a workflow that can't
 * be pinned, and we would drop the commit pinning that workflow was perfectly willing to honour.
 */
const isUnknownBodyFieldRefusal = (err: unknown): boolean => {
  const status = (err as { status?: number } | null)?.status;
  if (status === 400) {
    return true;
  }
  const message = (err as { message?: string } | null)?.message ?? "";
  return status === 422 && !message.includes(UNEXPECTED_INPUTS_MESSAGE);
};

/**
 * Reads the run out of a dispatch response. Only there when the request asked for it with
 * `return_run_details` and the API honoured it; otherwise the response is an empty `204`.
 *
 * The `html_url` comes along because the handle is logged for the user to click through to,
 * and this path never lists the run, so this response is the only chance to learn it.
 */
const readDispatchedWorkflowRun = (
  response: unknown
): WorkflowRunHandle | undefined => {
  const data = (
    response as
      | { data?: { workflow_run_id?: unknown; html_url?: unknown } }
      | null
      | undefined
  )?.data;
  if (typeof data?.workflow_run_id !== "number") {
    return undefined;
  }
  return {
    workflowRunId: data.workflow_run_id,
    ...(typeof data.html_url === "string" ? { html_url: data.html_url } : {}),
  };
};

/**
 * The single run this workflow has been asked to start on `ref` since `dispatchedAfter`.
 *
 * Exported because it is also how a caller finds a run someone else dispatched: looking for a
 * dispatch rather than for the commit is the only thing that works when the dispatch was pinned,
 * since such a run is listed under the head of the branch it was dispatched against.
 */
export const findRecentlyDispatchedRun = async ({
  owner,
  repo,
  workflowId,
  ref,
  dispatchedAfter,
  octokit,
  logger,
}: {
  owner: string;
  repo: string;
  workflowId: number;
  ref: string;
  dispatchedAfter: DateTime;
  octokit: InstanceType<typeof GitHub>;
  logger: log.Logger;
}): Promise<WorkflowRunHandle | undefined> => {
  try {
    const { data } = await octokit.rest.actions.listWorkflowRuns({
      owner,
      repo,
      workflow_id: workflowId,
      event: "workflow_dispatch",
      branch: ref,
      per_page: MAX_DISPATCHED_RUNS_TO_SEARCH,
    });
    const candidates = data.workflow_runs.filter(
      (run) => DateTime.fromISO(run.created_at) >= dispatchedAfter
    );
    // Nothing in a run identifies the commit it was asked to build, so with more than one
    // candidate we cannot tell ours apart from a concurrent dispatch. Waiting on the wrong run
    // would have us report a base that was never built, so give up instead.
    if (candidates.length !== 1) {
      logger.warn(
        `Found ${
          candidates.length
        } workflow runs dispatched on '${ref}' since ${dispatchedAfter.toISO()},` +
          ` so cannot tell which one is building the base commit.`
      );
      return undefined;
    }
    const [run] = candidates;
    return { ...run, workflowRunId: run.id };
  } catch (err) {
    logger.warn(
      `Encountered an error while searching for the dispatched workflow run: ${err}`
    );
    return undefined;
  }
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
 * Searches for a pending workflow run on the commit passed in, dispatched within the last hour.
 *
 * Only a run whose `head_sha` is that commit counts. A run on an ancestor built a different tree,
 * so there are no snapshots at this commit to compare against however close the two commits are,
 * and waiting on one leaves the caller believing a base exists that the backend then can't find.
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
    const pendingRun = workflowRuns.find(
      (run) =>
        run.head_sha === commitSha &&
        // Note we ignore runs on PR events because these are actually running on the temporary
        // merge commit created by GitHub so they are not useable for comparisons.
        run.event !== "pull_request" &&
        isPendingStatus(run.status)
    );
    if (pendingRun) {
      return {
        ...pendingRun,
        workflowRunId: pendingRun.id,
      };
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
