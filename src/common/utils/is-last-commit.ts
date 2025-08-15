import { context } from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";

export const isLastCommit = async (octokit: InstanceType<typeof GitHub>) => {
  if (!context.payload.pull_request) {
    return true;
  }

  const pullRequest = context.payload.pull_request;
  const currentCommit = pullRequest.head.sha;
  const headRef = pullRequest.head.ref;

  const commits = await octokit.rest.repos.listCommits({
    owner: context.repo.owner,
    repo: context.repo.repo,
    sha: headRef,
    per_page: 1,
  });

  return commits.data[0].sha === currentCommit;
};
