import { setFailed } from "@actions/core";
import { runMeticulousTestsInCloudAction } from "./actions/in-cloud/in-cloud";

runMeticulousTestsInCloudAction().catch((error) => {
  const message = error instanceof Error ? error.message : `${error}`;
  setFailed(message);
  process.exit(1);
});
