import { warning } from "@actions/core";
import { runPostStep } from "./common/run-post-step";

runPostStep().catch((error) => {
  // We're just emitting telemetry in this post step, so log a warning but don't fail
  const message = error instanceof Error ? error.message : `${error}`;
  warning(message);
});
