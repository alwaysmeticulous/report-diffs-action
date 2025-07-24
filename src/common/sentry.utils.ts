import * as Sentry from "@sentry/node";

/**
 * Enriches Sentry context with GitHub Actions environment information
 * This should be called at the start of each workflow after Sentry is initialized
 */
export function enrichSentryContextWithGitHubActionsContext(): void {
  try {
    const {
      GITHUB_REPOSITORY,
      GITHUB_RUN_ID,
      GITHUB_RUN_NUMBER,
      GITHUB_WORKFLOW,
      GITHUB_ACTION,
      GITHUB_ACTOR,
      GITHUB_REF,
      GITHUB_SHA,
      RUNNER_OS,
      RUNNER_ARCH,
    } = process.env;

    Sentry.setTags({
      github_repository: GITHUB_REPOSITORY,
      github_workflow: GITHUB_WORKFLOW,
      github_run_id: GITHUB_RUN_ID,
      runner_os: RUNNER_OS,
      runner_arch: RUNNER_ARCH,
    });

    Sentry.setContext("github_action", {
      repository: GITHUB_REPOSITORY,
      run_id: GITHUB_RUN_ID,
      run_number: GITHUB_RUN_NUMBER,
      workflow: GITHUB_WORKFLOW,
      action: GITHUB_ACTION,
      actor: GITHUB_ACTOR,
      ref: GITHUB_REF,
      sha: GITHUB_SHA,
    });
  } catch (e) {
    console.debug(
      "Error enriching Sentry context with GitHub Actions context",
      e
    );
  }
}
