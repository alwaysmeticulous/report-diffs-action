import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";

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

export const getOrStartNewWorkflowRun = async ({
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
  // const listRunsResult = await octokit.rest.actions.listWorkflowRuns({
  //   owner,
  //   repo,
  //   workflow_id: workflowId,
  //   head_sha: commitSha,
  // });
  // console.log(JSON.stringify(listRunsResult, null, 2));
  const alreadyPending = await getPendingWorkflowRun({
    owner,
    repo,
    workflowId,
    commitSha,
    octokit,
  });
  if (alreadyPending != null) {
    return alreadyPending;
  }

  await octokit.rest.actions.createWorkflowDispatch({
    owner,
    repo,
    workflow_id: workflowId,
    ref,
  });
  const newRun = await getPendingWorkflowRun({
    owner,
    repo,
    workflowId,
    commitSha,
    octokit,
  });
  if (newRun == null) {
    console.log("Could not find the dispatched workflow run!!!");
  }
  return newRun;
};

const getPendingWorkflowRun = async ({
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
  const listRunsResult = await octokit.rest.actions.listWorkflowRuns({
    owner,
    repo,
    workflow_id: workflowId,
    head_sha: commitSha,
  });
  console.log("vvvvv Workflow runs vvvvv");
  listRunsResult.data.workflow_runs
    .map(({ id, status, conclusion, head_sha }) => ({
      id,
      status,
      conclusion,
      head_sha,
    }))
    .forEach((item) => {
      console.log(JSON.stringify(item, null, 2));
    });
  console.log("^^^^^ Workflow runs ^^^^^");
  const workflowRun = listRunsResult.data.workflow_runs.find((run) =>
    ["in_progress", "queued", "requested", "waiting"].some(
      (status) => run.status === status
    )
  );
  if (workflowRun == null) {
    return undefined;
  }
  return {
    ...workflowRun,
    workflowRunId: workflowRun.id,
  };
};
