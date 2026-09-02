import { execFileSync } from "child_process";
import { GitHub } from "@actions/github/lib/utils";
import log from "loglevel";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CodeChangeEvent } from "../../types";
import { getBaseAndHeadCommitShas } from "../get-base-and-head-commit-shas";

vi.mock("child_process", () => ({
  execFileSync: vi.fn(),
}));

vi.mock("@actions/github", () => ({
  context: {
    sha: "dddddddddddddddddddddddddddddddddddddddd",
    repo: { owner: "acme", repo: "app" },
  },
}));

const execFileSyncMock = vi.mocked(execFileSync);

const HEAD_SHA = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const PR_BASE_SHA = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const MERGE_BASE_SHA = "cccccccccccccccccccccccccccccccccccccccc";
const MERGE_COMMIT_SHA = "dddddddddddddddddddddddddddddddddddddddd";
const CHECKED_OUT_SHA = "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

const event: CodeChangeEvent = {
  type: "pull_request",
  payload: {
    pull_request: {
      number: 1,
      head: { sha: HEAD_SHA, ref: "feature" },
      base: { sha: PR_BASE_SHA, ref: "main" },
      title: "A pull request",
      html_url: "https://github.com/acme/app/pull/1",
    },
  },
};

const logger = log.getLogger("get-base-and-head-commit-shas.spec");
logger.setLevel("silent");

const buildOctokit = (compareCommits = vi.fn()) =>
  ({
    rest: { repos: { compareCommits } },
  } as unknown as InstanceType<typeof GitHub>);

const gitCommand = (args: string[]) => args.join(" ");

describe("getBaseAndHeadCommitShas", () => {
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

  it("uses the GitHub compare API for a deployment-url PR and does not fetch git history", async () => {
    const compareCommits = vi.fn().mockResolvedValue({
      data: { merge_base_commit: { sha: MERGE_BASE_SHA } },
    });

    const result = await getBaseAndHeadCommitShas(
      event,
      { useDeploymentUrl: true, octokit: buildOctokit(compareCommits) },
      logger
    );

    expect(result).toEqual({ base: MERGE_BASE_SHA, head: HEAD_SHA });
    expect(compareCommits).toHaveBeenCalledWith({
      owner: "acme",
      repo: "app",
      base: "main",
      head: HEAD_SHA,
    });
    expect(execFileSyncMock).not.toHaveBeenCalled();
  });

  it("falls back to the pull request base SHA when the compare API fails", async () => {
    const compareCommits = vi
      .fn()
      .mockRejectedValue(new Error("API rate limit exceeded"));

    const result = await getBaseAndHeadCommitShas(
      event,
      { useDeploymentUrl: true, octokit: buildOctokit(compareCommits) },
      logger
    );

    expect(result).toEqual({ base: PR_BASE_SHA, head: HEAD_SHA });
    expect(
      execFileSyncMock.mock.calls.some((call) =>
        gitCommand(call[1] as string[]).includes("--unshallow")
      )
    ).toBe(false);
  });

  it("falls back to the pull request base SHA when merge_base_commit.sha is missing", async () => {
    const compareCommits = vi.fn().mockResolvedValue({
      data: { merge_base_commit: { sha: "not-a-sha" } },
    });

    const result = await getBaseAndHeadCommitShas(
      event,
      { useDeploymentUrl: true, octokit: buildOctokit(compareCommits) },
      logger
    );

    expect(result).toEqual({ base: PR_BASE_SHA, head: HEAD_SHA });
  });

  it("reads the merge-commit parent when checkout HEAD is GITHUB_SHA", async () => {
    execFileSyncMock.mockImplementation((_cmd, args) => {
      const command = gitCommand(args as string[]);
      if (command.startsWith("rev-list")) {
        return Buffer.from(`${MERGE_COMMIT_SHA}\n`);
      }
      if (command.startsWith("cat-file")) {
        return Buffer.from(`parent ${PR_BASE_SHA}\nparent ${HEAD_SHA}\n`);
      }
      return Buffer.from("");
    });
    const compareCommits = vi.fn();

    const result = await getBaseAndHeadCommitShas(
      event,
      { useDeploymentUrl: false, octokit: buildOctokit(compareCommits) },
      logger
    );

    expect(result).toEqual({ base: PR_BASE_SHA, head: HEAD_SHA });
    expect(compareCommits).not.toHaveBeenCalled();
    expect(
      execFileSyncMock.mock.calls.some((call) =>
        gitCommand(call[1] as string[]).includes("fetch")
      )
    ).toBe(false);
  });

  it("uses the compare API when checkout HEAD is a custom ref", async () => {
    execFileSyncMock.mockImplementation((_cmd, args) => {
      const command = gitCommand(args as string[]);
      if (command.startsWith("rev-list")) {
        return Buffer.from(`${CHECKED_OUT_SHA}\n`);
      }
      return Buffer.from("");
    });
    const compareCommits = vi.fn().mockResolvedValue({
      data: { merge_base_commit: { sha: MERGE_BASE_SHA } },
    });

    const result = await getBaseAndHeadCommitShas(
      event,
      { useDeploymentUrl: false, octokit: buildOctokit(compareCommits) },
      logger
    );

    expect(result).toEqual({ base: MERGE_BASE_SHA, head: HEAD_SHA });
    expect(compareCommits).toHaveBeenCalledWith({
      owner: "acme",
      repo: "app",
      base: "main",
      head: CHECKED_OUT_SHA,
    });
    expect(
      execFileSyncMock.mock.calls.some((call) =>
        gitCommand(call[1] as string[]).includes("--unshallow")
      )
    ).toBe(false);
  });

  it("uses the compare API when there is no local git repository", async () => {
    execFileSyncMock.mockImplementation(() => {
      throw new Error("not a git repository");
    });
    const compareCommits = vi.fn().mockResolvedValue({
      data: { merge_base_commit: { sha: MERGE_BASE_SHA } },
    });

    const result = await getBaseAndHeadCommitShas(
      event,
      { useDeploymentUrl: false, octokit: buildOctokit(compareCommits) },
      logger
    );

    expect(result).toEqual({ base: MERGE_BASE_SHA, head: HEAD_SHA });
    expect(compareCommits).toHaveBeenCalledWith({
      owner: "acme",
      repo: "app",
      base: "main",
      head: HEAD_SHA,
    });
  });
});
