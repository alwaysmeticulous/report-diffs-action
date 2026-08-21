import { GitHub } from "@actions/github/lib/utils";
import log from "loglevel";
import { describe, it, expect, vi, afterEach } from "vitest";
import { COMMIT_SHA_WORKFLOW_INPUT } from "../constants";
import { startNewWorkflowRun } from "../workflow.utils";

const BASE_SHA = "2345721c00000000000000000000000000001234";

const LISTING_AFTER_DISPATCH_DELAY_MS = 10_000;

const logger = log.getLogger("workflow.utils.spec");
logger.setLevel("silent");

const buildOctokit = ({
  createWorkflowDispatch,
  listWorkflowRuns = vi.fn(),
}: {
  createWorkflowDispatch: ReturnType<typeof vi.fn>;
  listWorkflowRuns?: ReturnType<typeof vi.fn>;
}) =>
  ({
    rest: { actions: { createWorkflowDispatch, listWorkflowRuns } },
  } as unknown as InstanceType<typeof GitHub>);

const startRun = (octokit: InstanceType<typeof GitHub>, pinCommitSha = true) =>
  startNewWorkflowRun({
    owner: "alwaysmeticulous",
    repo: "meticulous",
    workflowId: 42,
    ref: "main",
    commitSha: BASE_SHA,
    pinCommitSha,
    octokit,
    logger,
  });

describe("startNewWorkflowRun", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("names the commit to build in the dispatch inputs", async () => {
    const createWorkflowDispatch = vi
      .fn()
      .mockResolvedValue({ data: { workflow_run_id: 99 } });

    const result = await startRun(buildOctokit({ createWorkflowDispatch }));

    expect(createWorkflowDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        ref: "main",
        inputs: { [COMMIT_SHA_WORKFLOW_INPUT]: BASE_SHA },
      })
    );
    expect(result).toEqual({
      type: "started",
      workflowRun: { workflowRunId: 99 },
    });
  });

  it("sends no inputs when not pinning", async () => {
    const createWorkflowDispatch = vi
      .fn()
      .mockResolvedValue({ data: { workflow_run_id: 7 } });

    await startRun(buildOctokit({ createWorkflowDispatch }), false);

    expect(createWorkflowDispatch.mock.calls[0][0]).not.toHaveProperty(
      "inputs"
    );
  });

  it("reports pinning as unsupported when the workflow does not declare the input", async () => {
    const createWorkflowDispatch = vi
      .fn()
      .mockRejectedValue(
        new Error(
          `Unexpected inputs provided: ["${COMMIT_SHA_WORKFLOW_INPUT}"]`
        )
      );

    const result = await startRun(buildOctokit({ createWorkflowDispatch }));

    expect(result).toEqual({ type: "commit-pinning-unsupported" });
  });

  it("treats an unexpected-inputs rejection as a plain failure when not pinning", async () => {
    const createWorkflowDispatch = vi
      .fn()
      .mockRejectedValue(new Error('Unexpected inputs provided: ["whatever"]'));

    const result = await startRun(
      buildOctokit({ createWorkflowDispatch }),
      false
    );

    expect(result).toEqual({ type: "failed" });
  });

  it("falls back to the most recently dispatched run when the API returns no run id", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-05-01T12:00:00Z"));

    const createWorkflowDispatch = vi.fn().mockResolvedValue({ status: 204 });
    const listWorkflowRuns = vi.fn().mockResolvedValue({
      data: {
        workflow_runs: [
          { id: 1, created_at: "2020-01-01T00:00:00Z" },
          { id: 2, created_at: "2024-05-01T11:59:59Z" },
        ],
      },
    });

    const resultPromise = startRun(
      buildOctokit({ createWorkflowDispatch, listWorkflowRuns })
    );
    await vi.advanceTimersByTimeAsync(LISTING_AFTER_DISPATCH_DELAY_MS);
    const result = await resultPromise;

    expect(listWorkflowRuns).toHaveBeenCalledWith(
      expect.objectContaining({ event: "workflow_dispatch", branch: "main" })
    );
    expect(result).toEqual({
      type: "started",
      workflowRun: expect.objectContaining({ workflowRunId: 2 }),
    });
  });
});
