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

  if (testRun != null) {
    console.log(`Tests already exist for commit ${base} (${testRun.id})`);
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

  if (
    finalWorkflowRun.status !== "completed" ||
    finalWorkflowRun.conclusion !== "success"
  ) {
    throw new Error(
      `Comparing against screenshots taken on ${baseRef}, but the workflow run on ${baseRef} (run  ${finalWorkflowRun.id}) did not complete successfully. See: ${finalWorkflowRun.html_url}`
    );
  }
};
