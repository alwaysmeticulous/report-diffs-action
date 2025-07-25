import "source-map-support/register";
import { warning } from "@actions/core";
import * as Sentry from "@sentry/node";
import { runCloudComputePostStep } from "./actions/cloud-compute/post-step";

runCloudComputePostStep().catch(async (error) => {
  // Capture unexpected errors
  Sentry.captureException(error);

  // We're just emitting telemetry in this post step, so log a warning but don't fail
  const message = error instanceof Error ? error.message : `${error}`;
  warning(message);

  await Sentry.flush(5_000); // Wait for Sentry to flush before exiting
});
