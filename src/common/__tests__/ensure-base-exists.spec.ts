import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";
import { TestRun } from "@alwaysmeticulous/client";
import log from "loglevel";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { CodeChangeEvent } from "../../types";
import { COMMIT_SHA_WORKFLOW_INPUT } from "../constants";
import {
  ensureBaseTestsExists,
  tryTriggerTestsWorkflowOnBase,
} from "../ensure-base-exists.utils";

const { takeBaseWorkflowDispatchLease } = vi.hoisted(() => ({
  takeBaseWorkflowDispatchLease: vi.fn(),
}));

vi.mock("@alwaysmeticulous/client", () => ({
  createClient: vi.fn().mockReturnValue({}),
  takeBaseWorkflowDispatchLease,
}));

const BASE_SHA = "1111111111111111111111111111111111111111";
const ANCESTOR_SHA = "2222222222222222222222222222222222222222";

const WORKFLOW_ID = 42;

const WORKFLOW_RUN_UPDATE_STATUS_INTERVAL_MS = 5_000;

const POLL_FOR_BASE_TEST_RUN_INTERVAL_MS = 10_000;

const POLL_FOR_ANOTHER_CALLERS_RUN_INTERVAL_MS = 10_000;

const WORKFLOW_RUN_COMPLETION_TIMEOUT_MS = 30 * 60 * 1_000;

const logger = log.getLogger("ensure-base-exists.spec");
logger.setLevel("silent");

const event: CodeChangeEvent = {
  type: "pull_request",
  payload: {
    pull_request: {
      number: 1,
      head: { sha: "3333333333333333333333333333333333333333", ref: "feature" },
      base: { sha: BASE_SHA, ref: "main" },
      title: "A pull request",
      html_url: "https://github.com/alwaysmeticulous/meticulous/pull/1",
    },
  },
};

const context = {
  repo: { owner: "alwaysmeticulous", repo: "meticulous" },
  runId: 7,
} as unknown as Context;

// The array is read on every listing, so a test can push a run into it to have one appear
// partway through, the way GitHub starts listing a run some seconds after it was dispatched.
const buildOctokit = ({
  workflowRuns = [],
  // The base's ancestry, as the commit listing would report it. Kept faithful so that a test
  // asserting we dispatch would fail were the ancestor walk still there to find a run on
  // ANCESTOR_SHA.
  commits = [
    { sha: BASE_SHA, parents: [{ sha: ANCESTOR_SHA }] },
    { sha: ANCESTOR_SHA, parents: [] },
  ],
  // Runs the workflow has been asked to start, as the dispatched-run listing would report them.
  // Also read on every call, so a test can have one turn up partway through.
  dispatchedRuns = [],
  createWorkflowDispatch = vi
    .fn()
    .mockResolvedValue({ data: { workflow_run_id: 99 } }),
  dispatchedRunStatus = { status: "completed", conclusion: "success" },
}: {
  workflowRuns?: unknown[];
  commits?: unknown[];
  dispatchedRuns?: unknown[];
  createWorkflowDispatch?: ReturnType<typeof vi.fn>;
  dispatchedRunStatus?: { status: string; conclusion: string | null };
} = {}) => {
  const listCommits = vi.fn();
  return {
    paginate: {
      iterator: vi.fn(async function* (route: unknown) {
        yield { data: route === listCommits ? commits : workflowRuns };
      }),
    },
    rest: {
      actions: {
        // Serves both the lookup of the current workflow's id and the polling of a run we're
        // waiting on.
        getWorkflowRun: vi.fn().mockResolvedValue({
          data: { workflow_id: WORKFLOW_ID, id: 99, ...dispatchedRunStatus },
        }),
        createWorkflowDispatch,
        listWorkflowRuns: vi.fn().mockImplementation(async () => ({
          data: { workflow_runs: dispatchedRuns },
        })),
      },
      repos: {
        listCommits,
        getBranch: vi
          .fn()
          .mockResolvedValue({ data: { commit: { sha: BASE_SHA } } }),
      },
    },
  } as unknown as InstanceType<typeof GitHub>;
};

// A run someone asked the workflow to start. Its head is the branch it was dispatched against,
// which for a commit-pinned dispatch is not the commit it is building.
const dispatchedRun = (id: number, secondsAgo = 0) => ({
  id,
  head_sha: "4444444444444444444444444444444444444444",
  event: "workflow_dispatch",
  status: "in_progress",
  created_at: new Date(Date.now() - secondsAgo * 1_000).toISOString(),
  html_url: `https://github.com/alwaysmeticulous/meticulous/actions/runs/${id}`,
});

