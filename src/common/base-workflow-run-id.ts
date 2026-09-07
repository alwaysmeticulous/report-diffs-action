import { exportVariable, setOutput, warning as ghWarning } from "@actions/core";
import log from "loglevel";
import {
  BASE_COMMIT_SHA_OUTPUT,
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
 * Records a base-build run id, and the commit it is building, as step outputs and job env vars.
 *
 * The env vars are what make the handoff work within a job without the caller wiring
 * `${{ steps.*.outputs.* }}`: `exportVariable` writes `GITHUB_ENV`, so later steps in the same
 * job see them automatically. Env vars do not cross jobs, so another job has to be passed the
 * outputs instead.
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
  setOutput(BASE_COMMIT_SHA_OUTPUT, baseCommitSha);
  exportVariable(BASE_WORKFLOW_RUN_ID_ENV, id);
  exportVariable(BASE_WORKFLOW_COMMIT_SHA_ENV, baseCommitSha);
};

/**
 * A base build the caller already knows about, either passed to this step or recorded by an
 * earlier ensure-base step in the same job.
 *
 * A run id is only honoured for the base it is building. Steps and jobs resolve the base for
 * themselves, and a job that checks out something other than `GITHUB_SHA` lands on a different
 * commit than the one ensure-base could see before that checkout happened, so a run id alone
 * does not say which base it belongs to. Waiting on a build of the other commit would report a
 * base with no snapshots at it; refusing the id instead falls back to dispatching a build of
 * this base.
 *
 * A run id passed in without the commit it is building cannot be checked, and is honoured as the
 * caller's own assertion that it builds their base. That is warned about rather than refused,
 * because refusing would discard a base build the caller deliberately pointed us at.
 */
export const readKnownBaseWorkflowRunId = ({
  workflowRunIdInput,
  baseCommitShaInput,
  baseCommitSha,
  logger,
}: {
  workflowRunIdInput?: string | undefined;
  baseCommitShaInput?: string | undefined;
  baseCommitSha: string | null;
  logger: log.Logger;
}): number | undefined => {
  const fromInput = parseWorkflowRunId(workflowRunIdInput);
  if (fromInput != null) {
    const assertedBaseCommitSha = baseCommitShaInput?.trim();
    if (!assertedBaseCommitSha) {
      const message =
        `Waiting on workflow run ${fromInput} for the base build without checking what it is building,` +
        ` because '${BASE_WORKFLOW_RUN_ID_OUTPUT}' was passed without '${BASE_COMMIT_SHA_OUTPUT}'.` +
        ` If that run is not building ${
          baseCommitSha ?? "this run's base commit"
        } there will be nothing to compare against.` +
        ` Pass both outputs of the ensure-base step to have this checked.`;
      logger.warn(message);
      ghWarning(message);
      return fromInput;
    }
    return isBuildingBase({
      source: "passed to this step",
      workflowRunId: fromInput,
      runBaseCommitSha: assertedBaseCommitSha,
      baseCommitSha,
      logger,
    })
      ? fromInput
      : undefined;
  }

  const fromEnv = parseWorkflowRunId(process.env[BASE_WORKFLOW_RUN_ID_ENV]);
  if (fromEnv == null) {
    return undefined;
  }

  return isBuildingBase({
    source: "recorded for this job",
    workflowRunId: fromEnv,
    runBaseCommitSha: process.env[BASE_WORKFLOW_COMMIT_SHA_ENV]?.trim(),
    baseCommitSha,
    logger,
  })
    ? fromEnv
    : undefined;
};

const isBuildingBase = ({
  source,
  workflowRunId,
  runBaseCommitSha,
  baseCommitSha,
  logger,
}: {
  source: string;
  workflowRunId: number;
  runBaseCommitSha: string | undefined;
  baseCommitSha: string | null;
  logger: log.Logger;
}): boolean => {
  if (baseCommitSha != null && runBaseCommitSha === baseCommitSha) {
    return true;
  }
  logger.warn(
    `Ignoring the base workflow run ${source} (${workflowRunId}): it is building ${
      runBaseCommitSha ?? "a commit it did not name"
    }, and the base to compare against here is ${baseCommitSha ?? "unknown"}.`
  );
  return false;
};
