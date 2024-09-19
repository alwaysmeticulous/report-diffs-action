import { warning } from "@actions/core";
import { runMainActionPostStep } from "./actions/main/post-step";

runMainActionPostStep().catch((error) => {
  // We're just emitting telemetry in this post step, so log a warning but don't fail
  const message = error instanceof Error ? error.message : `${error}`;
  warning(message);
});
