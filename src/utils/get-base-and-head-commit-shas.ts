import { execSync } from "child_process";
import { context } from "@actions/github";
import { CodeChangeEvent } from "../types";

interface BaseAndHeadCommitShas {
  base: string | null;
  head: string;
}

export const getBaseAndHeadCommitShas = async (
  event: CodeChangeEvent
): Promise<BaseAndHeadCommitShas> => {
  if (event.type === "pull_request") {
    const head = event.payload.pull_request.head.sha;
    const base = event.payload.pull_request.base.sha;
    return {
      base: (await tryGetMergeCommitBase(head, base)) ?? base,
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

const tryGetMergeCommitBase = (
  pullRequestHeadSha: string,
  pullRequestBaseSha: string
): string | null => {
  const mergeCommitSha = process.env.GITHUB_SHA;

  if (mergeCommitSha == null) {
    console.error(
      `No GITHUB_SHA environment var set, so can't work out true base of the merge commit. Using the base of the pull request instead (${pullRequestBaseSha}).`
    );
    return null;
  }
  try {
    // The .git directory is owned by a different user. By default git therefore won't let us
    // run git commands on it in case that user has inserted malicious code into the .git directory,
    // which gets executed when we run a git command. However we trust github to not do that, so can
    // mark this directory as safe.
    // See https://medium.com/@thecodinganalyst/git-detect-dubious-ownership-in-repository-e7f33037a8f for more details
    execSync("git config --global --add safe.directory");

    const headCommitSha = execSync("git rev-list --max-count=1 HEAD")
      .toString()
      .trim();
    if (headCommitSha !== mergeCommitSha) {
      console.log(
        `The head commit SHA (${headCommitSha}) does not equal GITHUB_SHA environment variable (${mergeCommitSha}).
          This is likely because a custom ref has been passed to the 'actions/checkout' action. We're assuming therefore
          that the head commit SHA is not a temporary merge commit, but rather the head of the branch. Therefore we're
          using the base of the pull request (${pullRequestBaseSha}) to compare screenshots against, and not the base
          of GitHub's temporary merge commit.`
      );
      return null;
    }

    // --format="%P" outputs just the parents of the commit
    // The GITHUB_SHA is always a merge commit for PRs
    const gitShowResult = execSync(
      `git show ${mergeCommitSha} --format="%P" -q`
    ).toString();
    const parents = gitShowResult.split(" ").map((sha) => sha.trim());

    if (parents.length !== 2) {
      // Note: the GITHUB_SHA is always a merge commit, even if the merge is a no-op because the PR is up to date
      // So this should never happen
      console.error(
        `GITHUB_SHA (${mergeCommitSha}) is not a merge commit, so can't work out true base of the merge commit. Using the base of the pull request instead.`
      );
      return null;
    }

    // The first parent is always the base, and the second parent is the head of the PR
    const mergeBaseSha = parents[0];
    const mergeHeadSha = parents[1];
    if (mergeHeadSha !== pullRequestHeadSha) {
      console.error(
        `The second parent (${parents[1]}) of the GITHUB_SHA merge commit (${mergeCommitSha}) is not equal to the head of the PR (${pullRequestHeadSha}),
        so can not confidently determine the base of the merge commit to compare against. Using the base of the pull request instead (${pullRequestBaseSha}).`
      );
      return null;
    }
    return mergeBaseSha;
  } catch (e) {
    console.error(
      `Error getting base of merge commit (${mergeCommitSha}). Using the base of the pull request instead (${pullRequestBaseSha}).`,
      e
    );
    return null;
  }
};
