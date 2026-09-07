import { GitHub } from "@actions/github/lib/utils";
import log from "loglevel";
import { Duration } from "luxon";
import { describe, it, expect, vi, afterEach } from "vitest";
import { COMMIT_SHA_WORKFLOW_INPUT } from "../constants";
import {
  getPendingWorkflowRun,
  isPendingStatus,
  startNewWorkflowRun,
  waitForWorkflowCompletion,
} from "../workflow.utils";

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

  it("asks for the run id, without which the API answers an empty 204", async () => {
    const createWorkflowDispatch = vi
      .fn()
      .mockResolvedValue({ data: { workflow_run_id: 99 } });

    await startRun(buildOctokit({ createWorkflowDispatch }));

    expect(createWorkflowDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ return_run_details: true })
    );
  });

  it("dispatches without the run-id request when the API rejects it", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-05-01T12:00:00Z"));

    // GitHub Enterprise Server 3.20 and earlier reject unknown body fields.
    const createWorkflowDispatch = vi
      .fn()
      .mockRejectedValueOnce(
        Object.assign(new Error("Bad Request"), { status: 400 })
      )
      .mockResolvedValue({ status: 204 });
    const listWorkflowRuns = vi.fn().mockResolvedValue({
      data: {
        workflow_runs: [{ id: 5, created_at: "2024-05-01T11:59:59Z" }],
      },
    });

    const resultPromise = startRun(
      buildOctokit({ createWorkflowDispatch, listWorkflowRuns })
    );
    await vi.advanceTimersByTimeAsync(LISTING_AFTER_DISPATCH_DELAY_MS);

    expect(createWorkflowDispatch).toHaveBeenCalledTimes(2);
    expect(createWorkflowDispatch.mock.calls[1][0]).not.toHaveProperty(
      "return_run_details"
    );
    // The commit is still pinned on the retry, so the base we wanted is still what gets built.
    expect(createWorkflowDispatch.mock.calls[1][0]).toHaveProperty("inputs", {
      [COMMIT_SHA_WORKFLOW_INPUT]: BASE_SHA,
    });
    expect(await resultPromise).toEqual({
      type: "started",
      workflowRun: expect.objectContaining({ workflowRunId: 5 }),
    });
  });

  it("carries the run's url through, which the caller logs to click into", async () => {
    const createWorkflowDispatch = vi.fn().mockResolvedValue({
      data: {
        workflow_run_id: 42,
        html_url: "https://github.com/o/r/actions/runs/42",
      },
    });

    expect(await startRun(buildOctokit({ createWorkflowDispatch }))).toEqual({
      type: "started",
      workflowRun: {
        workflowRunId: 42,
        html_url: "https://github.com/o/r/actions/runs/42",
      },
    });
  });

  it("keeps pinning when a strict server refuses the run-id request with 422", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-05-01T12:00:00Z"));

    // A 422 that says nothing about inputs is the body field being refused, not the workflow
    // declining to be pinned — dropping the pinning here would build the wrong commit.
    const createWorkflowDispatch = vi
      .fn()
      .mockRejectedValueOnce(
        Object.assign(new Error("Invalid request body"), { status: 422 })
      )
      .mockResolvedValue({ status: 204 });
    const listWorkflowRuns = vi.fn().mockResolvedValue({
      data: {
        workflow_runs: [{ id: 8, created_at: "2024-05-01T11:59:59Z" }],
      },
    });

    const resultPromise = startRun(
      buildOctokit({ createWorkflowDispatch, listWorkflowRuns })
    );
    await vi.advanceTimersByTimeAsync(LISTING_AFTER_DISPATCH_DELAY_MS);

    expect(createWorkflowDispatch).toHaveBeenCalledTimes(2);
    expect(createWorkflowDispatch.mock.calls[1][0]).not.toHaveProperty(
      "return_run_details"
    );
    expect(createWorkflowDispatch.mock.calls[1][0]).toHaveProperty("inputs", {
      [COMMIT_SHA_WORKFLOW_INPUT]: BASE_SHA,
    });
    expect(await resultPromise).toEqual({
      type: "started",
      workflowRun: expect.objectContaining({ workflowRunId: 8 }),
    });
  });

  it("does not retry when the 422 is the workflow declining the input", async () => {
    const createWorkflowDispatch = vi
      .fn()
      .mockRejectedValue(
        Object.assign(
          new Error(
            `Unexpected inputs provided: ["${COMMIT_SHA_WORKFLOW_INPUT}"]`
          ),
          { status: 422 }
        )
      );

    const result = await startRun(buildOctokit({ createWorkflowDispatch }));

    expect(createWorkflowDispatch).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ type: "commit-pinning-unsupported" });
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

  it("falls back to the branch head on any 422, whatever GitHub calls it", async () => {
    const createWorkflowDispatch = vi
      .fn()
      .mockRejectedValue(
        Object.assign(new Error("Reworded by GitHub"), { status: 422 })
      );

    const result = await startRun(buildOctokit({ createWorkflowDispatch }));

    expect(result).toEqual({ type: "commit-pinning-unsupported" });
  });

  it("tells a deleted branch apart from a workflow that cannot pin", async () => {
    // GitHub refuses both with a 422, and they want opposite responses: a workflow that can't
    // pin can still build its branch head, whereas a branch that's gone has no head to build.
    const createWorkflowDispatch = vi.fn().mockRejectedValue(
      Object.assign(new Error("No ref found for: refs/heads/deleted-branch"), {
        status: 422,
      })
    );

    const result = await startRun(buildOctokit({ createWorkflowDispatch }));

    expect(result).toEqual({ type: "ref-not-found" });
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

  it("gives up rather than guessing when several runs were dispatched in the window", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-05-01T12:00:00Z"));

    const createWorkflowDispatch = vi.fn().mockResolvedValue({ status: 204 });
    const listWorkflowRuns = vi.fn().mockResolvedValue({
      data: {
        workflow_runs: [
          { id: 2, created_at: "2024-05-01T11:59:59Z" },
          { id: 3, created_at: "2024-05-01T11:59:58Z" },
        ],
      },
    });

    const resultPromise = startRun(
      buildOctokit({ createWorkflowDispatch, listWorkflowRuns })
    );
    await vi.advanceTimersByTimeAsync(LISTING_AFTER_DISPATCH_DELAY_MS);

    expect(await resultPromise).toEqual({
      type: "started",
      workflowRun: undefined,
    });
  });
});

