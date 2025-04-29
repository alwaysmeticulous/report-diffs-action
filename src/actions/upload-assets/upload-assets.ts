import { setFailed } from "@actions/core";
import { context } from "@actions/github";
import { uploadAssetsAndTriggerTestRun } from "@alwaysmeticulous/remote-replay-launcher";
import { initSentry } from "@alwaysmeticulous/sentry";
import * as Sentry from "@sentry/node";
import { initLogger } from "../../common/logger.utils";
import { getUploadAssetsInputs } from "./get-inputs";

export const runMeticulousUploadAssetsAction = async (): Promise<void> => {
  const logger = initLogger();
  await initSentry("report-diffs-action-upload-assets-v1", 1.0);

  const exitCode = await Sentry.startSpan(
    {
      name: "report-diffs-action.runMeticulousUploadAssetsAction",
      op: "report-diffs-action.runMeticulousUploadAssetsAction",
    },
    async (span) => {
      const { apiToken, appDirectory, rewrites } = getUploadAssetsInputs();
      try {
        logger.info(`Uploading assets from directory: ${appDirectory}`);

        const commitSha = context.sha;
        if (!commitSha) {
          throw new Error("Could not determine the commit SHA");
        }

        await uploadAssetsAndTriggerTestRun({
          apiToken,
          appDirectory,
          commitSha,
          rewrites,
        });
        span.setStatus({ code: 1, message: "ok" });
        return 0;
      } catch (error) {
        const message = error instanceof Error ? error.message : `${error}`;
        setFailed(message);
        span.setStatus({ code: 2, message: "unknown_error" });
        return 1;
      }
    }
  );

  await Sentry.getClient()?.close(5_000);
  process.exit(exitCode);
};
