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

const buildOctokit = (compareCommits = vi.fn(), getCommit = vi.fn()) =>
  ({
    rest: { repos: { compareCommits, getCommit } },
  } as unknown as InstanceType<typeof GitHub>);

const mergeCommitWithParents = (...parents: string[]) =>
  vi.fn().mockResolvedValue({
    data: { parents: parents.map((sha) => ({ sha })) },
  });

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
      {
        baseCommitResolution: "merge-base-of-pull-request-head",
        octokit: buildOctokit(compareCommits),
      },
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
      {
        baseCommitResolution: "merge-base-of-pull-request-head",
        octokit: buildOctokit(compareCommits),
      },
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
      {
        baseCommitResolution: "merge-base-of-pull-request-head",
        octokit: buildOctokit(compareCommits),
      },
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
    const octokit = buildOctokit(compareCommits);

    const result = await getBaseAndHeadCommitShas(
      event,
      {
        baseCommitResolution: "first-parent-of-merge-commit-via-local-git",
        octokit,
      },
      logger
    );

    expect(result).toEqual({ base: PR_BASE_SHA, head: HEAD_SHA });
    expect(compareCommits).not.toHaveBeenCalled();
    expect(
      execFileSyncMock.mock.calls.some((call) =>
        gitCommand(call[1] as string[]).includes("fetch")
      )
    ).toBe(false);
    // The commit the comparison is made against comes from the checkout alone. Anything the API
    // would say about the merge commit is a prediction of this, never a substitute for it.
    expect(octokit.rest.repos.getCommit).not.toHaveBeenCalled();
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
      {
        baseCommitResolution: "first-parent-of-merge-commit-via-local-git",
        octokit: buildOctokit(compareCommits),
      },
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
      {
        baseCommitResolution: "first-parent-of-merge-commit-via-local-git",
        octokit: buildOctokit(compareCommits),
      },
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

  describe("first-parent-of-merge-commit-via-github-api", () => {
    const resolveViaApi = (octokit: InstanceType<typeof GitHub>) =>
      getBaseAndHeadCommitShas(
        event,
        {
          baseCommitResolution: "first-parent-of-merge-commit-via-github-api",
          octokit,
        },
        logger
      );

    it("reads the merge-commit parents without a checkout", async () => {
      const compareCommits = vi.fn();
      const getCommit = mergeCommitWithParents(PR_BASE_SHA, HEAD_SHA);

      const result = await resolveViaApi(
        buildOctokit(compareCommits, getCommit)
      );

      expect(result).toEqual({ base: PR_BASE_SHA, head: HEAD_SHA });
      expect(getCommit).toHaveBeenCalledWith({
        owner: "acme",
        repo: "app",
        ref: MERGE_COMMIT_SHA,
      });
      expect(compareCommits).not.toHaveBeenCalled();
      expect(execFileSyncMock).not.toHaveBeenCalled();
    });

    // The same commit a job that checks out normally will resolve for itself, which is the point
    // of resolving it this way at all.
    it("agrees with the local git path on the same merge commit", async () => {
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

      const viaApi = await resolveViaApi(
        buildOctokit(vi.fn(), mergeCommitWithParents(PR_BASE_SHA, HEAD_SHA))
      );
      const viaLocalGit = await getBaseAndHeadCommitShas(
        event,
        {
          baseCommitResolution: "first-parent-of-merge-commit-via-local-git",
          octokit: buildOctokit(vi.fn()),
        },
        logger
      );

      expect(viaApi).toEqual(viaLocalGit);
    });

    it("uses the compare API when the merge commit does not have two parents", async () => {
      const compareCommits = vi.fn().mockResolvedValue({
        data: { merge_base_commit: { sha: MERGE_BASE_SHA } },
      });

      const result = await resolveViaApi(
        buildOctokit(compareCommits, mergeCommitWithParents(PR_BASE_SHA))
      );

      expect(result).toEqual({ base: MERGE_BASE_SHA, head: HEAD_SHA });
      expect(compareCommits).toHaveBeenCalledWith({
        owner: "acme",
        repo: "app",
        base: "main",
        head: HEAD_SHA,
      });
    });

    it("uses the compare API when the second parent is not the pull request head", async () => {
      const compareCommits = vi.fn().mockResolvedValue({
        data: { merge_base_commit: { sha: MERGE_BASE_SHA } },
      });

      const result = await resolveViaApi(
        buildOctokit(
          compareCommits,
          mergeCommitWithParents(PR_BASE_SHA, CHECKED_OUT_SHA)
        )
      );

      expect(result).toEqual({ base: MERGE_BASE_SHA, head: HEAD_SHA });
      expect(compareCommits).toHaveBeenCalledWith({
        owner: "acme",
        repo: "app",
        base: "main",
        head: HEAD_SHA,
      });
    });

    it("uses the compare API when GITHUB_SHA is unset", async () => {
      delete process.env.GITHUB_SHA;
      const compareCommits = vi.fn().mockResolvedValue({
        data: { merge_base_commit: { sha: MERGE_BASE_SHA } },
      });
      const getCommit = mergeCommitWithParents(PR_BASE_SHA, HEAD_SHA);

      const result = await resolveViaApi(
        buildOctokit(compareCommits, getCommit)
      );

      expect(result).toEqual({ base: MERGE_BASE_SHA, head: HEAD_SHA });
      expect(getCommit).not.toHaveBeenCalled();
      expect(compareCommits).toHaveBeenCalledWith({
        owner: "acme",
        repo: "app",
        base: "main",
        head: HEAD_SHA,
      });
    });

    it("uses the compare API when the merge commit cannot be fetched", async () => {
      const compareCommits = vi.fn().mockResolvedValue({
        data: { merge_base_commit: { sha: MERGE_BASE_SHA } },
      });
      const getCommit = vi.fn().mockRejectedValue(new Error("Not Found"));

      const result = await resolveViaApi(
        buildOctokit(compareCommits, getCommit)
      );

      expect(result).toEqual({ base: MERGE_BASE_SHA, head: HEAD_SHA });
    });

    it("falls back to the pull request base SHA when the compare API fails too", async () => {
      const compareCommits = vi.fn().mockRejectedValue(new Error("403"));
      const getCommit = vi.fn().mockRejectedValue(new Error("Not Found"));

      const result = await resolveViaApi(
        buildOctokit(compareCommits, getCommit)
      );

      expect(result).toEqual({ base: PR_BASE_SHA, head: HEAD_SHA });
    });
  });
});
