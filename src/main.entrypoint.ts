import { setFailed } from "@actions/core";
import * as Sentry from "@sentry/node";
import { runMeticulousTestsAction } from "./actions/main/main";

runMeticulousTestsAction().catch(async (error) => {
  // Capture unexpected errors
  Sentry.captureException(error);

  const message = error instanceof Error ? error.message : `${error}`;
  setFailed(message);

  await Sentry.flush(5_000); // Wait for Sentry to flush before exiting
  process.exit(1);
});
