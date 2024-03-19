import { setFailed } from "@actions/core";
import { runMeticulousTestsAction } from "./actions/main/main";

runMeticulousTestsAction().catch((error) => {
  const message = error instanceof Error ? error.message : `${error}`;
  setFailed(message);
  process.exit(1);
});
