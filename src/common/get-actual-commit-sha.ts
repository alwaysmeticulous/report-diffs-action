import { execFileSync } from "child_process";
import { context } from "@actions/github";
import log from "loglevel";

/**
 * Get the actual commit SHA that we have the code for.
 */
export const getActualCommitShaFromRepo = (): string => {
  return execFileSync("git", ["rev-list", "--max-count=1", "HEAD"])
    .toString()
    .trim();
};

/**
 * Like `getActualCommitShaFromRepo`, but falls back to the `GITHUB_SHA` from the
 * GitHub Actions context if the git repo isn't available (e.g. in a job that
 * downloads a pre-built artifact without running `actions/checkout`).
 *
 * Returns `null` only if neither source yields a SHA.
 */
export const getActualCommitShaFromRepoOrContext = (
  logger: log.Logger
): string | null => {
  try {
    return getActualCommitShaFromRepo();
  } catch (error) {
    const fallback = context.sha;
    if (fallback) {
      logger.info(
        `Could not read HEAD from a git repository (${
          error instanceof Error ? error.message : error
        }). Falling back to GITHUB_SHA (${fallback}).`
      );
      return fallback;
    }
    logger.error(
      `Could not read HEAD from a git repository and GITHUB_SHA is not set. Error: ${error}`
    );
    return null;
  }
};
