import { exportVariable, setOutput } from "@actions/core";
import {
  BASE_WORKFLOW_RUN_ID_ENV,
  BASE_WORKFLOW_RUN_ID_OUTPUT,
} from "./constants";

/**
 * Parses a GitHub workflow run id from a step input or env var.
 *
 * GitHub run ids are positive integers well inside `Number.MAX_SAFE_INTEGER`.
 * Anything else is ignored so a typo cannot be treated as a run to wait on.
 */
export const parseWorkflowRunId = (
  value: string | undefined
): number | undefined => {
  const trimmed = value?.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) {
    return undefined;
  }
  const id = Number(trimmed);
  return id > 0 ? id : undefined;
};

/**
 * Records a base-build run id as both a step output and a job env var.
 *
 * The env var is what makes the handoff work without the caller wiring
 * `${{ steps.*.outputs.base-workflow-run-id }}`: `exportVariable` writes
 * `GITHUB_ENV`, so later steps in the same job see it automatically.
 */
export const recordBaseWorkflowRunId = (
  workflowRunId: number | string
): void => {
  const id = String(workflowRunId);
  setOutput(BASE_WORKFLOW_RUN_ID_OUTPUT, id);
  exportVariable(BASE_WORKFLOW_RUN_ID_ENV, id);
};

/**
 * A run id the caller already knows, from an explicit input or from
 * {@link BASE_WORKFLOW_RUN_ID_ENV} left by an earlier ensure-base step.
 */
export const readKnownBaseWorkflowRunId = (
  input?: string
): number | undefined =>
  parseWorkflowRunId(input) ??
  parseWorkflowRunId(process.env[BASE_WORKFLOW_RUN_ID_ENV]);
