import { execFileSync } from "child_process";
import { context } from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";
import log from "loglevel";
import { CodeChangeEvent } from "../types";
import { getActualCommitShaFromRepo } from "./get-actual-commit-sha";
import { tryGetMergeBaseViaCompareApi } from "./get-merge-base-via-compare-api";

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
    octokit: InstanceType<typeof GitHub>;
  },
  logger: log.Logger
): Promise<BaseAndHeadCommitShas> => {
  if (event.type === "pull_request") {
    const head = event.payload.pull_request.head.sha;
    const base = event.payload.pull_request.base.sha;
    const baseRef = event.payload.pull_request.base.ref;
    const mergeBaseOpts = {
      pullRequestHeadSha: head,
      pullRequestBaseSha: base,
      baseRef,
      octokit: options.octokit,
      logger,
    };
    if (options.useDeploymentUrl) {
      // Vercel deploys the head commit of the PR, not the github temporary merge commit
      // The PR base can sometimes point to a commit ahead of the merge-base of the head commit
      // (I believe it's based on the github temporary merge commit)
      return {
        base:
          (await tryGetMergeBaseViaCompareApi({
            headSha: head,
            baseRef,
            pullRequestBaseSha: base,
            octokit: options.octokit,
            logger,
          })) ?? base,
        head,
      };
    }
    return {
      base:
        (await tryGetMergeBaseOfTemporaryMergeCommit(mergeBaseOpts)) ?? base,
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

interface MergeBaseOpts {
  pullRequestHeadSha: string;
  pullRequestBaseSha: string;
  baseRef: string;
  octokit: InstanceType<typeof GitHub>;
  logger: log.Logger;
}

const tryGetMergeBaseOfTemporaryMergeCommit = async ({
  pullRequestHeadSha,
  pullRequestBaseSha,
  baseRef,
  octokit,
  logger,
}: MergeBaseOpts): Promise<string | null> => {
  const mergeBaseFromCompare = (headSha: string) =>
    tryGetMergeBaseViaCompareApi({
      headSha,
      baseRef,
      pullRequestBaseSha,
      octokit,
      logger,
    });

  const mergeCommitSha = process.env.GITHUB_SHA;
  if (mergeCommitSha == null) {
    return mergeBaseFromCompare(pullRequestHeadSha);
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
      return mergeBaseFromCompare(headCommitSha);
    }

    // The GITHUB_SHA is always a merge commit for PRs
    const parents = execFileSync("git", ["cat-file", "-p", mergeCommitSha])
      .toString()
      .split("\n")
      .filter((line) => line.startsWith("parent "))
      .map((line) => line.substring("parent ".length).trim());

    if (parents.length !== 2) {
      // Note: the GITHUB_SHA is always a merge commit, even if the merge is a no-op because the PR is up to date
      // So this should never happen
      logger.error(
        `GITHUB_SHA (${mergeCommitSha}) is not a merge commit, so can't work out true base of the merge commit from its parents. Falling back to the GitHub compare API.`
      );
      return mergeBaseFromCompare(pullRequestHeadSha);
    }

    // The first parent is always the base, and the second parent is the head of the PR
    const mergeBaseSha = parents[0];
    const mergeHeadSha = parents[1];
    if (mergeHeadSha !== pullRequestHeadSha) {
      logger.error(
        `The second parent (${parents[1]}) of the GITHUB_SHA merge commit (${mergeCommitSha}) is not equal to the head of the PR (${pullRequestHeadSha}),
        so can not confidently determine the base of the merge commit from its parents. Falling back to the GitHub compare API.`
      );
      return mergeBaseFromCompare(pullRequestHeadSha);
    }
    return mergeBaseSha;
  } catch (e) {
    logger.info(
      `Could not read the merge commit (${mergeCommitSha}) from the local git repository (${e}). Falling back to the GitHub compare API.`
    );
    return mergeBaseFromCompare(pullRequestHeadSha);
  }
};

const markGitDirectoryAsSafe = () => {
  // The .git directory is owned by a different user. By default git therefore won't let us
  // run git commands on it in case that user has inserted malicious code into the .git directory,
  // which gets executed when we run a git command. However we trust github to not do that, so can
  // mark this directory as safe.
  // See https://medium.com/@thecodinganalyst/git-detect-dubious-ownership-in-repository-e7f33037a8f for more details
  execFileSync("git", [
    "config",
    "--global",
    "--add",
    "safe.directory",
    process.cwd(),
  ]);
};
