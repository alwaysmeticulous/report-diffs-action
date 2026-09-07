import { GitHub } from "@actions/github/lib/utils";
import log from "loglevel";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getEnsureBaseCommitResolution,
  resolveCheckoutRefToSha,
} from "../resolve-checkout-ref";

vi.mock("@actions/github", () => ({
  context: {
    repo: { owner: "acme", repo: "app" },
  },
}));

const MERGE_COMMIT_SHA = "dddddddddddddddddddddddddddddddddddddddd";
const HEAD_SHA = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const logger = log.getLogger("resolve-checkout-ref.spec");
logger.setLevel("silent");

const buildOctokit = (getCommit = vi.fn()) =>
  ({
    rest: { repos: { getCommit } },
  } as unknown as InstanceType<typeof GitHub>);

describe("resolveCheckoutRefToSha", () => {
  const originalGithubSha = process.env.GITHUB_SHA;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GITHUB_SHA = MERGE_COMMIT_SHA;
  });

  afterEach(() => {
    if (originalGithubSha == null) {
      delete process.env.GITHUB_SHA;
    } else {
      process.env.GITHUB_SHA = originalGithubSha;
    }
  });

  it("returns undefined when ref is omitted", async () => {
    const getCommit = vi.fn();

    await expect(
      resolveCheckoutRefToSha({
        ref: undefined,
        octokit: buildOctokit(getCommit),
        logger,
      })
    ).resolves.toBeUndefined();
    expect(getCommit).not.toHaveBeenCalled();
  });

  it("returns undefined when ref is blank", async () => {
    const getCommit = vi.fn();

    await expect(
      resolveCheckoutRefToSha({
        ref: "   ",
        octokit: buildOctokit(getCommit),
        logger,
      })
    ).resolves.toBeUndefined();
    expect(getCommit).not.toHaveBeenCalled();
  });

  it("uses GITHUB_SHA without fetching when ref is the merge commit", async () => {
    const getCommit = vi.fn();

    await expect(
      resolveCheckoutRefToSha({
        ref: MERGE_COMMIT_SHA,
        octokit: buildOctokit(getCommit),
        logger,
      })
    ).resolves.toBe(MERGE_COMMIT_SHA);
    expect(getCommit).not.toHaveBeenCalled();
  });

  it("uses a full SHA without fetching", async () => {
    const getCommit = vi.fn();

    await expect(
      resolveCheckoutRefToSha({
        ref: HEAD_SHA,
        octokit: buildOctokit(getCommit),
        logger,
      })
    ).resolves.toBe(HEAD_SHA);
    expect(getCommit).not.toHaveBeenCalled();
  });

  it("resolves a branch name through the GitHub API", async () => {
    const getCommit = vi.fn().mockResolvedValue({ data: { sha: HEAD_SHA } });

    await expect(
      resolveCheckoutRefToSha({
        ref: "feature",
        octokit: buildOctokit(getCommit),
        logger,
      })
    ).resolves.toBe(HEAD_SHA);
    expect(getCommit).toHaveBeenCalledWith({
      owner: "acme",
      repo: "app",
      ref: "feature",
    });
  });

  it("throws when the ref cannot be resolved", async () => {
    const getCommit = vi.fn().mockRejectedValue(new Error("Not Found"));

    await expect(
      resolveCheckoutRefToSha({
        ref: "does-not-exist",
        octokit: buildOctokit(getCommit),
        logger,
      })
    ).rejects.toThrow(/Could not resolve ensure-base ref 'does-not-exist'/);
  });

  it("throws when GitHub returns an invalid SHA for the ref", async () => {
    const getCommit = vi.fn().mockResolvedValue({ data: { sha: "not-a-sha" } });

    await expect(
      resolveCheckoutRefToSha({
        ref: "feature",
        octokit: buildOctokit(getCommit),
        logger,
      })
    ).rejects.toThrow(/invalid commit SHA/);
  });
});

describe("getEnsureBaseCommitResolution", () => {
  const originalGithubSha = process.env.GITHUB_SHA;

  beforeEach(() => {
    process.env.GITHUB_SHA = MERGE_COMMIT_SHA;
  });

  afterEach(() => {
    if (originalGithubSha == null) {
      delete process.env.GITHUB_SHA;
    } else {
      process.env.GITHUB_SHA = originalGithubSha;
    }
  });

  it("uses the API first-parent path when ref is omitted", () => {
    expect(getEnsureBaseCommitResolution(undefined)).toEqual({
      baseCommitResolution: "first-parent-of-merge-commit-via-github-api",
    });
  });

  it("uses the API first-parent path when ref is the merge commit", () => {
    expect(getEnsureBaseCommitResolution(MERGE_COMMIT_SHA)).toEqual({
      baseCommitResolution: "first-parent-of-merge-commit-via-github-api",
    });
  });

  it("uses the compare API against a custom checkout SHA", () => {
    expect(getEnsureBaseCommitResolution(HEAD_SHA)).toEqual({
      baseCommitResolution: "merge-base-of-pull-request-head",
      compareHeadSha: HEAD_SHA,
    });
  });
});
