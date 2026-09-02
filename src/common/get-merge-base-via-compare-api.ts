import { context } from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";
import log from "loglevel";
import {
  getDetailedGitHubPermissionsError,
  isGithubPermissionsError,
} from "./error.utils";

export const tryGetMergeBaseViaCompareApi = async ({
  headSha,
  baseRef,
  pullRequestBaseSha,
  octokit,
  logger,
}: {
  headSha: string;
  baseRef: string;
  pullRequestBaseSha: string;
  octokit: InstanceType<typeof GitHub>;
  logger: log.Logger;
}): Promise<string | null> => {
  const { owner, repo } = context.repo;
  try {
    const { data } = await octokit.rest.repos.compareCommits({
      owner,
      repo,
      base: baseRef,
      head: headSha,
    });
    const mergeBase = data.merge_base_commit?.sha;
    if (mergeBase == null || !isValidGitSha(mergeBase)) {
      logger.error(
        `Failed to get merge base of ${headSha} and ${baseRef} via the GitHub compare API: merge_base_commit.sha was not a valid git SHA ('${mergeBase}').` +
          ` Using the base of the pull request instead (${pullRequestBaseSha}).`
      );
      return null;
    }
    return mergeBase;
  } catch (error) {
    if (isGithubPermissionsError(error)) {
      const detailedError = getDetailedGitHubPermissionsError(error, {
        operation: "compare_commits",
        requiredPermissions: ["contents: read"],
      });
      logger.error(
        `Missing permission to compare ${headSha} with ${baseRef}. This is required in order to calculate the merge base.\n\n${detailedError}`
      );
      return null;
    }
    logger.error(
      `Failed to get merge base of ${headSha} and ${baseRef} via the GitHub compare API. Error: ${error}. Using the base of the pull request instead (${pullRequestBaseSha}).`
    );
    return null;
  }
};

const isValidGitSha = (sha: string): boolean => {
  return /^[a-f0-9]{40}$/.test(sha);
};
