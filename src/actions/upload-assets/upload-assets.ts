import { setFailed } from "@actions/core";
import { context } from "@actions/github";
import {
  createClient,
  getLatestTestRunResults,
} from "@alwaysmeticulous/client";
import { uploadAssetsAndTriggerTestRun } from "@alwaysmeticulous/remote-replay-launcher";
import { initSentry } from "@alwaysmeticulous/sentry";
import * as Sentry from "@sentry/node";
import { safeEnsureBaseTestsExists } from "../../common/ensure-base-exists.utils";
import {
  getBaseAndHeadCommitShas,
  getActualCommitShaFromRepoOrContext,
} from "../../common/get-base-and-head-commit-shas";
import { getCodeChangeEvent } from "../../common/get-code-change-event";
import { initLogger } from "../../common/logger.utils";
import { getOctokitOrFail } from "../../common/octokit";
import { enrichSentryContextWithGitHubActionsContext } from "../../common/sentry.utils";
import { getUploadAssetsInputs } from "./get-inputs";

export const runMeticulousUploadAssetsAction = async (): Promise<void> => {
  const logger = initLogger();
  await initSentry("report-diffs-action-upload-assets-v1", 1.0);
  enrichSentryContextWithGitHubActionsContext();

  const exitCode = await Sentry.startSpan(
    {
      name: "report-diffs-action.runMeticulousUploadAssetsAction",
      op: "report-diffs-action.runMeticulousUploadAssetsAction",
    },
    async (span) => {
      try {
        const {
          apiToken,
          githubToken,
          appDirectory,
          rewrites,
          baseApiUrl,
          commitSha: commitShaInput,
        } = getUploadAssetsInputs();

        if (baseApiUrl) {
          process.env["METICULOUS_API_URL"] = baseApiUrl;
        }
        const event = getCodeChangeEvent(context.eventName, context.payload);
        const octokit = getOctokitOrFail(githubToken);

        if (event == null) {
          logger.error(
            `Running this Action is only supported for 'push', \
            'pull_request' and 'workflow_dispatch' events, but was triggered \
            on a '${context.eventName}' event. Skipping execution.`
          );
          return;
        }

        const { base } = await getBaseAndHeadCommitShas(
          event,
          { useDeploymentUrl: false },
          logger
        );
        await safeEnsureBaseTestsExists({
          event,
          apiToken,
          base,
          context,
          octokit,
          getBaseTestRun: async ({ baseSha }) =>
            await getLatestTestRunResults({
              client: createClient({ apiToken }),
              commitSha: baseSha,
              // We deliberately don't filter by environment version here because when static assets are uploaded,
              // the backend can trigger a re-run. So we don't care whether we have a valid base now,
              // just whether the commit was tested at some point which means we have the assets.
            }),
          logger,
        });

        logger.info(`Uploading assets from directory: ${appDirectory}`);

        const commitSha =
          commitShaInput ?? getActualCommitShaFromRepoOrContext(logger);
        if (!commitSha) {
          throw new Error(
            "Could not determine a commit SHA to associate the uploaded assets with. " +
              "Either run 'actions/checkout' before this action, or pass the 'commit-sha' input explicitly."
          );
        }

        await uploadAssetsAndTriggerTestRun({
          apiToken,
          appDirectory,
          commitSha,
          rewrites,
          waitForBase: false,
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