const pushRun = (headSha: string, status: string, id: number) => ({
  id,
  head_sha: headSha,
  event: "push",
  status,
  html_url: `https://github.com/alwaysmeticulous/meticulous/actions/runs/${id}`,
});

describe("tryTriggerTestsWorkflowOnBase", () => {
  beforeEach(() => {
    takeBaseWorkflowDispatchLease.mockReset().mockResolvedValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("dispatches a build of the base when the pending run is on an ancestor", async () => {
    vi.useFakeTimers();
    // A run on an ancestor built a different tree, so nothing exists at the base to compare
    // against and waiting on it would leave the test run with no base.
    const createWorkflowDispatch = vi
      .fn()
      .mockResolvedValue({ data: { workflow_run_id: 99 } });
    const octokit = buildOctokit({
      workflowRuns: [pushRun(ANCESTOR_SHA, "in_progress", 1)],
      createWorkflowDispatch,
    });

    const resultPromise = tryTriggerTestsWorkflowOnBase({
      logger,
      event,
      apiToken: "token",
      base: BASE_SHA,
      context,
      octokit,
    });
    await vi.advanceTimersByTimeAsync(WORKFLOW_RUN_UPDATE_STATUS_INTERVAL_MS);

    expect(createWorkflowDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        ref: "main",
        inputs: { [COMMIT_SHA_WORKFLOW_INPUT]: BASE_SHA },
      })
    );
    expect(takeBaseWorkflowDispatchLease).toHaveBeenCalledWith(
      expect.objectContaining({
        baseCommitSha: BASE_SHA,
        workflowId: `${WORKFLOW_ID}`,
      })
    );
    expect(await resultPromise).toEqual({
      baseTestRunExists: true,
      baseResolutionDetails: expect.objectContaining({
        type: "triggered-new-workflow-run-successfully",
      }),
    });
  });

  it("waits on a pending run that is building the base commit itself", async () => {
    vi.useFakeTimers();
    const createWorkflowDispatch = vi.fn();
    const octokit = buildOctokit({
      workflowRuns: [pushRun(BASE_SHA, "queued", 5)],
      createWorkflowDispatch,
    });

    const resultPromise = tryTriggerTestsWorkflowOnBase({
      logger,
      event,
      apiToken: "token",
      base: BASE_SHA,
      context,
      octokit,
    });
    await vi.advanceTimersByTimeAsync(WORKFLOW_RUN_UPDATE_STATUS_INTERVAL_MS);

    expect(createWorkflowDispatch).not.toHaveBeenCalled();
    expect(await resultPromise).toEqual({
      baseTestRunExists: true,
      baseResolutionDetails: expect.objectContaining({
        type: "waited-for-existing-workflow-run",
        workflowId: "5",
        baseCommitSha: BASE_SHA,
      }),
    });
  });

  it("ignores a pull_request run on the base, which built the temporary merge commit", async () => {
    vi.useFakeTimers();
    const createWorkflowDispatch = vi
      .fn()
      .mockResolvedValue({ data: { workflow_run_id: 99 } });
    const octokit = buildOctokit({
      workflowRuns: [
        {
          ...pushRun(BASE_SHA, "in_progress", 6),
          event: "pull_request",
        },
      ],
      createWorkflowDispatch,
    });

    const resultPromise = tryTriggerTestsWorkflowOnBase({
      logger,
      event,
      apiToken: "token",
      base: BASE_SHA,
      context,
      octokit,
    });
    await vi.advanceTimersByTimeAsync(WORKFLOW_RUN_UPDATE_STATUS_INTERVAL_MS);
    await resultPromise;

    expect(createWorkflowDispatch).toHaveBeenCalled();
  });

  it("waits on another job's build rather than dispatching a second one", async () => {
    vi.useFakeTimers();
    takeBaseWorkflowDispatchLease.mockResolvedValue(false);
    const createWorkflowDispatch = vi.fn();
    const dispatchedRuns: unknown[] = [];
    const octokit = buildOctokit({ dispatchedRuns, createWorkflowDispatch });

    const resultPromise = tryTriggerTestsWorkflowOnBase({
      logger,
      event,
      apiToken: "token",
      base: BASE_SHA,
      context,
      octokit,
    });

    // GitHub doesn't list the other job's run for several seconds after it dispatched it.
    await vi.advanceTimersByTimeAsync(POLL_FOR_ANOTHER_CALLERS_RUN_INTERVAL_MS);
    expect(createWorkflowDispatch).not.toHaveBeenCalled();

    // It was pinned to the base commit, so it is listed under the branch head — nothing about it
    // says which commit it is building, and we wait on it all the same.
    dispatchedRuns.push(dispatchedRun(11));
    await vi.advanceTimersByTimeAsync(
      POLL_FOR_ANOTHER_CALLERS_RUN_INTERVAL_MS +
        WORKFLOW_RUN_UPDATE_STATUS_INTERVAL_MS
    );

    expect(createWorkflowDispatch).not.toHaveBeenCalled();
    expect(await resultPromise).toEqual({
      baseTestRunExists: true,
      baseResolutionDetails: expect.objectContaining({
        type: "waited-for-existing-workflow-run",
        workflowId: "11",
        baseCommitSha: BASE_SHA,
      }),
    });
  });

  it("gives up rather than dispatching a duplicate when the other job's build never appears", async () => {
    vi.useFakeTimers();
    takeBaseWorkflowDispatchLease.mockResolvedValue(false);
    const createWorkflowDispatch = vi.fn();
    const octokit = buildOctokit({ createWorkflowDispatch });

    const resultPromise = tryTriggerTestsWorkflowOnBase({
      logger,
      event,
      apiToken: "token",
      base: BASE_SHA,
      context,
      octokit,
    });
    await vi.advanceTimersByTimeAsync(
      WORKFLOW_RUN_COMPLETION_TIMEOUT_MS +
        POLL_FOR_ANOTHER_CALLERS_RUN_INTERVAL_MS
    );

    expect(createWorkflowDispatch).not.toHaveBeenCalled();
    expect(await resultPromise).toEqual({
      baseTestRunExists: false,
      baseResolutionDetails: expect.objectContaining({
        type: "failed-for-other-reason",
      }),
    });
    // Listing runs costs the job's rate limit, so the search gives up long before the wait does.
    expect(
      vi.mocked(octokit.rest.actions.listWorkflowRuns).mock.calls.length
    ).toBeLessThanOrEqual(15);
  });

  it("finds the build of a lease taken a while before we asked", async () => {
    vi.useFakeTimers();
    takeBaseWorkflowDispatchLease.mockResolvedValue(false);
    // A refusal comes at any point in the lease's two-minute life, so the dispatch we're being
    // held off can already be most of that old by the time we hear about it.
    const octokit = buildOctokit({
      dispatchedRuns: [dispatchedRun(11, 110)],
    });

    const resultPromise = tryTriggerTestsWorkflowOnBase({
      logger,
      event,
      apiToken: "token",
      base: BASE_SHA,
      context,
      octokit,
    });
    await vi.advanceTimersByTimeAsync(
      POLL_FOR_ANOTHER_CALLERS_RUN_INTERVAL_MS +
        WORKFLOW_RUN_UPDATE_STATUS_INTERVAL_MS
    );

    expect(await resultPromise).toEqual({
      baseTestRunExists: true,
      baseResolutionDetails: expect.objectContaining({
        type: "waited-for-existing-workflow-run",
        workflowId: "11",
      }),
    });
  });

  it("doesn't mistake an unrelated dispatch for the build while the holder's is unlisted", async () => {
    vi.useFakeTimers();
    takeBaseWorkflowDispatchLease.mockResolvedValue(false);
    // Some other pull request's base, dispatched a minute ago against the same branch.
    const dispatchedRuns: unknown[] = [dispatchedRun(11, 60)];
    const octokit = buildOctokit({ dispatchedRuns });

    const resultPromise = tryTriggerTestsWorkflowOnBase({
      logger,
      event,
      apiToken: "token",
      base: BASE_SHA,
      context,
      octokit,
      getBaseTestRun: vi.fn().mockResolvedValue(null),
    });
    // GitHub starts listing the lease holder's run a few seconds in, before we first look.
    await vi.advanceTimersByTimeAsync(5_000);
    dispatchedRuns.push(dispatchedRun(12));
    await vi.advanceTimersByTimeAsync(WORKFLOW_RUN_COMPLETION_TIMEOUT_MS);

    expect(await resultPromise).toEqual({
      baseTestRunExists: false,
      baseResolutionDetails: expect.objectContaining({
        type: "failed-for-other-reason",
      }),
    });
  });

  it("doesn't wait on a run it can't tell is building the base", async () => {
    vi.useFakeTimers();
    takeBaseWorkflowDispatchLease.mockResolvedValue(false);
    // Two dispatches in the same window, and nothing in either says which commit it is building.
    // Waiting on the wrong one would have us report a base that was never built.
    const octokit = buildOctokit({
      dispatchedRuns: [dispatchedRun(11), dispatchedRun(12)],
    });
    const getBaseTestRun = vi.fn().mockResolvedValue(null);

    const resultPromise = tryTriggerTestsWorkflowOnBase({
      logger,
      event,
      apiToken: "token",
      base: BASE_SHA,
      context,
      octokit,
      getBaseTestRun,
    });
    await vi.advanceTimersByTimeAsync(
      WORKFLOW_RUN_COMPLETION_TIMEOUT_MS +
        POLL_FOR_ANOTHER_CALLERS_RUN_INTERVAL_MS
    );

    expect(await resultPromise).toEqual({
      baseTestRunExists: false,
      baseResolutionDetails: expect.objectContaining({
        type: "failed-for-other-reason",
      }),
    });
    // It kept looking for the base test run throughout, which is the only thing that can tell it
    // one of those runs built the base.
    expect(getBaseTestRun.mock.calls.length).toBeGreaterThan(100);
  });

  it("doesn't take a lease it isn't going to use", async () => {
    vi.useFakeTimers();
    // Something is already building the base, so we wait on that rather than asking for a lease
    // we'd only hold off other callers with.
    const octokit = buildOctokit({
      workflowRuns: [pushRun(BASE_SHA, "queued", 12)],
    });

    const resultPromise = tryTriggerTestsWorkflowOnBase({
      logger,
      event,
      apiToken: "token",
      base: BASE_SHA,
      context,
      octokit,
    });
    await vi.advanceTimersByTimeAsync(WORKFLOW_RUN_UPDATE_STATUS_INTERVAL_MS);
    await resultPromise;

    expect(takeBaseWorkflowDispatchLease).not.toHaveBeenCalled();
  });

  it("dispatches when the base's own run has already finished", async () => {
    vi.useFakeTimers();
    const createWorkflowDispatch = vi
      .fn()
      .mockResolvedValue({ data: { workflow_run_id: 99 } });
    const octokit = buildOctokit({
      workflowRuns: [pushRun(BASE_SHA, "completed", 8)],
      createWorkflowDispatch,
    });

    const resultPromise = tryTriggerTestsWorkflowOnBase({
      logger,
      event,
      apiToken: "token",
      base: BASE_SHA,
      context,
      octokit,
    });
    await vi.advanceTimersByTimeAsync(WORKFLOW_RUN_UPDATE_STATUS_INTERVAL_MS);
    await resultPromise;

    expect(createWorkflowDispatch).toHaveBeenCalled();
  });
});

