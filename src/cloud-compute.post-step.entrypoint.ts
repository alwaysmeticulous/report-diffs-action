import { warning } from "@actions/core";
import { runCloudComputePostStep } from "./actions/cloud-compute/post-step";

runCloudComputePostStep().catch((error) => {
  // We're just emitting telemetry in this post step, so log a warning but don't fail
  const message = error instanceof Error ? error.message : `${error}`;
  warning(message);
});
