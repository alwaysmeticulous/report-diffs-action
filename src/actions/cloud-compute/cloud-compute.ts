import { setFailed } from "@actions/core";
import { initSentry } from "@alwaysmeticulous/sentry";
import { getHeadCommitShaFromRepo } from "../../common/get-base-and-head-commit-shas";
import { initLogger } from "../../common/logger.utils";
import { getInCloudActionInputs } from "./get-inputs";
import { runOneTestRun } from "./run-test-run";

export const runMeticulousTestsCloudComputeAction = async (): Promise<void> => {
  const logger = initLogger();
  // Init Sentry without sampling traces on the action run.
  // Children processes, (test run executions) will use
  // the global sample rate.
  const sentryHub = await initSentry(
    "report-diffs-action-cloud-compute-v1",
    1.0
  );

  const transaction = sentryHub.startTransaction({
    name: "report-diffs-action.runMeticulousTestsActionInCloud",
    description: "Run Meticulous tests action (in cloud)",
    op: "report-diffs-action.runMeticulousTestsActionInCloud",
  });

  let failureMessage = "";
  const {
    projectTargets,
    headSha: headShaFromInput,
    githubToken,
  } = getInCloudActionInputs();

  // Compute the HEAD commit SHA to use when creating a test run.
  // In a PR workflow this will by default be process.env.GITHUB_SHA (the temporary merge commit) or
  // sometimes the head commit of the PR.
  // Users can also explicitly provide the head commit SHA to use as input. This is useful when the action is not
  // run with the code checked out.
  // Our backend is responsible for computing the correct BASE commit to create the test run for.
  const headSha = headShaFromInput || getHeadCommitShaFromRepo();

  const skippedTargets = projectTargets.filter((target) => target.skip);
  const projectTargetsToRun = projectTargets.filter((target) => !target.skip);

  // Single test run execution is a special case where we run a single test run with the "default" name.
  // This will be the case when the user provides `app-url` and `api-token` inputs directly.
  // This is used to simplify some of the logging and error handling.
  const isSingleTestRunExecution =
    projectTargets.length === 1 && projectTargets[0].name === "default";

  // Log skipped targets, if any
  if (skippedTargets.length > 0) {
    const skippedTargetNames = skippedTargets.map((target) => target.name);
    logger.info(
      `Skipping test runs for the following targets: ${skippedTargetNames.join(
        ", "
      )}`
    );
  }

  (
    await Promise.allSettled(
      projectTargetsToRun.map((target) =>
        runOneTestRun({
          testRunId: target.name,
          apiToken: target.apiToken,
          appUrl: target.appUrl,
          githubToken,
          headSha,
          isSingleTestRunExecution,
        })
      )
    )
  ).forEach((result, index) => {
    if (result.status === "rejected") {
      const message =
        result.reason instanceof Error
          ? result.reason.message
          : `${result.reason}`;

      if (!isSingleTestRunExecution) {
        failureMessage += `Test run ${projectTargetsToRun[index].name} failed: ${message}\n`;
      } else {
        failureMessage = message;
      }
    }
  });
  if (failureMessage) {
    setFailed(failureMessage);
    transaction.setStatus("unknown_error");
  } else {
    transaction.setStatus("ok");
  }
  transaction.finish();
  await sentryHub.getClient()?.close(5_000);
  process.exit(failureMessage ? 1 : 0);
};
