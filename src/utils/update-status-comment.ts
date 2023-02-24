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
  shortHeadSha,
  createIfDoesNotExist,
}: {
  octokit: ReturnType<typeof getOctokit>;
  event: CodeChangeEvent;
  owner: string;
  repo: string;
  body: string;
  shortHeadSha: string;
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

  const fullBody = `${body}[^1]\n\n[^1]:Last updated for commit ${shortHeadSha}. This comment will update as new commits are pushed.${METICULOUS_COMMENT_IDENTIFIER}`;

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
