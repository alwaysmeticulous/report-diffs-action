import { setFailed } from "@actions/core";
import * as Sentry from "@sentry/node";
import { runMeticulousTestsCloudComputeAction } from "./actions/cloud-compute/cloud-compute";

runMeticulousTestsCloudComputeAction().catch(async (error) => {
  Sentry.captureException(error);

  const message = error instanceof Error ? error.message : `${error}`;
  setFailed(message);

  await Sentry.flush(5_000); // Wait for Sentry to flush before exiting
  process.exit(1);
});
