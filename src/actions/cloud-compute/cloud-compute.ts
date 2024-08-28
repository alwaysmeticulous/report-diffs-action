import { error, setFailed } from "@actions/core";
import { initSentry } from "@alwaysmeticulous/sentry";
import { getInCloudActionInputs } from "./get-inputs";
import { runOneTestRun } from "./run-test-run";

export const runMeticulousTestsCloudComputeAction = async (): Promise<void> => {
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
  const { apiToken: apiTokenInput, appUrl: appUrlInput } =
    getInCloudActionInputs();
  const apiTokens = apiTokenInput.split(",").map((token) => token.trim());
  const appUrls = appUrlInput.split(",").map((token) => token.trim());
  while (appUrls.length < apiTokens.length) {
    // If the number of app URLs is less than the number of API tokens, the
    // last URL will be used for all remaining projects. This allow for
    // more concise inputs when one app URL is to be used many times. In
    // particular in the common case of one app URL for all projects.
    appUrls.push(appUrls[appUrls.length - 1]);
  }
  (
    await Promise.allSettled(
      apiTokens.map((token, index) =>
        runOneTestRun(token, appUrls[index], index)
      )
    )
  ).forEach((result, index) => {
    if (result.status === "rejected") {
      const message =
        result.reason instanceof Error ? result.reason.message : `${error}`;
      failureMessage += `Run #${index + 1} failed: ${message}\n`;
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
