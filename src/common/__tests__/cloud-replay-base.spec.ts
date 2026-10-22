import { TestRun } from "@alwaysmeticulous/client";
import log from "loglevel";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getBaseTestRunResolvedByBackend } from "../cloud-replay-base.utils";

const { getGitHubCloudReplayBaseTestRun } = vi.hoisted(() => ({
  getGitHubCloudReplayBaseTestRun: vi.fn(),
}));

vi.mock("@alwaysmeticulous/client", () => ({
  createClient: vi.fn().mockReturnValue({}),
  getGitHubCloudReplayBaseTestRun,
}));

const HEAD_SHA = "3333333333333333333333333333333333333333";
const BASE_SHA = "2222222222222222222222222222222222222222";
const OLDER_SHA = "1111111111111111111111111111111111111111";

const logger = log.getLogger("cloud-replay-base.spec");
logger.setLevel("silent");

const baseTestRun = { id: "base-test-run-id" } as TestRun;
const olderTestRun = { id: "older-test-run-id" } as TestRun;

describe("getBaseTestRunResolvedByBackend", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the test run the backend would compare a pull request against", async () => {
    getGitHubCloudReplayBaseTestRun.mockResolvedValue({
      baseCommitSha: OLDER_SHA,
      baseTestRun,
      commitIsInPullRequest: true,
    });
    const getTestRunAtCommit = vi.fn();

    expect(
      await getBaseTestRunResolvedByBackend({
        apiToken: "token",
        headCommitSha: HEAD_SHA,
        baseSha: BASE_SHA,
        getTestRunAtCommit,
        logger,
      })
    ).toEqual(baseTestRun);
    expect(getTestRunAtCommit).not.toHaveBeenCalled();
  });

  it("ignores the run resolved for a commit outside a pull request", async () => {
    // Off a pull request the backend hands back a recent run it keeps for flake detection, which
    // is no reason to skip building the base.
    getGitHubCloudReplayBaseTestRun.mockResolvedValue({
      baseCommitSha: OLDER_SHA,
      baseTestRun,
      commitIsInPullRequest: false,
    });
    const getTestRunAtCommit = vi.fn();

    expect(
      await getBaseTestRunResolvedByBackend({
        apiToken: "token",
        headCommitSha: HEAD_SHA,
        baseSha: BASE_SHA,
        getTestRunAtCommit,
        logger,
      })
    ).toBeNull();
    expect(getTestRunAtCommit).not.toHaveBeenCalled();
  });

  it("falls back to no answer when the endpoint rejects the project", async () => {
    // Projects without cloud replay are refused outright, and that must not fail the run.
    getGitHubCloudReplayBaseTestRun.mockRejectedValue(
      new Error("Request failed with status code 400")
    );
    const getTestRunAtCommit = vi.fn();

    expect(
      await getBaseTestRunResolvedByBackend({
        apiToken: "token",
        headCommitSha: HEAD_SHA,
        baseSha: BASE_SHA,
        getTestRunAtCommit,
        logger,
      })
    ).toBeNull();
  });

  it("returns the run at an older base commit the backend can re-run from its stored build", async () => {
    // The backend fell back to an older commit but the run there isn't usable as-is; the
    // commit was still tested once, so the backend re-runs it rather than us building the
    // merge base.
    getGitHubCloudReplayBaseTestRun.mockResolvedValue({
      baseCommitSha: OLDER_SHA,
      baseTestRun: null,
      commitIsInPullRequest: true,
    });
    const getTestRunAtCommit = vi.fn().mockResolvedValue(olderTestRun);

    expect(
      await getBaseTestRunResolvedByBackend({
        apiToken: "token",
        headCommitSha: HEAD_SHA,
        baseSha: BASE_SHA,
        getTestRunAtCommit,
        logger,
      })
    ).toEqual(olderTestRun);
    expect(getTestRunAtCommit).toHaveBeenCalledTimes(1);
    expect(getTestRunAtCommit).toHaveBeenCalledWith({ baseSha: OLDER_SHA });
  });

  it("returns null when the older base commit was never tested", async () => {
    getGitHubCloudReplayBaseTestRun.mockResolvedValue({
      baseCommitSha: OLDER_SHA,
      baseTestRun: null,
      commitIsInPullRequest: true,
    });
    const getTestRunAtCommit = vi.fn().mockResolvedValue(null);

    expect(
      await getBaseTestRunResolvedByBackend({
        apiToken: "token",
        headCommitSha: HEAD_SHA,
        baseSha: BASE_SHA,
        getTestRunAtCommit,
        logger,
      })
    ).toBeNull();
  });

  it("does not look up the base commit the caller already checked", async () => {
    getGitHubCloudReplayBaseTestRun.mockResolvedValue({
      baseCommitSha: BASE_SHA,
      baseTestRun: null,
      commitIsInPullRequest: true,
    });
    const getTestRunAtCommit = vi.fn();

    expect(
      await getBaseTestRunResolvedByBackend({
        apiToken: "token",
        headCommitSha: HEAD_SHA,
        baseSha: BASE_SHA,
        getTestRunAtCommit,
        logger,
      })
    ).toBeNull();
    expect(getTestRunAtCommit).not.toHaveBeenCalled();
  });

  it("does not look up an older base commit outside a pull request", async () => {
    getGitHubCloudReplayBaseTestRun.mockResolvedValue({
      baseCommitSha: OLDER_SHA,
      baseTestRun: null,
      commitIsInPullRequest: false,
    });
    const getTestRunAtCommit = vi.fn();

    expect(
      await getBaseTestRunResolvedByBackend({
        apiToken: "token",
        headCommitSha: HEAD_SHA,
        baseSha: BASE_SHA,
        getTestRunAtCommit,
        logger,
      })
    ).toBeNull();
    expect(getTestRunAtCommit).not.toHaveBeenCalled();
  });

  it("falls back to no answer when the commit lookup fails", async () => {
    getGitHubCloudReplayBaseTestRun.mockResolvedValue({
      baseCommitSha: OLDER_SHA,
      baseTestRun: null,
      commitIsInPullRequest: true,
    });
    const getTestRunAtCommit = vi
      .fn()
      .mockRejectedValue(new Error("Request failed with status code 500"));

    expect(
      await getBaseTestRunResolvedByBackend({
        apiToken: "token",
        headCommitSha: HEAD_SHA,
        baseSha: BASE_SHA,
        getTestRunAtCommit,
        logger,
      })
    ).toBeNull();
  });
});
