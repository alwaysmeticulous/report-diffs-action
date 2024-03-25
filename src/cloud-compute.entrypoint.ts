import { setFailed } from "@actions/core";
import { runMeticulousTestsCloudComputeAction } from "./actions/cloud-compute/cloud-compute";

runMeticulousTestsCloudComputeAction().catch((error) => {
  const message = error instanceof Error ? error.message : `${error}`;
  setFailed(message);
  process.exit(1);
});