describe("ensureBaseTestsExists", () => {
  beforeEach(() => {
    takeBaseWorkflowDispatchLease.mockReset().mockResolvedValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("takes a base test run that appears while the workflow is still running", async () => {
    vi.useFakeTimers();
    // Someone else's build of the same base can finish the job for us, which matters when two
    // dispatches land close enough together that neither can tell which run is its own.
    const getBaseTestRun = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValue({ id: "test-run-id" } as TestRun);
    const octokit = buildOctokit({
      workflowRuns: [pushRun(BASE_SHA, "in_progress", 9)],
      dispatchedRunStatus: { status: "in_progress", conclusion: null },
    });

    const result = await ensureBaseTestsExists({
      event,
      apiToken: "token",
      base: BASE_SHA,
      context,
      octokit,
      getBaseTestRun,
      logger,
    });

    expect(getBaseTestRun).toHaveBeenCalledWith({ baseSha: BASE_SHA });
    expect(getBaseTestRun.mock.calls.length).toBeGreaterThan(1);
    expect(result).toEqual({
      baseTestRunExists: true,
      baseResolutionDetails: {
        type: "suitable-test-run-already-existed",
        testRunId: "test-run-id",
      },
    });

    // Let the workflow arm notice it has been cancelled rather than leaving its poll pending.
    await vi.advanceTimersByTimeAsync(WORKFLOW_RUN_UPDATE_STATUS_INTERVAL_MS);
  });

  it("counts a base the backend resolved to an earlier commit rather than building one", async () => {
    // Nothing has run at the merge base, but under a monorepo setup the backend will happily
    // compare against an older tested ancestor, so building it would buy nothing.
    const createWorkflowDispatch = vi.fn();
    const octokit = buildOctokit({ createWorkflowDispatch });

    const result = await ensureBaseTestsExists({
      event,
      apiToken: "token",
      base: BASE_SHA,
      context,
      octokit,
      getBaseTestRun: vi.fn().mockResolvedValue(null),
      getBaseTestRunResolvedByBackend: vi
        .fn()
        .mockResolvedValue({ id: "ancestor-test-run-id" } as TestRun),
      logger,
    });

    expect(createWorkflowDispatch).not.toHaveBeenCalled();
    expect(result).toEqual({
      baseTestRunExists: true,
      baseResolutionDetails: {
        type: "suitable-test-run-already-existed",
        testRunId: "ancestor-test-run-id",
      },
    });
  });

  it("builds the base when the backend has no base of its own either", async () => {
    vi.useFakeTimers();
    const createWorkflowDispatch = vi
      .fn()
      .mockResolvedValue({ data: { workflow_run_id: 99 } });
    const octokit = buildOctokit({ createWorkflowDispatch });

    const resultPromise = ensureBaseTestsExists({
      event,
      apiToken: "token",
      base: BASE_SHA,
      context,
      octokit,
      getBaseTestRun: vi.fn().mockResolvedValue(null),
      getBaseTestRunResolvedByBackend: vi.fn().mockResolvedValue(null),
      logger,
    });
    await vi.advanceTimersByTimeAsync(WORKFLOW_RUN_UPDATE_STATUS_INTERVAL_MS);

    expect(await resultPromise).toEqual({
      baseTestRunExists: true,
      baseResolutionDetails: expect.objectContaining({
        type: "triggered-new-workflow-run-successfully",
      }),
    });
    expect(createWorkflowDispatch).toHaveBeenCalled();
  });

  it("doesn't ask the backend when the base commit has itself been tested", async () => {
    const getBaseTestRunResolvedByBackend = vi.fn();

    await ensureBaseTestsExists({
      event,
      apiToken: "token",
      base: BASE_SHA,
      context,
      octokit: buildOctokit(),
      getBaseTestRun: vi.fn().mockResolvedValue({ id: "base-run" } as TestRun),
      getBaseTestRunResolvedByBackend,
      logger,
    });

    expect(getBaseTestRunResolvedByBackend).not.toHaveBeenCalled();
  });

  it("doesn't ask the backend outside a pull request, where we'd never build a base anyway", async () => {
    const getBaseTestRunResolvedByBackend = vi.fn();

    const result = await ensureBaseTestsExists({
      event: {
        type: "push",
        payload: { before: ANCESTOR_SHA, after: BASE_SHA, ref: "main" },
      },
      apiToken: "token",
      base: BASE_SHA,
      context,
      octokit: buildOctokit(),
      getBaseTestRun: vi.fn().mockResolvedValue(null),
      getBaseTestRunResolvedByBackend,
      logger,
    });

    expect(getBaseTestRunResolvedByBackend).not.toHaveBeenCalled();
    expect(result).toEqual({ baseTestRunExists: false });
  });

  it("stops polling once the base workflow has failed", async () => {
    vi.useFakeTimers();
    const getBaseTestRun = vi.fn().mockResolvedValue(null);
    const octokit = buildOctokit({
      workflowRuns: [pushRun(BASE_SHA, "in_progress", 10)],
      dispatchedRunStatus: { status: "completed", conclusion: "failure" },
    });

    // Attached before the timers advance so the rejection is never momentarily unhandled.
    const rejection = expect(
      ensureBaseTestsExists({
        event,
        apiToken: "token",
        base: BASE_SHA,
        context,
        octokit,
        getBaseTestRun,
        logger,
      })
    ).rejects.toThrow("did not complete successfully");
    await vi.advanceTimersByTimeAsync(WORKFLOW_RUN_UPDATE_STATUS_INTERVAL_MS);
    await rejection;

    // The poll wakes from its sleep once more to notice it has been cancelled, and then stops.
    await vi.advanceTimersByTimeAsync(POLL_FOR_BASE_TEST_RUN_INTERVAL_MS);
    const callsOnceCancellationWasNoticed = getBaseTestRun.mock.calls.length;
    await vi.advanceTimersByTimeAsync(POLL_FOR_BASE_TEST_RUN_INTERVAL_MS * 100);

    expect(getBaseTestRun.mock.calls.length).toBe(
      callsOnceCancellationWasNoticed
    );
  });
});
