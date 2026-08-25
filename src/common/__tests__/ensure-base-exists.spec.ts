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
  createWorkflowDispatch = vi
    .fn()
    .mockResolvedValue({ data: { workflow_run_id: 99 } }),
  dispatchedRunStatus = { status: "completed", conclusion: "success" },
}: {
  workflowRuns?: unknown[];
  commits?: unknown[];
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
        listWorkflowRuns: vi.fn(),
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
    const workflowRuns: unknown[] = [];
    const octokit = buildOctokit({ workflowRuns, createWorkflowDispatch });

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

    workflowRuns.push(pushRun(BASE_SHA, "in_progress", 11));
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
    // Listing runs is a paginated read against a job-scoped rate limit, so the search gives up
    // long before the wait does: half an hour of it would be hundreds of requests.
    expect(
      vi.mocked(octokit.paginate.iterator).mock.calls.length
    ).toBeLessThanOrEqual(15);
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
