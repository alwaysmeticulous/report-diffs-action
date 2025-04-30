import { setFailed } from "@actions/core";
import { runMeticulousUploadAssetsAction } from "./actions/upload-assets/upload-assets";

runMeticulousUploadAssetsAction().catch((error) => {
  const message = error instanceof Error ? error.message : `${error}`;
  setFailed(message);
  process.exit(1);
});
