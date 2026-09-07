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
 * How to resolve the commit a pull request's visual snapshots are compared against.
 *
 * `merge-base-of-pull-request-head` is for callers whose head artifact is the unmerged pull
 * request head — a Vercel deployment, say — so the commit to compare against is where that
 * branch left the base branch.
 *
 * The `first-parent-of-merge-commit` modes are for callers whose head artifact is built from
 * GitHub's temporary merge commit, as a default `actions/checkout` produces. The commit that
 * merge was made onto is its first parent, which is the base branch tip GitHub merged the head
 * into rather than the branching point of the pull request, and the two differ on any pull
 * request whose branch is behind its base branch. The modes differ only in where the parents are
 * read from: `via-local-git` needs a checked-out repository, `via-github-api` does not, so a step
 * running before checkout can resolve the same commit a later step in the job will.
 */
export type BaseCommitResolution =
  | "merge-base-of-pull-request-head"
  | "first-parent-of-merge-commit-via-local-git"
  | "first-parent-of-merge-commit-via-github-api";

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
    baseCommitResolution: BaseCommitResolution;
    octokit: InstanceType<typeof GitHub>;
    /**
     * When `baseCommitResolution` is `merge-base-of-pull-request-head`, the
     * commit compared against the base branch. Defaults to the pull request
     * head. Pass the SHA a later checkout will land on when that is not the
     * pull request head (and is not the temporary merge commit).
     */
    compareHeadSha?: string;
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
    const resolveBase = (): Promise<string | null> => {
      switch (options.baseCommitResolution) {
        case "merge-base-of-pull-request-head":
          // Vercel deploys the head commit of the PR, not the github temporary merge commit, so
          // the commit to compare against is where the PR branch left the base branch. The PR's
          // own `base.sha` is the base branch tip, which is ahead of that branching point
          // whenever the branch is behind, so it only serves as a fallback.
          return tryGetMergeBaseViaCompareApi({
            headSha: options.compareHeadSha ?? head,
            baseRef,
            pullRequestBaseSha: base,
            octokit: options.octokit,
            logger,
          });
        case "first-parent-of-merge-commit-via-local-git":
          return tryGetFirstParentOfMergeCommitViaLocalGit(mergeBaseOpts);
        case "first-parent-of-merge-commit-via-github-api":
          return tryGetFirstParentOfMergeCommitViaGithubApi(mergeBaseOpts);
        default:
          // Falling through to a resolver that was not asked for would change which commit the
          // comparison runs against, so an unhandled mode has to fail loudly.
          return assertNever(
            options.baseCommitResolution,
            "base commit resolution"
          );
      }
    };
    return {
      base: (await resolveBase()) ?? base,
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
  return assertNever(event, "event");
};

const assertNever = (value: never, description: string): never => {
  throw new Error(`Unexpected ${description}: ` + JSON.stringify(value));
};

interface MergeBaseOpts {
  pullRequestHeadSha: string;
  pullRequestBaseSha: string;
  baseRef: string;
  octokit: InstanceType<typeof GitHub>;
  logger: log.Logger;
}

const tryGetFirstParentOfMergeCommitViaLocalGit = async ({
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

    return (
      readFirstParentOfMergeCommit({
        mergeCommitSha,
        parents,
        pullRequestHeadSha,
        logger,
      }) ?? mergeBaseFromCompare(pullRequestHeadSha)
    );
  } catch (e) {
    logger.info(
      `Could not read the merge commit (${mergeCommitSha}) from the local git repository (${e}). Falling back to the GitHub compare API.`
    );
    return mergeBaseFromCompare(pullRequestHeadSha);
  }
};

/**
 * Reads the merge commit's parents from the GitHub API rather than a checkout.
 *
 * `GITHUB_SHA` is set for a `pull_request` event whether or not the job has checked anything out,
 * and the commit it names is fetchable, so this resolves the same commit
 * `tryGetFirstParentOfMergeCommitViaLocalGit` will resolve later in the job.
 *
 * It cannot resolve the same commit in one case: a job that goes on to check out a custom ref
 * sends that function to the compare API instead. `ensure-base` accepts a `ref` input for that
 * case so it can pre-warm the merge base instead. If the caller omits `ref` or it does not match
 * the later checkout, `readKnownBaseWorkflowRunId` refuses the recorded run.
 */
const tryGetFirstParentOfMergeCommitViaGithubApi = async ({
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

  let parents: string[];
  try {
    const { owner, repo } = context.repo;
    const { data } = await octokit.rest.repos.getCommit({
      owner,
      repo,
      ref: mergeCommitSha,
    });
    parents = data.parents.map(({ sha }) => sha);
  } catch (e) {
    // A permissions failure is reported in full by the compare API call we fall back to, which
    // needs the same `contents: read`.
    logger.info(
      `Could not read the merge commit (${mergeCommitSha}) from the GitHub API (${e}). Falling back to the GitHub compare API.`
    );
    return mergeBaseFromCompare(pullRequestHeadSha);
  }

  return (
    readFirstParentOfMergeCommit({
      mergeCommitSha,
      parents,
      pullRequestHeadSha,
      logger,
    }) ?? mergeBaseFromCompare(pullRequestHeadSha)
  );
};

/**
 * The commit GitHub's temporary merge commit was merged onto, or null when its parents don't
 * describe that merge and the caller should ask the compare API instead.
 */
const readFirstParentOfMergeCommit = ({
  mergeCommitSha,
  parents,
  pullRequestHeadSha,
  logger,
}: {
  mergeCommitSha: string;
  parents: string[];
  pullRequestHeadSha: string;
  logger: log.Logger;
}): string | null => {
  if (parents.length !== 2) {
    // Note: the GITHUB_SHA is always a merge commit, even if the merge is a no-op because the PR is up to date
    // So this should never happen
    logger.error(
      `GITHUB_SHA (${mergeCommitSha}) is not a merge commit, so can't work out true base of the merge commit from its parents. Falling back to the GitHub compare API.`
    );
    return null;
  }

  // The first parent is always the base, and the second parent is the head of the PR
  const mergeBaseSha = parents[0];
  const mergeHeadSha = parents[1];
  if (mergeHeadSha !== pullRequestHeadSha) {
    logger.error(
      `The second parent (${mergeHeadSha}) of the GITHUB_SHA merge commit (${mergeCommitSha}) is not equal to the head of the PR (${pullRequestHeadSha}),
        so can not confidently determine the base of the merge commit from its parents. Falling back to the GitHub compare API.`
    );
    return null;
  }
  return mergeBaseSha;
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
