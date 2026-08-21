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
