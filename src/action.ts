import { setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import {
  initLogger,
  initSentry,
  runAllTests,
  RunAllTestsTestRun,
  setLogLevel,
} from "@alwaysmeticulous/cli";
import type { ReplayExecutionOptions } from "@alwaysmeticulous/common";
import { setMeticulousLocalDataDir } from "@alwaysmeticulous/common";
import debounce from "lodash.debounce";
import { addLocalhostAliases } from "./utils/add-localhost-aliases";
import { safeEnsureBaseTestsExists } from "./utils/ensure-base-exists.utils";
import { getEnvironment } from "./utils/environment.utils";
import { getBaseAndHeadCommitShas } from "./utils/get-base-and-head-commit-shas";
import { getCodeChangeEvent } from "./utils/get-code-change-event";
import { getInputs } from "./utils/get-inputs";
import { ResultsReporter } from "./utils/results-reporter";
import { waitForDeploymentUrl } from "./utils/wait-for-deployment-url";

const DEFAULT_EXECUTION_OPTIONS: ReplayExecutionOptions = {
  headless: true,
  devTools: false,
  bypassCSP: false,
  shiftTime: true,
  networkStubbing: true,
  skipPauses: true,
  moveBeforeClick: false,
  disableRemoteFonts: false,
  noSandbox: true,
  maxDurationMs: 5 * 60 * 1_000, // 5 minutes
  maxEventCount: null,
  essentialFeaturesOnly: false,
};

export const runMeticulousTestsAction = async (): Promise<void> => {
  initLogger();

  // Init Sentry without sampling traces on the action run.
  // Children processes, (test run executions) will use
  // the global sample rate.
  const sentryHub = await initSentry(1.0);

  const transaction = sentryHub.startTransaction({
    name: "report-diffs-action.runMeticulousTestsAction",
    description: "Run Meticulous tests action",
    op: "report-diffs-action.runMeticulousTestsAction",
  });

  if (+(process.env["RUNNER_DEBUG"] ?? "0")) {
    setLogLevel("trace");
  }

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
    testSuiteId,
  } = getInputs();
  const { payload } = context;
  const event = getCodeChangeEvent(context.eventName, payload);
  const { owner, repo } = context.repo;
  const octokit = getOctokitOrFail(githubToken);

  if (event == null) {
    console.warn(
      `Running report-diffs-action is only supported for 'push', \
      'pull_request' and 'workflow_dispatch' events, but was triggered \
      on a '${context.eventName}' event. Skipping execution.`
    );
    return;
  }

  const { base, head } = await getBaseAndHeadCommitShas(event, {
    useDeploymentUrl,
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
    console.log(
      `Comparing screenshots for the commit head of this PR, ${shortSha(
        head
      )}, against ${shortSha(shaToCompareAgainst)}`
    );
  } else if (shaToCompareAgainst != null) {
    console.log(
      `Comparing screenshots for commit ${shortSha(
        head
      )} against commit ${shortSha(shaToCompareAgainst)}}`
    );
  } else {
    console.log(`Generating screenshots for commit ${shortSha(head)}`);
  }

  const resultsReporter = new ResultsReporter({
    octokit,
    event,
    owner,
    repo,
    headSha: head,
    testSuiteId,
  });

  try {
    setMeticulousLocalDataDir();
    const reportTestFinished = debounce(
      (
        testRun: RunAllTestsTestRun & {
          status: "Running";
        }
      ) => resultsReporter.testFinished(testRun),
      5_000,
      {
        leading: false,
        trailing: true,
        maxWait: 15_000,
      }
    );
    await addLocalhostAliases({ appUrl, localhostAliases });

    const urlToTestAgainst = useDeploymentUrl
      ? await waitForDeploymentUrl({ owner, repo, commitSha: head, octokit })
      : appUrl;

    const results = await runAllTests({
      testsFile,
      apiToken,
      commitSha: head,
      baseCommitSha: shaToCompareAgainst,
      appUrl: urlToTestAgainst,
      executionOptions: DEFAULT_EXECUTION_OPTIONS,
      screenshottingOptions: {
        enabled: true,
        screenshotSelector: null,
        storyboardOptions: { enabled: true },
        diffOptions: {
          diffThreshold: maxAllowedProportionOfChangedPixels,
          diffPixelThreshold: maxAllowedColorDifference,
        },
      },
      baseTestRunId: null,
      parallelTasks,
      deflake: false,
      maxRetriesOnFailure,
      githubSummary: true,
      environment,
      onTestRunCreated: (testRun) => resultsReporter.testRunStarted(testRun),
      onTestFinished: reportTestFinished,
    });
    reportTestFinished.cancel();
    await resultsReporter.testRunFinished(results);

    transaction.setStatus("ok");
    transaction.finish();

    await sentryHub.getClient()?.close(5_000);

    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    setFailed(message);
    resultsReporter.errorRunningTests();

    transaction.setStatus("unknown_error");
    transaction.finish();

    await sentryHub.getClient()?.close(5_000);

    process.exit(1);
  }
};

const getOctokitOrFail = (githubToken: string | null) => {
  if (githubToken == null) {
    throw new Error("github-token is required");
  }

  try {
    return getOctokit(githubToken);
  } catch (err) {
    console.error(err);
    throw new Error(
      "Error connecting to GitHub. Did you specify a valid 'github-token'?"
    );
  }
};

const shortSha = (sha: string) => sha.slice(0, 7);
