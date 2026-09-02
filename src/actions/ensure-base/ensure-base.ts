import { setFailed } from "@actions/core";
import { context } from "@actions/github";
import {
  createClient,
  getLatestTestRunResults,
} from "@alwaysmeticulous/client";
import { initSentry } from "@alwaysmeticulous/sentry";
import * as Sentry from "@sentry/node";
import { getBaseTestRunResolvedByBackend } from "../../common/cloud-replay-base.utils";
import { safeEnsureBaseTestsExists } from "../../common/ensure-base-exists.utils";
import { getBaseAndHeadCommitShas } from "../../common/get-base-and-head-commit-shas";
import { getCodeChangeEvent } from "../../common/get-code-change-event";
import { initLogger } from "../../common/logger.utils";
import { getOctokitOrFail } from "../../common/octokit";
import { enrichSentryContextWithGitHubActionsContext } from "../../common/sentry.utils";
import { getEnsureBaseInputs } from "./get-inputs";

export const runMeticulousEnsureBaseAction = async (): Promise<void> => {
  const logger = initLogger();
  await initSentry("report-diffs-action-ensure-base-v1", 1.0);
  enrichSentryContextWithGitHubActionsContext();

  const exitCode = await Sentry.startSpan(
    {
      name: "report-diffs-action.runMeticulousEnsureBaseAction",
      op: "report-diffs-action.runMeticulousEnsureBaseAction",
    },
    async (span) => {
      try {
        const { apiToken, githubToken } = getEnsureBaseInputs();
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

        if (event.type !== "pull_request") {
          logger.info(
            `ensure-base only dispatches on pull_request events. Skipping on '${event.type}'.`
          );
          span.setStatus({ code: 1, message: "ok" });
          return 0;
        }

        const { base, head } = await getBaseAndHeadCommitShas(
          event,
          { useDeploymentUrl: true, octokit },
          logger
        );

        await safeEnsureBaseTestsExists({
          event,
          apiToken,
          base,
          context,
          octokit,
          dispatchedRunReportsCheckedOutCommit: true,
          waitForCompletion: false,
          getBaseTestRun: async ({ baseSha }) =>
            await getLatestTestRunResults({
              client: createClient({ apiToken }),
              commitSha: baseSha,
            }),
          getBaseTestRunResolvedByBackend: async () =>
            await getBaseTestRunResolvedByBackend({
              apiToken,
              headCommitSha: head,
              logger,
            }),
          logger,
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
