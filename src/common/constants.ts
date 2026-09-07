export const METICULIOUS_APP_URL = "https://app.meticulous.ai";

export const DOCS_URL = `${METICULIOUS_APP_URL}/docs/github-actions-v2`;

export const METICULOUS_DEBUGGING_PR_TAG = "[meticulous debug]";

/**
 * `workflow_dispatch` input naming the commit a dispatched workflow should build.
 *
 * GitHub only accepts a branch or tag as the dispatch ref, never a commit, so the commit we
 * want built travels as an input and the workflow checks it out. Workflows that don't declare
 * the input can only ever build whatever their branch currently points at.
 */
export const COMMIT_SHA_WORKFLOW_INPUT = "meticulous-commit-sha";

/**
 * Step output / env var that carries the GitHub workflow run ensure-base
 * dispatched (or found already pending), so a later upload step in the same
 * job can wait on that run instead of looking it up by commit SHA.
 *
 * A pinned `workflow_dispatch` run's `head_sha` is the dispatched ref's tip,
 * not the commit named in {@link COMMIT_SHA_WORKFLOW_INPUT}, so a lookup by
 * SHA cannot find it.
 */
export const BASE_WORKFLOW_RUN_ID_OUTPUT = "base-workflow-run-id";
export const BASE_WORKFLOW_RUN_ID_ENV = "METICULOUS_BASE_WORKFLOW_RUN_ID";

/**
 * Env var naming the base commit that {@link BASE_WORKFLOW_RUN_ID_ENV}'s run is building.
 *
 * Steps in a job resolve the base independently and can land on different commits, so a run id
 * on its own does not say which base it belongs to. Waiting on a build of the other commit would
 * report a base that has no snapshots at it, so the two travel together and the id is only
 * honoured for the commit it was recorded against.
 */
export const BASE_WORKFLOW_COMMIT_SHA_ENV =
  "METICULOUS_BASE_WORKFLOW_COMMIT_SHA";
