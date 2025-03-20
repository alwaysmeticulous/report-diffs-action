import { setFailed } from "@actions/core";
import { initSentry } from "@alwaysmeticulous/sentry";
import * as Sentry from "@sentry/node";
import { initLogger } from "../../common/logger.utils";
import { getHeadCommitSha } from "./get-head-commit-sha";
import { getInCloudActionInputs } from "./get-inputs";
import { runOneTestRun } from "./run-test-run";

export const runMeticulousTestsCloudComputeAction = async (): Promise<void> => {
  const logger = initLogger();
  // Init Sentry without sampling traces on the action run.
  // Children processes, (test run executions) will use
  // the global sample rate.
  await initSentry("report-diffs-action-cloud-compute-v1", 1.0);

  const failureMessage = await Sentry.startSpan(
    {
      name: "report-diffs-action.runMeticulousTestsActionInCloud",
      op: "report-diffs-action.runMeticulousTestsActionInCloud",
    },
    async (span) => {
      let failureMessage = "";
      const {
        projectTargets,
        headSha: headShaFromInput,
        githubToken,
        secureTunnelHost,
      } = getInCloudActionInputs();

      const headSha = await getHeadCommitSha({
        headShaFromInput,
        logger,
      });
      if (headSha.type === "error") {
        // We can't proceed if we don't know the commit SHA
        throw headSha.error;
      }

      const skippedTargets = projectTargets.filter((target) => target.skip);
      const projectTargetsToRun = projectTargets.filter(
        (target) => !target.skip
      );

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
              headSha: headSha.sha,
              isSingleTestRunExecution,
              ...(secureTunnelHost ? { secureTunnelHost } : {}),
            }).catch((e) => {
              if (projectTargets.length > 1) {
                logger.error(`Failed to execute tests for ${target.name}`, e);
              } else {
                logger.error(e);
              }
              throw e;
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
        span.setStatus({ code: 2, message: "unknown_error" });
        return failureMessage;
      } else {
        span.setStatus({ code: 1, message: "ok" });
      }
    }
  );
  await Sentry.getClient()?.close(5_000);
  process.exit(failureMessage ? 1 : 0);
};
