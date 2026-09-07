import { exportVariable, setOutput } from "@actions/core";
import log from "loglevel";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  parseWorkflowRunId,
  readKnownBaseWorkflowRunId,
  recordBaseWorkflowRunId,
} from "../base-workflow-run-id";
import {
  BASE_WORKFLOW_COMMIT_SHA_ENV,
  BASE_WORKFLOW_RUN_ID_ENV,
  BASE_WORKFLOW_RUN_ID_OUTPUT,
} from "../constants";

vi.mock("@actions/core", () => ({
  setOutput: vi.fn(),
  exportVariable: vi.fn(),
}));

const BASE_SHA = "1111111111111111111111111111111111111111";
const OTHER_SHA = "2222222222222222222222222222222222222222";

const logger = log.getLogger("base-workflow-run-id.spec");
logger.setLevel("silent");

describe("parseWorkflowRunId", () => {
  it("accepts a positive integer", () => {
    expect(parseWorkflowRunId("33731751434")).toBe(33731751434);
  });

  it.each([undefined, "", "  ", "abc", "0", "-1", "12.3", "1e2"])(
    "rejects %j",
    (value) => {
      expect(parseWorkflowRunId(value)).toBeUndefined();
    }
  );
});

describe("recordBaseWorkflowRunId", () => {
  it("writes the step output and the job env vars", () => {
    recordBaseWorkflowRunId({ workflowRunId: 99, baseCommitSha: BASE_SHA });

    expect(setOutput).toHaveBeenCalledWith(BASE_WORKFLOW_RUN_ID_OUTPUT, "99");
    expect(exportVariable).toHaveBeenCalledWith(BASE_WORKFLOW_RUN_ID_ENV, "99");
    expect(exportVariable).toHaveBeenCalledWith(
      BASE_WORKFLOW_COMMIT_SHA_ENV,
      BASE_SHA
    );
  });
});

describe("readKnownBaseWorkflowRunId", () => {
  const original = {
    runId: process.env[BASE_WORKFLOW_RUN_ID_ENV],
    commitSha: process.env[BASE_WORKFLOW_COMMIT_SHA_ENV],
  };

  const restore = (name: string, value: string | undefined) => {
    if (value == null) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  };

  afterEach(() => {
    restore(BASE_WORKFLOW_RUN_ID_ENV, original.runId);
    restore(BASE_WORKFLOW_COMMIT_SHA_ENV, original.commitSha);
  });

  it("prefers the explicit input over the env var", () => {
    process.env[BASE_WORKFLOW_RUN_ID_ENV] = "1";
    process.env[BASE_WORKFLOW_COMMIT_SHA_ENV] = BASE_SHA;

    expect(
      readKnownBaseWorkflowRunId({
        input: "2",
        baseCommitSha: BASE_SHA,
        logger,
      })
    ).toBe(2);
  });

  it("takes the explicit input for whatever base the caller resolved", () => {
    expect(
      readKnownBaseWorkflowRunId({
        input: "2",
        baseCommitSha: OTHER_SHA,
        logger,
      })
    ).toBe(2);
  });

  it("falls back to the env var ensure-base exported", () => {
    process.env[BASE_WORKFLOW_RUN_ID_ENV] = "33731751434";
    process.env[BASE_WORKFLOW_COMMIT_SHA_ENV] = BASE_SHA;

    expect(
      readKnownBaseWorkflowRunId({ baseCommitSha: BASE_SHA, logger })
    ).toBe(33731751434);
  });

  // Each step resolves the base for itself, so the same job can want two different commits — a
  // custom checkout ref is enough to do it. Waiting on the recorded run would then report a base
  // with no snapshots at it.
  it("refuses a recorded run building a different commit", () => {
    process.env[BASE_WORKFLOW_RUN_ID_ENV] = "33731751434";
    process.env[BASE_WORKFLOW_COMMIT_SHA_ENV] = OTHER_SHA;

    expect(
      readKnownBaseWorkflowRunId({ baseCommitSha: BASE_SHA, logger })
    ).toBeUndefined();
  });

  it("refuses a recorded run that names no commit", () => {
    process.env[BASE_WORKFLOW_RUN_ID_ENV] = "33731751434";
    delete process.env[BASE_WORKFLOW_COMMIT_SHA_ENV];

    expect(
      readKnownBaseWorkflowRunId({ baseCommitSha: BASE_SHA, logger })
    ).toBeUndefined();
  });

  it("refuses a recorded run when there is no base to compare against", () => {
    process.env[BASE_WORKFLOW_RUN_ID_ENV] = "33731751434";
    process.env[BASE_WORKFLOW_COMMIT_SHA_ENV] = BASE_SHA;

    expect(
      readKnownBaseWorkflowRunId({ baseCommitSha: null, logger })
    ).toBeUndefined();
  });
});
