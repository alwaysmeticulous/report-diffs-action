import { getOctokit } from "@actions/github";
import log from "loglevel";
import { CodeChangeEvent } from "../types";
import { DOCS_URL } from "./constants";
import {
  DEFAULT_FAILED_OCTOKIT_REQUEST_MESSAGE,
  isGithubPermissionsError,
} from "./error.utils";

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
  logger,
}: {
  octokit: ReturnType<typeof getOctokit>;
  event: CodeChangeEvent;
  owner: string;
  repo: string;
  body: string;
  shortHeadSha: string;
  testSuiteId: string | null;
  createIfDoesNotExist?: boolean;
  logger: log.Logger;
}) => {
  if (event.type !== "pull_request") {
    return;
  }

  // Check for existing comments
  try {
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
    const testSuiteDescription = testSuiteId
      ? `Test suite: ${testSuiteId}. `
      : "";

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
  } catch (err) {
    if (isGithubPermissionsError(err)) {
      // https://docs.github.com/en/rest/overview/permissions-required-for-github-apps?apiVersion=2022-11-28#repository-permissions-for-pull-requests
      throw new Error(
        `Missing permission to list and post comments to the pull request #${event.payload.pull_request.number}. Please add the 'pull-requests: write' permission to your workflow YAML file: see ${DOCS_URL} for the correct setup.`
      );
    }
    logger.error(
      `Unable to post / update comment on PR #${event.payload.pull_request.number}. ${DEFAULT_FAILED_OCTOKIT_REQUEST_MESSAGE}`
    );
    throw err;
  }
};
