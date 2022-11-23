import { getOctokit } from "@actions/github";
import { CodeChangeEvent } from "../types";
const METICULOUS_COMMENT_IDENTIFIER =
  "<!--- alwaysmeticulous/report-diffs-action/status-comment -->";

export const updateStatusComment = async ({
  octokit,
  event,
  owner,
  repo,
  body,
  createIfDoesNotExist,
}: {
  octokit: ReturnType<typeof getOctokit>;
  event: CodeChangeEvent;
  owner: string;
  repo: string;
  body: string;
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
  const existingComment = comments.data.find(
    (comment) =>
      (comment.body ?? "").indexOf(METICULOUS_COMMENT_IDENTIFIER) > -1
  );

  if (existingComment == null && createIfDoesNotExist) {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: event.payload.pull_request.number,
      body: `${body}${METICULOUS_COMMENT_IDENTIFIER}`,
    });
    return;
  }

  await octokit.rest.issues.updateComment({
    owner,
    repo,
    comment_id: existingComment.id,
    body: `${body}${METICULOUS_COMMENT_IDENTIFIER}`,
  });
};
