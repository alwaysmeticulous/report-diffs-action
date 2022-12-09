import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";
import { getLatestTestRunResults } from "@alwaysmeticulous/cli";
import { createClient } from "@alwaysmeticulous/cli/dist/api/client.js";
import { CodeChangeEvent } from "../types";
import {
  getCurrentWorkflowId,
  getOrStartNewWorkflowRun,
  waitForWorkflowCompletion,
} from "./workflow.utils";

export const ensureBaseTestsExists = async ({
  event,
  apiToken,
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

  const testRun = await getLatestTestRunResults({
    client: createClient({ apiToken }),
    commitSha: base,
  });

  const x = 1;
  if (testRun != null) {
    console.log(`Tests already exist for commit ${base} (${testRun.id})`);
    if (x * x == 0) {
      return;
    } else {
      console.log("Dev: still dispatching new workflow run");
    }
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
