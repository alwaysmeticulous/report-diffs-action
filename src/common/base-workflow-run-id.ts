import { exportVariable, setOutput } from "@actions/core";
import log from "loglevel";
import {
  BASE_WORKFLOW_COMMIT_SHA_ENV,
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
 * Records a base-build run id, and the commit it is building, as a step output and job env vars.
 *
 * The env vars are what make the handoff work without the caller wiring
 * `${{ steps.*.outputs.base-workflow-run-id }}`: `exportVariable` writes
 * `GITHUB_ENV`, so later steps in the same job see them automatically.
 */
export const recordBaseWorkflowRunId = ({
  workflowRunId,
  baseCommitSha,
}: {
  workflowRunId: number | string;
  baseCommitSha: string;
}): void => {
  const id = String(workflowRunId);
  setOutput(BASE_WORKFLOW_RUN_ID_OUTPUT, id);
  exportVariable(BASE_WORKFLOW_RUN_ID_ENV, id);
  exportVariable(BASE_WORKFLOW_COMMIT_SHA_ENV, baseCommitSha);
};

/**
 * A run id the caller already knows, from an explicit input or from an earlier ensure-base step
 * in the same job.
 *
 * The env var is only honoured for the commit it was recorded against. Each step resolves the
 * base for itself, and a job that checks out a custom ref lands on a different commit than the
 * one ensure-base could see before the checkout happened. Waiting on a build of the other commit
 * would report a base with no snapshots at it; refusing the id instead falls back to dispatching
 * a build of this base.
 *
 * An explicit input is the caller's own assertion that the run builds their base — the only way
 * to wire the handoff across jobs, where we cannot know how they resolved it — so it is taken at
 * face value.
 */
export const readKnownBaseWorkflowRunId = ({
  input,
  baseCommitSha,
  logger,
}: {
  input?: string | undefined;
  baseCommitSha: string | null;
  logger: log.Logger;
}): number | undefined => {
  const fromInput = parseWorkflowRunId(input);
  if (fromInput != null) {
    return fromInput;
  }

  const fromEnv = parseWorkflowRunId(process.env[BASE_WORKFLOW_RUN_ID_ENV]);
  if (fromEnv == null) {
    return undefined;
  }

  const recordedBaseCommitSha =
    process.env[BASE_WORKFLOW_COMMIT_SHA_ENV]?.trim();
  if (baseCommitSha == null || recordedBaseCommitSha !== baseCommitSha) {
    logger.warn(
      `Ignoring the base workflow run recorded for this job (${fromEnv}): it is building ${
        recordedBaseCommitSha ?? "a commit it did not record"
      }, and the base to compare against here is ${baseCommitSha ?? "unknown"}.`
    );
    return undefined;
  }

  return fromEnv;
};
