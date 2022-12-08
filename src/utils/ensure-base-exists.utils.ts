import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";
import { CodeChangeEvent } from "../types";
import {
  getCurrentWorkflowId,
  getOrStartNewWorkflowRun,
} from "./workflow.utils";

export const ensureBaseTestsExists = async ({
  event,
  // apiToken,
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

  // const testRun = await getLatestTestRunResults({
  //   client: createClient({ apiToken }),
  //   commitSha: base,
  // });

  // if (testRun != null) {
  //   console.log(`Tests already exist for commit ${base} (${testRun.id})`);
  //   return;
  // }

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
  console.log(JSON.stringify(workflowRun, null, 2));

  throw new Error("TODO");
};
