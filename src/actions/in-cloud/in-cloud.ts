import { setFailed } from "@actions/core";
import { context } from "@actions/github";
import { METICULOUS_LOGGER_NAME } from "@alwaysmeticulous/common";
import { executeRemoteTestRun } from "@alwaysmeticulous/remote-replay-launcher";
import { initSentry } from "@alwaysmeticulous/sentry";
import log from "loglevel";
import { throwIfCannotConnectToOrigin } from "../../common/check-connection";
import { safeEnsureBaseTestsExists } from "../../common/ensure-base-exists.utils";
import { getEnvironment } from "../../common/environment.utils";
import { getBaseAndHeadCommitShas } from "../../common/get-base-and-head-commit-shas";
import { getCodeChangeEvent } from "../../common/get-code-change-event";
import { initLogger, setLogLevel, shortSha } from "../../common/logger.utils";
import { getOctokitOrFail } from "../../common/octokit";
import { getInCloudActionInputs } from "./get-inputs";

export const runMeticulousTestsInCloudAction = async (): Promise<void> => {
  initLogger();

  // Init Sentry without sampling traces on the action run.
  // Children processes, (test run executions) will use
  // the global sample rate.
  const sentryHub = await initSentry("report-diffs-action-in-cloud-v1", 1.0);

  const transaction = sentryHub.startTransaction({
    name: "report-diffs-action.runMeticulousTestsActionInCloud",
    description: "Run Meticulous tests action (in cloud)",
    op: "report-diffs-action.runMeticulousTestsActionInCloud",
  });

  if (+(process.env["RUNNER_DEBUG"] ?? "0")) {
    setLogLevel("trace");
  }

  const { apiToken, githubToken, appUrl } = getInCloudActionInputs();
  const { payload } = context;
  const event = getCodeChangeEvent(context.eventName, payload);
  const octokit = getOctokitOrFail(githubToken);
  const logger = log.getLogger(METICULOUS_LOGGER_NAME);

  if (event == null) {
    logger.warn(
      `Running report-diffs-action is only supported for 'push', \
      'pull_request' and 'workflow_dispatch' events, but was triggered \
      on a '${context.eventName}' event. Skipping execution.`
    );
    return;
  }

  const { base, head } = await getBaseAndHeadCommitShas(event, {
    useDeploymentUrl: false,
  });
  const environment = getEnvironment({ event, head });

  const { shaToCompareAgainst } = await safeEnsureBaseTestsExists({
    event,
    apiToken,
    base,
    context,
    octokit,
  });

  if (shaToCompareAgainst != null && event.type === "pull_request") {
    logger.info(
      `Comparing visual snapshots for the commit head of this PR, ${shortSha(
        head
      )}, against ${shortSha(shaToCompareAgainst)}`
    );
  } else if (shaToCompareAgainst != null) {
    logger.info(
      `Comparing visual snapshots for commit ${shortSha(
        head
      )} against commit ${shortSha(shaToCompareAgainst)}}`
    );
  } else {
    logger.info(`Generating visual snapshots for commit ${shortSha(head)}`);
  }

  try {
    await throwIfCannotConnectToOrigin(appUrl);

    const onTunnelCreated = ({
      url,
      basicAuthUser,
      basicAuthPassword,
    }: {
      url: string;
      basicAuthUser: string;
      basicAuthPassword: string;
    }) => {
      logger.info(
        `Secure tunnel to ${appUrl} created: ${url}, user: ${basicAuthUser}, password: ${basicAuthPassword}`
      );
    };

    await executeRemoteTestRun({
      apiToken,
      appUrl,
      commitSha: head,
      environment: "github-actions",
      onTunnelCreated,
    });

    transaction.setStatus("ok");
    transaction.finish();

    await sentryHub.getClient()?.close(5_000);

    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    setFailed(message);

    transaction.setStatus("unknown_error");
    transaction.finish();

    await sentryHub.getClient()?.close(5_000);

    process.exit(1);
  }
};
