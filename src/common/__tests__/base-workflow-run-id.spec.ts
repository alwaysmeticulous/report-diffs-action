import { exportVariable, setOutput } from "@actions/core";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  parseWorkflowRunId,
  readKnownBaseWorkflowRunId,
  recordBaseWorkflowRunId,
} from "../base-workflow-run-id";
import {
  BASE_WORKFLOW_RUN_ID_ENV,
  BASE_WORKFLOW_RUN_ID_OUTPUT,
} from "../constants";

vi.mock("@actions/core", () => ({
  setOutput: vi.fn(),
  exportVariable: vi.fn(),
}));

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
  it("writes the step output and the job env var", () => {
    recordBaseWorkflowRunId(99);

    expect(setOutput).toHaveBeenCalledWith(BASE_WORKFLOW_RUN_ID_OUTPUT, "99");
    expect(exportVariable).toHaveBeenCalledWith(BASE_WORKFLOW_RUN_ID_ENV, "99");
  });
});

describe("readKnownBaseWorkflowRunId", () => {
  const original = process.env[BASE_WORKFLOW_RUN_ID_ENV];

  afterEach(() => {
    if (original == null) {
      delete process.env[BASE_WORKFLOW_RUN_ID_ENV];
    } else {
      process.env[BASE_WORKFLOW_RUN_ID_ENV] = original;
    }
  });

  it("prefers the explicit input over the env var", () => {
    process.env[BASE_WORKFLOW_RUN_ID_ENV] = "1";
    expect(readKnownBaseWorkflowRunId("2")).toBe(2);
  });

  it("falls back to the env var ensure-base exported", () => {
    process.env[BASE_WORKFLOW_RUN_ID_ENV] = "33731751434";
    expect(readKnownBaseWorkflowRunId()).toBe(33731751434);
  });
});
