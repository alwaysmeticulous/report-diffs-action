import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";
import { CodeChangeEvent } from "../types";
import {
  getCurrentWorkflowId,
  getOrStartNewWorkflowRun,
  waitForWorkflowCompletion,
} from "./workflow.utils";

export const ensureBaseTestsExists = async ({
  event,
  base,
  context,
  octokit,
}: {
  event: CodeChangeEvent;
  apiToken: string;
  base: string | null;
  context: Context;
  octokit: InstanceType<typeof GitHub>;
}): Promise<void> => {
  // Running missing tests on base is only supported for Pull Request events
  if (event.type !== "pull_request" || !base) {
    return;
  }

  const { workflowId } = await getCurrentWorkflowId({ context, octokit });
  const { owner, repo } = context.repo;
  const baseRef = event.payload.pull_request.base.ref;

  const workflowRun = await getOrStartNewWorkflowRun({
    owner,
    repo,
    workflowId,
    ref: baseRef,
    commitSha: base,
    octokit,
  });
  console.log(JSON.stringify({ id: workflowRun?.workflowRunId }, null, 2));

  if (workflowRun == null) {
    throw new Error(`Could not retrieve dispatched workflow run`);
  }

  console.log(`Waiting on workflow run: ${workflowRun.html_url}`);
  const finalWorkflowRun = await waitForWorkflowCompletion({
    owner,
    repo,
    workflowRunId: workflowRun.workflowRunId,
    octokit,
  });

  console.log(JSON.stringify(finalWorkflowRun, null, 2));

  if (
    finalWorkflowRun.status !== "completed" ||
    finalWorkflowRun.conclusion !== "success"
  ) {
    throw new Error(
      `Workflow run ${finalWorkflowRun.id} id not complete successfully. See: ${finalWorkflowRun.html_url}`
    );
  }
};
