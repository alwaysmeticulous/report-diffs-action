import "source-map-support/register";
import { warning } from "@actions/core";
import * as Sentry from "@sentry/node";
import { runUploadContainerPostStep } from "./actions/upload-container/post-step";

runUploadContainerPostStep().catch(async (error) => {
  // Capture unexpected errors
  Sentry.captureException(error);

  // We're just emitting telemetry in this post step, so log a warning but don't fail
  const message = error instanceof Error ? error.message : `${error}`;
  warning(message);

  await Sentry.flush(5_000); // Wait for Sentry to flush before exiting
});
