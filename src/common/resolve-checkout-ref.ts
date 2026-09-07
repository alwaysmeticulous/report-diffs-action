import { context } from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";
import log from "loglevel";
import {
  getDetailedGitHubPermissionsError,
  isGithubPermissionsError,
} from "./error.utils";
import type { BaseCommitResolution } from "./get-base-and-head-commit-shas";

const FULL_GIT_SHA = /^[a-f0-9]{40}$/i;

export type EnsureBaseCommitResolution = {
  baseCommitResolution: BaseCommitResolution;
  compareHeadSha?: string;
};

/**
 * Turns the optional `ref` input into a commit SHA.
 *
 * A full SHA is used as-is. Anything else (a branch name, `github.head_ref`,
 * `refs/pull/N/merge`) is resolved through `repos.getCommit`, which is what
 * `actions/checkout` accepts. An unresolvable ref throws rather than silently
 * assuming the merge commit — that would pre-warm the wrong base.
 *
 * `undefined` means the input was omitted and the caller should assume `github.sha`.
 */
export const resolveCheckoutRefToSha = async ({
  ref,
  octokit,
  logger,
}: {
  ref: string | undefined;
  octokit: InstanceType<typeof GitHub>;
  logger: log.Logger;
}): Promise<string | undefined> => {
  const trimmed = ref?.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed === process.env.GITHUB_SHA || FULL_GIT_SHA.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  const { owner, repo } = context.repo;
  try {
    const { data } = await octokit.rest.repos.getCommit({
      owner,
      repo,
      ref: trimmed,
    });
    if (data.sha == null || !FULL_GIT_SHA.test(data.sha)) {
      throw new Error(
        `Could not resolve ensure-base ref '${trimmed}': GitHub returned an invalid commit SHA.`
      );
    }
    logger.info(`Resolved ensure-base ref '${trimmed}' to ${data.sha}.`);
    return data.sha;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Could not resolve ensure-base ref")
    ) {
      throw error;
    }
    if (isGithubPermissionsError(error)) {
      throw new Error(
        getDetailedGitHubPermissionsError(error, {
          operation: "get_branch",
          requiredPermissions: ["contents: read"],
        })
      );
    }
    throw new Error(
      `Could not resolve ensure-base ref '${trimmed}'. Pass the same ref you will pass to actions/checkout, or omit it to assume github.sha. ${error}`
    );
  }
};

/**
 * Picks how ensure-base should resolve the base, given the commit the caller
 * says they will check out.
 *
 * Omitted, or equal to `GITHUB_SHA`, is the default checkout (the temporary
 * merge commit). Anything else is a custom ref, so the upload step will ask
 * the compare API for the merge base of that commit and the base branch.
 */
export const getEnsureBaseCommitResolution = (
  checkoutSha: string | undefined
): EnsureBaseCommitResolution => {
  if (checkoutSha == null || checkoutSha === process.env.GITHUB_SHA) {
    return {
      baseCommitResolution: "first-parent-of-merge-commit-via-github-api",
    };
  }
  return {
    baseCommitResolution: "merge-base-of-pull-request-head",
    compareHeadSha: checkoutSha,
  };
};
