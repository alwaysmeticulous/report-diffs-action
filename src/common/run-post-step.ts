import { getInput } from "@actions/core";
import { context } from "@actions/github";
import { createClient } from "@alwaysmeticulous/client";
import { getInputFromEnv } from "./get-input-from-env";
import { getOctokitOrFail } from "./octokit";

export const runPostStep = async (): Promise<void> => {
  const apiToken = getActionInput("api-token");
  const githubToken = getActionInput("github-token");
  const octokit = getOctokitOrFail(githubToken);
  const workflow = await octokit.rest.actions.getWorkflowRun({
    owner: context.repo.owner,
    repo: context.repo.repo,
    run_id: context.runId,
  });

  const values: Record<string, number> = {
    "report_diffs_action.was_cancelled":
      workflow.data.status === "cancelled" ? 1 : 0,
  };

  // This should always be true since the workflow is running, but we need to check it to make the compiler happy
  if (workflow.data.run_started_at) {
    const timeSinceStart =
      new Date().getTime() - new Date(workflow.data.run_started_at).getTime();
    values["report_diffs_action.job_duration_seconds"] = timeSinceStart / 1000;
  }

  if (context.payload.pull_request?.number) {
    const shortSha = context.sha.slice(0, 7);
    const prComments = await octokit.rest.issues.listComments({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.payload.pull_request.number,
    });
    values["report_diffs_action.saw_comment"] = prComments.data.some(
      (c) =>
        c.body?.includes("alwaysmeticulous/report-diffs-action") &&
        c.body?.includes(shortSha)
    )
      ? 1
      : 0;
  }

  const client = createClient({ apiToken });
  await client.post("test-runs/telemetry", { values });
};

const getActionInput = (name: string) => {
  return (
    getInput(name) ||
    getInputFromEnv({
      name: name,
      required: true,
      type: "string",
    })
  );
};
