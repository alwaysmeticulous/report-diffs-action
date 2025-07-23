import { setFailed } from "@actions/core";
import { context } from "@actions/github";
import {
  createClient,
  getLatestTestRunResults,
} from "@alwaysmeticulous/client";
import {
  DEFAULT_EXECUTION_OPTIONS,
  setMeticulousLocalDataDir,
} from "@alwaysmeticulous/common";
import { executeTestRun } from "@alwaysmeticulous/replay-orchestrator-launcher";
import { RunningTestRunExecution } from "@alwaysmeticulous/sdk-bundles-api";
import { initSentry } from "@alwaysmeticulous/sentry";
import * as Sentry from "@sentry/node";
import debounce from "lodash.debounce";
import { throwIfCannotConnectToOrigin } from "../../common/check-connection";
import { safeEnsureBaseTestsExists } from "../../common/ensure-base-exists.utils";
import { getEnvironment } from "../../common/environment.utils";
import { getBaseAndHeadCommitShas } from "../../common/get-base-and-head-commit-shas";
import { getCodeChangeEvent } from "../../common/get-code-change-event";
import { initLogger, shortSha } from "../../common/logger.utils";
import { getOctokitOrFail } from "../../common/octokit";
import { enrichSentryContextWithGitHubActionsContext } from "../../common/sentry.utils";
import { getMainActionInputs } from "./get-inputs";
import { addLocalhostAliases } from "./utils/add-localhost-aliases";
import { LOGICAL_ENVIRONMENT_VERSION } from "./utils/constants";
import { spinUpProxyIfNeeded } from "./utils/proxy";
import { ResultsReporter } from "./utils/results-reporter";
import { waitForDeploymentUrl } from "./utils/wait-for-deployment-url";

const EXECUTION_OPTIONS = {
  ...DEFAULT_EXECUTION_OPTIONS,
  noSandbox: true,
};

export const runMeticulousTestsAction = async (): Promise<void> => {
  const logger = initLogger();

  // Init Sentry without sampling traces on the action run.
  // Children processes, (test run executions) will use
  // the global sample rate.
  await initSentry("report-diffs-action-v1", 1.0);
  enrichSentryContextWithGitHubActionsContext();

  const exitCode = await Sentry.startSpan(
    {
      name: "report-diffs-action.runMeticulousTestsAction",
      op: "report-diffs-action.runMeticulousTestsAction",
    },
    async (span) => {
      const {
        apiToken,
        githubToken,
        appUrl,
        testsFile,
        maxRetriesOnFailure,
        parallelTasks,
        localhostAliases,
        maxAllowedColorDifference,
        maxAllowedProportionOfChangedPixels,
        useDeploymentUrl,
        allowedEnvironments,
        testSuiteId,
        additionalPorts,
      } = getMainActionInputs();
      const { payload } = context;
      const event = getCodeChangeEvent(context.eventName, payload);
      const { owner, repo } = context.repo;
      const octokit = getOctokitOrFail(githubToken);

      if (event == null) {
        logger.warn(
          `Running report-diffs-action is only supported for 'push', \
      'pull_request' and 'workflow_dispatch' events, but was triggered \
      on a '${context.eventName}' event. Skipping execution.`
        );
        return;
      }

      const { base, head } = await getBaseAndHeadCommitShas(
        event,
        {
          useDeploymentUrl,
        },
        logger
      );
      const environment = getEnvironment({ event, head });

      const { baseTestRunExists } = await safeEnsureBaseTestsExists({
        event,
        apiToken,
        base,
        context,
        octokit,
        getBaseTestRun: async ({ baseSha }) =>
          await getLatestTestRunResults({
            client: createClient({ apiToken }),
            commitSha: baseSha,
            logicalEnvironmentVersion: LOGICAL_ENVIRONMENT_VERSION,
          }),
        logger,
      });

      const shaToCompareAgainst = baseTestRunExists ? base : null;

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
          )} against commit ${shortSha(shaToCompareAgainst)}`
        );
      } else {
        logger.info(`Generating visual snapshots for commit ${shortSha(head)}`);
      }

      const resultsReporter = new ResultsReporter({
        octokit,
        event,
        owner,
        repo,
        headSha: head,
        baseSha: shaToCompareAgainst,
        baseRef:
          event.type === "pull_request"
            ? event.payload.pull_request.base.ref
            : null,
        testSuiteId,
        logger,
      });

      try {
        setMeticulousLocalDataDir();
        const reportTestFinished = debounce(
          (testRun: RunningTestRunExecution) =>
            resultsReporter.testFinished(testRun),
          5_000,
          {
            leading: false,
            trailing: true,
            maxWait: 15_000,
          }
        );
        const appUrlAliasedToLocalhost = await addLocalhostAliases({
          appUrl,
          localhostAliases,
        });

        const urlToTestAgainst = useDeploymentUrl
          ? await waitForDeploymentUrl({
              owner,
              repo,
              commitSha: head,
              octokit,
              allowedEnvironments,
            })
          : appUrl;

        if (urlToTestAgainst != null) {
          spinUpProxyIfNeeded(
            urlToTestAgainst,
            additionalPorts,
            appUrlAliasedToLocalhost,
            logger
          );
          await throwIfCannotConnectToOrigin(urlToTestAgainst);
        }

        const results = await executeTestRun({
          testsFile,
          apiToken,
          commitSha: head,
          baseCommitSha: shaToCompareAgainst,
          baseTestRunId: null,
          appUrl: urlToTestAgainst,
          executionOptions: EXECUTION_OPTIONS,
          screenshottingOptions: {
            enabled: true,
            storyboardOptions: { enabled: true },
            diffOptions: {
              diffThreshold: maxAllowedProportionOfChangedPixels,
              diffPixelThreshold: maxAllowedColorDifference,
            },
          },
          parallelTasks,
          maxRetriesOnFailure,
          rerunTestsNTimes: 0,
          githubSummary: true,
          environment,
          onTestRunCreated: (testRun) =>
            resultsReporter.testRunStarted(testRun),
          onTestFinished: reportTestFinished,
          maxSemanticVersionSupported: 1,
          logicalEnvironmentVersion: LOGICAL_ENVIRONMENT_VERSION,
        });
        reportTestFinished.cancel();
        await resultsReporter.testRunFinished(results);

        span.setStatus({ code: 1, message: "ok" });
        return 0;
      } catch (error) {
        const message = error instanceof Error ? error.message : `${error}`;
        setFailed(message);
        await resultsReporter.errorRunningTests();

        span.setStatus({ code: 2, message: "unknown_error" });
      }
      return 1;
    }
  );

  await Sentry.getClient()?.close(5_000);

  process.exit(exitCode);
};
