import { context } from "@actions/github";
import { createClient, emitTelemetry } from "@alwaysmeticulous/client";
import { getOctokitOrFail } from "./octokit";
import { isLastCommit } from "./utils/is-last-commit";

export const runPostStep = async ({
  apiToken,
  githubToken,
  testSuiteOrProjectId,
  shouldHaveComment,
  headSha,
}: {
  apiToken: string;
  githubToken: string;
  /**
   * The test suite or project ID to use find the comment in the PR.
   */
  testSuiteOrProjectId: string | null;
  shouldHaveComment: boolean;
  headSha?: string;
}): Promise<void> => {
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

  // workflow.data.run_started_at should always be set since the workflow is running, but we need to make the compiler happy
  const workflowStartTime = new Date();
  if (workflow.data.run_started_at) {
    workflowStartTime.setTime(new Date(workflow.data.run_started_at).getTime());
    const timeSinceStart =
      new Date().getTime() - new Date(workflow.data.run_started_at).getTime();
    values["report_diffs_action.job_duration_seconds"] = timeSinceStart / 1000;
  }

  if (
    context.payload.pull_request?.number &&
    shouldHaveComment &&
    (await isLastCommit(octokit))
  ) {
    const prComments = await octokit.rest.issues.listComments({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.payload.pull_request.number,
      per_page: 1000,
    });
    values["report_diffs_action.saw_comment"] = prComments.data.some((c) =>
      isPrCommentFromAction({
        prComment: c,
        testSuiteOrProjectId,
        workflowStartTime,
      })
    )
      ? 1
      : 0;
  }

  const client = createClient({ apiToken });
  await emitTelemetry({
    client,
    values,
    ...(headSha ? { commitSha: headSha } : {}),
  });
};

const isPrCommentFromAction = ({
  prComment,
  testSuiteOrProjectId,
  workflowStartTime,
}: {
  prComment: { body?: string; updated_at: string };
  testSuiteOrProjectId: string | null;
  workflowStartTime: Date;
}): boolean => {
  if (!prComment.body) {
    return false;
  }

  return (
    prComment.body?.includes(getCommentIdentifier(testSuiteOrProjectId)) &&
    new Date(prComment.updated_at).getTime() >= workflowStartTime.getTime()
  );
};

const getCommentIdentifier = (testSuiteOrProjectId: string | null) => {
  return `<!--- alwaysmeticulous/report-diffs-action/status-comment/${testSuiteOrProjectId}`;
};
