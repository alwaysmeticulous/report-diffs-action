import {
  DEFAULT_EXECUTION_OPTIONS,
} from "@alwaysmeticulous/common";
import { RunningTestRunExecution } from "@alwaysmeticulous/sdk-bundles-api";
import debounce from "lodash.debounce";
import { safeEnsureBaseTestsExists } from "../../common/ensure-base-exists.utils";
import { getEnvironment } from "../../common/environment.utils";
import { getBaseAndHeadCommitShas } from "../../common/get-base-and-head-commit-shas";
import { getCodeChangeEvent } from "../../common/get-code-change-event";
import { shortSha } from "../../common/logger.utils";
import { ActionDependencies } from "../../testing/types";
import { getMainActionInputs } from "./get-inputs";
import { addLocalhostAliases } from "./utils/add-localhost-aliases";
import { LOGICAL_ENVIRONMENT_VERSION } from "./utils/constants";
import { ResultsReporter } from "./utils/results-reporter";
import { waitForDeploymentUrl } from "./utils/wait-for-deployment-url";

const EXECUTION_OPTIONS = {
  ...DEFAULT_EXECUTION_OPTIONS,
  noSandbox: true,
};

export class MainAction {
  constructor(private deps: ActionDependencies) {}

  async run(): Promise<number> {
    await this.deps.sentry.initSentry("report-diffs-action-v1", 1.0);
    this.deps.sentry.enrichContextWithGitHubActions();

    return await this.deps.sentry.startSpan(
      {
        name: "report-diffs-action.runMeticulousTestsAction",
        op: "report-diffs-action.runMeticulousTestsAction",
      },
      async (span) => {
        let resultsReporter: ResultsReporter | undefined;
        try {
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

          const context = this.deps.github.getContext();
          const { payload } = context;
          const event = getCodeChangeEvent(context.eventName, payload);
          const { owner, repo } = context.repo;
          const octokit = this.deps.github.getOctokit(githubToken);

          if (event == null) {
            this.deps.logger.warn(
              `Running report-diffs-action is only supported for 'push', \
          'pull_request' and 'workflow_dispatch' events, but was triggered \
          on a '${context.eventName}' event. Skipping execution.`
            );
            return 0;
          }

          const { base, head } = await getBaseAndHeadCommitShas(
            event,
            {
              useDeploymentUrl,
            },
            this.deps.logger
          );
          const environment = getEnvironment({ event, head });

          const { baseTestRunExists } = await safeEnsureBaseTestsExists({
            event,
            apiToken,
            base,
            context,
            octokit,
            getBaseTestRun: async ({ baseSha }) =>
              await this.deps.meticulous.getLatestTestRunResults({
                client: this.deps.meticulous.createClient({ apiToken }),
                commitSha: baseSha,
                logicalEnvironmentVersion: LOGICAL_ENVIRONMENT_VERSION,
              }),
            logger: this.deps.logger,
          });

          const shaToCompareAgainst = baseTestRunExists ? base : null;

          if (shaToCompareAgainst != null && event.type === "pull_request") {
            this.deps.logger.info(
              `Comparing visual snapshots for the commit head of this PR, ${shortSha(
                head
              )}, against ${shortSha(shaToCompareAgainst)}`
            );
          } else if (shaToCompareAgainst != null) {
            this.deps.logger.info(
              `Comparing visual snapshots for commit ${shortSha(
                head
              )} against commit ${shortSha(shaToCompareAgainst)}`
            );
          } else {
            this.deps.logger.info(`Generating visual snapshots for commit ${shortSha(head)}`);
          }

          resultsReporter = new ResultsReporter({
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
            logger: this.deps.logger,
          });

          this.deps.fileSystem.setMeticulousLocalDataDir();
          const reportTestFinished = debounce(
            (testRun: RunningTestRunExecution) =>
              resultsReporter!.testFinished(testRun),
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
            this.deps.network.spinUpProxy({
              targetUrl: urlToTestAgainst,
              additionalPorts,
              aliasedUrl: appUrlAliasedToLocalhost,
              logger: this.deps.logger,
            });
            await this.deps.network.checkConnection(urlToTestAgainst);
          }

          const results = await this.deps.meticulous.executeTestRun({
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
            onTestRunCreated: (testRun: any) =>
              resultsReporter!.testRunStarted(testRun),
            onTestFinished: reportTestFinished,
            maxSemanticVersionSupported: 1,
            logicalEnvironmentVersion: LOGICAL_ENVIRONMENT_VERSION,
          });
          reportTestFinished.cancel();
          await resultsReporter!.testRunFinished(results);

          span.setStatus({ code: 1, message: "ok" });
          return 0;
        } catch (error) {
          const message = error instanceof Error ? error.message : `${error}`;
          this.deps.actions.setFailed(message);
          if (resultsReporter) {
            await resultsReporter.errorRunningTests();
          }

          span.setStatus({ code: 2, message: "unknown_error" });
          return 1;
        }
      }
    );
  }
}