describe("isPendingStatus", () => {
  it.each(["in_progress", "queued", "requested", "waiting", "pending"])(
    "treats %s as still running",
    (status) => {
      expect(isPendingStatus(status)).toBe(true);
    }
  );

  it.each(["completed", "action_required", null])(
    "does not treat %s as still running",
    (status) => {
      expect(isPendingStatus(status)).toBe(false);
    }
  );
});

const BRANCH_TIP_SHA = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const listRun = ({
  id,
  head_sha,
  event,
  status,
}: {
  id: number;
  head_sha: string;
  event: string;
  status: string;
}) => ({ id, head_sha, event, status });

const buildListingOctokit = (workflowRuns: unknown[]) =>
  ({
    paginate: {
      iterator: vi.fn(async function* () {
        yield { data: workflowRuns };
      }),
    },
    rest: { actions: { listWorkflowRuns: vi.fn() } },
  } as unknown as InstanceType<typeof GitHub>);

const pendingOn = (octokit: InstanceType<typeof GitHub>) =>
  getPendingWorkflowRun({
    owner: "alwaysmeticulous",
    repo: "meticulous",
    workflowId: 42,
    commitSha: BASE_SHA,
    octokit,
    logger,
  });

describe("getPendingWorkflowRun", () => {
  it("finds a pending run whose head_sha is the base commit", async () => {
    const octokit = buildListingOctokit([
      listRun({
        id: 5,
        head_sha: BASE_SHA,
        event: "push",
        status: "queued",
      }),
    ]);

    expect(await pendingOn(octokit)).toEqual(
      expect.objectContaining({ workflowRunId: 5 })
    );
  });

  it("treats GitHub's pending status as still running", async () => {
    const octokit = buildListingOctokit([
      listRun({
        id: 6,
        head_sha: BASE_SHA,
        event: "push",
        status: "pending",
      }),
    ]);

    expect(await pendingOn(octokit)).toEqual(
      expect.objectContaining({ workflowRunId: 6 })
    );
  });

  // A pinned dispatch is only findable through the run id ensure-base publishes. Claiming one
  // here on the strength of it being the only dispatch around would hand back a build of whatever
  // commit someone else pinned, and the base we then reported would have no snapshots at all.
  it("does not claim a pinned dispatch that reports the branch tip as its head_sha", async () => {
    const octokit = buildListingOctokit([
      listRun({
        id: 7,
        head_sha: BRANCH_TIP_SHA,
        event: "workflow_dispatch",
        status: "in_progress",
      }),
    ]);

    expect(await pendingOn(octokit)).toBeUndefined();
  });
});

describe("waitForWorkflowCompletion", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps waiting while the run is in GitHub's pending status", async () => {
    vi.useFakeTimers();
    const getWorkflowRun = vi
      .fn()
      .mockResolvedValueOnce({
        data: { id: 1, status: "pending", conclusion: null },
      })
      .mockResolvedValue({
        data: { id: 1, status: "completed", conclusion: "success" },
      });
    const octokit = {
      rest: { actions: { getWorkflowRun } },
    } as unknown as InstanceType<typeof GitHub>;

    const resultPromise = waitForWorkflowCompletion({
      owner: "alwaysmeticulous",
      repo: "meticulous",
      workflowRunId: 1,
      octokit,
      timeout: Duration.fromObject({ minutes: 1 }),
      isCancelled: () => false,
      logger,
    });
    await vi.advanceTimersByTimeAsync(10_000);

    expect(await resultPromise).toEqual(
      expect.objectContaining({ status: "completed", conclusion: "success" })
    );
    expect(getWorkflowRun.mock.calls.length).toBeGreaterThan(1);
  });
});
