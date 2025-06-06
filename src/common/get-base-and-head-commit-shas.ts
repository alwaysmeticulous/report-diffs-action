import { execSync } from "child_process";
import { context } from "@actions/github";
import log from "loglevel";
import { CodeChangeEvent } from "../types";

interface BaseAndHeadCommitShas {
  base: string | null;
  head: string;
}

/**
 * Get the base commit that we should compare the visual snapshots against, and the head commit to associate
 * the status check with.
 *
 * WARNING: The head commit here is _not_ guaranteed to be the one we have the code for! For a PR checked out
 * in the default way it will be the head of the PR branch, but the code checked out will be the temporary
 * merge commit. If you need the actual commit that we have the code for, use the `getActualCommitShaFromRepo`
 * function.
 */
export const getBaseAndHeadCommitShas = async (
  event: CodeChangeEvent,
  options: {
    useDeploymentUrl: boolean;
  },
  logger: log.Logger
): Promise<BaseAndHeadCommitShas> => {
  if (event.type === "pull_request") {
    const head = event.payload.pull_request.head.sha;
    const base = event.payload.pull_request.base.sha;
    const baseRef = event.payload.pull_request.base.ref;
    if (options.useDeploymentUrl) {
      // Vercel deploys the head commit of the PR, not the github temporary merge commit
      // The PR base can sometimes point to a commit ahead of the merge-base of the head commit
      // (I believe it's based on the github temporary merge commit)
      return {
        base:
          (await tryGetMergeBaseOfHeadCommit(head, base, baseRef, logger)) ??
          base,
        head,
      };
    }
    return {
      base:
        (await tryGetMergeBaseOfTemporaryMergeCommit(
          head,
          base,
          baseRef,
          logger
        )) ?? base,
      head,
    };
  }
  if (event.type === "push") {
    return {
      base: event.payload.before,
      head: event.payload.after,
    };
  }
  if (event.type === "workflow_dispatch") {
    return {
      base: null,
      head: context.sha,
    };
  }
  return assertNever(event);
};

const assertNever = (event: never): never => {
  throw new Error("Unexpected event: " + JSON.stringify(event));
};

const tryGetMergeBaseOfHeadCommit = (
  pullRequestHeadSha: string,
  pullRequestBaseSha: string,
  baseRef: string,
  logger: log.Logger
): string | null => {
  try {
    markGitDirectoryAsSafe();
    // Only a single commit is fetched by the checkout action by default
    // (https://github.com/actions/checkout#checkout-v3)
    // We therefore run fetch with the `--unshallow` param to fetch the whole branch/commit ancestor chains, which merge-base needs
    execSync(`git fetch origin ${pullRequestHeadSha} --unshallow`);
    execSync(`git fetch origin ${baseRef}`);
    const mergeBase = execSync(
      `git merge-base ${pullRequestHeadSha} origin/${baseRef}`
    )
      .toString()
      .trim();

    if (!isValidGitSha(mergeBase)) {
      // Note: the GITHUB_SHA is always a merge commit, even if the merge is a no-op because the PR is up to date
      // So this should never happen
      logger.error(
        `Failed to get merge base of ${pullRequestHeadSha} and ${baseRef}: value returned by 'git merge-base' was not a valid git SHA ('${mergeBase}').` +
          `Using the base of the pull request instead (${pullRequestBaseSha}).`
      );
      return null;
    }

    return mergeBase;
  } catch (error) {
    logger.error(
      `Failed to get merge base of ${pullRequestHeadSha} and ${baseRef}. Error: ${error}. Using the base of the pull request instead (${pullRequestBaseSha}).`
    );
    return null;
  }
};

/**
 * Get the actual commit SHA that we have the code for.
 */
export const getActualCommitShaFromRepo = (): string => {
  return execSync("git rev-list --max-count=1 HEAD").toString().trim();
};

const tryGetMergeBaseOfTemporaryMergeCommit = (
  pullRequestHeadSha: string,
  pullRequestBaseSha: string,
  pullRequestBaseRef: string,
  logger: log.Logger
): string | null => {
  const mergeCommitSha = process.env.GITHUB_SHA;

  if (mergeCommitSha == null) {
    logger.error(
      `No GITHUB_SHA environment var set, so can't work out true base of the merge commit. Using the base of the pull request instead (${pullRequestBaseSha}).`
    );
    return null;
  }
  try {
    markGitDirectoryAsSafe();

    const headCommitSha = getActualCommitShaFromRepo();
    if (headCommitSha !== mergeCommitSha) {
      logger.info(
        `The head commit SHA (${headCommitSha}) does not equal GITHUB_SHA environment variable (${mergeCommitSha}).
          This is likely because a custom ref has been passed to the 'actions/checkout' action. We're assuming therefore
          that the head commit SHA is not a temporary merge commit, but rather the head of the branch. Therefore we're
          using the branching point of the PR branch to compare the visual snapshots against, and not the base
          of GitHub's temporary merge commit.`
      );
      return tryGetMergeBaseOfHeadCommit(
        headCommitSha,
        pullRequestBaseSha,
        pullRequestBaseRef,
        logger
      );
    }

    // The GITHUB_SHA is always a merge commit for PRs
    const parents = execSync(`git cat-file -p ${mergeCommitSha}`)
      .toString()
      .split("\n")
      .filter((line) => line.startsWith("parent "))
      .map((line) => line.substring("parent ".length).trim());

    if (parents.length !== 2) {
      // Note: the GITHUB_SHA is always a merge commit, even if the merge is a no-op because the PR is up to date
      // So this should never happen
      logger.error(
        `GITHUB_SHA (${mergeCommitSha}) is not a merge commit, so can't work out true base of the merge commit. Using the base of the pull request instead.`
      );
      return null;
    }

    // The first parent is always the base, and the second parent is the head of the PR
    const mergeBaseSha = parents[0];
    const mergeHeadSha = parents[1];
    if (mergeHeadSha !== pullRequestHeadSha) {
      logger.error(
        `The second parent (${parents[1]}) of the GITHUB_SHA merge commit (${mergeCommitSha}) is not equal to the head of the PR (${pullRequestHeadSha}),
        so can not confidently determine the base of the merge commit to compare against. Using the base of the pull request instead (${pullRequestBaseSha}).`
      );
      return null;
    }
    return mergeBaseSha;
  } catch (e) {
    logger.error(
      `Error getting base of merge commit (${mergeCommitSha}). Using the base of the pull request instead (${pullRequestBaseSha}).`,
      e
    );
    return null;
  }
};

const markGitDirectoryAsSafe = () => {
  // The .git directory is owned by a different user. By default git therefore won't let us
  // run git commands on it in case that user has inserted malicious code into the .git directory,
  // which gets executed when we run a git command. However we trust github to not do that, so can
  // mark this directory as safe.
  // See https://medium.com/@thecodinganalyst/git-detect-dubious-ownership-in-repository-e7f33037a8f for more details
  execSync(`git config --global --add safe.directory "${process.cwd()}"`);
};

const isValidGitSha = (sha: string): boolean => {
  return /^[a-f0-9]{40}$/.test(sha);
};
