import { getOctokit } from "@actions/github";
import { CodeChangePayload } from "../types";

export const getBaseAndHeadCommitShas = async ({
  owner,
  repo,
  payload,
  octokit,
}: {
  owner: string;
  repo: string;
  payload: CodeChangePayload;
  octokit: ReturnType<typeof getOctokit>;
}): Promise<string> => {
  if (payload.action === "pull_request") {
    const pullRequest = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: payload.pull_request.number,
    });
    return pullRequest.data.base.sha;
  } else if (payload.action === "push") {
    return payload.before;
  } else {
    return assertNever(payload);
  }
};

const assertNever = (payload: never): never => {
  throw new Error("Unexpected payload: " + JSON.stringify(payload));
};
