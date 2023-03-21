import { getOctokit } from "@actions/github";
import { CodeChangeEvent } from "../types";

const getMeticulousCommentIdentifier = (testSuiteId: string | null) =>
  `<!--- alwaysmeticulous/report-diffs-action/status-comment${
    testSuiteId ? "/" + testSuiteId : ""
  } -->`;

export const updateStatusComment = async ({
  octokit,
  event,
  owner,
  repo,
  body,
  shortHeadSha,
  testSuiteId,
  createIfDoesNotExist,
}: {
  octokit: ReturnType<typeof getOctokit>;
  event: CodeChangeEvent;
  owner: string;
  repo: string;
  body: string;
  shortHeadSha: string;
  testSuiteId: string | null;
  createIfDoesNotExist?: boolean;
}) => {
  if (event.type !== "pull_request") {
    return;
  }

  // Check for existing comments
  const comments = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: event.payload.pull_request.number,
    per_page: 1000,
  });
  const commentIdentifier = getMeticulousCommentIdentifier(testSuiteId);
  const existingComment = comments.data.find(
    (comment) => (comment.body ?? "").indexOf(commentIdentifier) > -1
  );
  const testSuiteDescription = testSuiteId ? `Test suite: ${testSuiteId}.` : "";

  const fullBody = `${body}\n\n<sub>${testSuiteDescription}Last updated for commit ${shortHeadSha}. This comment will update as new commits are pushed.</sub>${commentIdentifier}`;

  if (existingComment != null) {
    await octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: existingComment.id,
      body: fullBody,
    });
  } else if (createIfDoesNotExist) {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: event.payload.pull_request.number,
      body: fullBody,
    });
  }
};
