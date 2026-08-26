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

const logger = log.getLogger("cloud-replay-base.spec");
logger.setLevel("silent");

const baseTestRun = { id: "base-test-run-id" } as TestRun;

describe("getBaseTestRunResolvedByBackend", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the test run the backend would compare a pull request against", async () => {
    getGitHubCloudReplayBaseTestRun.mockResolvedValue({
      baseCommitSha: "1111111111111111111111111111111111111111",
      baseTestRun,
      commitIsInPullRequest: true,
    });

    expect(
      await getBaseTestRunResolvedByBackend({
        apiToken: "token",
        headCommitSha: HEAD_SHA,
        logger,
      })
    ).toEqual(baseTestRun);
  });

  it("ignores the run resolved for a commit outside a pull request", async () => {
    // Off a pull request the backend hands back a recent run it keeps for flake detection, which
    // is no reason to skip building the base.
    getGitHubCloudReplayBaseTestRun.mockResolvedValue({
      baseCommitSha: "1111111111111111111111111111111111111111",
      baseTestRun,
      commitIsInPullRequest: false,
    });

    expect(
      await getBaseTestRunResolvedByBackend({
        apiToken: "token",
        headCommitSha: HEAD_SHA,
        logger,
      })
    ).toBeNull();
  });

  it("falls back to no answer when the endpoint rejects the project", async () => {
    // Projects without cloud replay are refused outright, and that must not fail the run.
    getGitHubCloudReplayBaseTestRun.mockRejectedValue(
      new Error("Request failed with status code 400")
    );

    expect(
      await getBaseTestRunResolvedByBackend({
        apiToken: "token",
        headCommitSha: HEAD_SHA,
        logger,
      })
    ).toBeNull();
  });
});
