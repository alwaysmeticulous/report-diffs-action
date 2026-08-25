import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";
import { TestRun } from "@alwaysmeticulous/client";
import log from "loglevel";
import { describe, it, expect, vi, afterEach } from "vitest";
import { CodeChangeEvent } from "../../types";
import { COMMIT_SHA_WORKFLOW_INPUT } from "../constants";
import {
  ensureBaseTestsExists,
  tryTriggerTestsWorkflowOnBase,
} from "../ensure-base-exists.utils";

const BASE_SHA = "1111111111111111111111111111111111111111";
const ANCESTOR_SHA = "2222222222222222222222222222222222222222";

const WORKFLOW_ID = 42;

const WORKFLOW_RUN_UPDATE_STATUS_INTERVAL_MS = 5_000;

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
      base: BASE_SHA,
      context,
      octokit,
    });
    await vi.advanceTimersByTimeAsync(WORKFLOW_RUN_UPDATE_STATUS_INTERVAL_MS);
    await resultPromise;

    expect(createWorkflowDispatch).toHaveBeenCalled();
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
});
