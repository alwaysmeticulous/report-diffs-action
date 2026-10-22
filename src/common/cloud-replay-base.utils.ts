import {
  createClient,
  getGitHubCloudReplayBaseTestRun,
  GitHubBaseTestRunResponse,
  TestRun,
} from "@alwaysmeticulous/client";
import log from "loglevel";

/**
 * Asks the backend which commit it would compare this head commit against, and whether it
 * already has a test run for it.
 */
export const getCloudReplayBaseTestRun = async ({
  apiToken,
  headCommitSha,
}: {
  apiToken: string;
  headCommitSha: string;
}): Promise<GitHubBaseTestRunResponse> => {
  const client = createClient({ apiToken });
  return await getGitHubCloudReplayBaseTestRun({
    client,
    headCommitSha,
  });
};

/**
 * The base test run the backend would use for this head commit, if it already has one.
 *
 * This sees bases a lookup on the merge base can't: where a project is configured for it, the
 * backend falls back to an older tested ancestor when nothing has run at the merge base itself.
 * Building the base in that case spends CI on a comparison the backend was going to make anyway.
 *
 * Answers `null` whenever we can't get a confident yes, so that the caller carries on with
 * whatever the merge base lookup told it:
 *
 * - the endpoint is only meaningful for projects with cloud replay enabled and rejects the rest
 *   outright, and it is not this function's place to fail a run over that;
 * - outside a pull request the backend will hand back an arbitrary recent run that it keeps for
 *   flake detection, which is not a base to skip a build over.
 *
 * A `baseCommitSha` older than `baseSha` with no `baseTestRun` is also a yes: it means the
 * backend fell back to an older commit whose stored build it can re-run on demand (the same
 * reasoning the callers' `getBaseTestRun` uses for not filtering by environment version), so
 * we check whether that commit was ever tested rather than build the merge base it replaced.
 * Callers omit `getTestRunAtCommit` when the commit they upload isn't the one the backend
 * resolved the base for — a custom checkout of something other than the pull request head —
 * because then the backend's `baseCommitSha` may not be a valid base for the uploaded commit.
 */
export const getBaseTestRunResolvedByBackend = async ({
  apiToken,
  headCommitSha,
  baseSha,
  getTestRunAtCommit,
  logger,
}: {
  apiToken: string;
  headCommitSha: string;
  baseSha: string;
  getTestRunAtCommit?: (options: {
    baseSha: string;
  }) => Promise<TestRun | null>;
  logger: log.Logger;
}): Promise<TestRun | null> => {
  try {
    const { baseTestRun, baseCommitSha, commitIsInPullRequest } =
      await getCloudReplayBaseTestRun({ apiToken, headCommitSha });
    if (!commitIsInPullRequest) {
      return null;
    }
    if (baseTestRun != null) {
      return baseTestRun;
    }
    if (
      getTestRunAtCommit != null &&
      baseCommitSha != null &&
      baseCommitSha !== baseSha
    ) {
      const run = await getTestRunAtCommit({ baseSha: baseCommitSha });
      if (run != null) {
        logger.info(
          `The backend will compare against ${baseCommitSha}, which already has a build it can re-run (${run.id}), so not building ${baseSha}`
        );
        return run;
      }
    }
    return null;
  } catch (error) {
    logger.debug(
      `Could not ask which base commit ${headCommitSha} would be compared against: ${error}`
    );
    return null;
  }
};
