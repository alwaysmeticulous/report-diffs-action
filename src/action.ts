import { setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { runAllTests } from "@alwaysmeticulous/cli";
import type { ReplayExecutionOptions } from "@alwaysmeticulous/common";
import { getBaseAndHeadCommitShas } from "./utils/get-base-and-head-commit-shas";
import { getCodeChangeEvent } from "./utils/get-code-change-event";
import { getInputs } from "./utils/get-inputs";
import { ResultsReporter } from "./utils/results-reporter";

const DEFAULT_EXECUTION_OPTIONS: ReplayExecutionOptions = {
  headless: true,
  devTools: false,
  bypassCSP: false,
  padTime: true,
  shiftTime: true,
  networkStubbing: true,
  skipPauses: true,
  moveBeforeClick: false,
  disableRemoteFonts: false,
  noSandbox: true,
  maxDurationMs: null,
  maxEventCount: null,
};

const DEFAULT_SCREENSHOTTING_OPTIONS = {
  enabled: true,
  screenshotSelector: null,
  storyboardOptions: { enabled: true },
  diffOptions: {
    diffThreshold: 0.00001, // ~20 pixels on a 1920 x 1080 px screenshot
    diffPixelThreshold: 0.01,
  },
} as const;

export const runMeticulousTestsAction = async (): Promise<void> => {
  const { apiToken, githubToken, appUrl, testsFile } = getInputs();
  const { payload } = context;
  const event = getCodeChangeEvent(context.eventName, payload);
  const { owner, repo } = context.repo;
  const octokit = getOctokitOrFail(githubToken);

  if (event == null) {
    console.warn(
      `Running report-diffs-action is only supported for 'push' and 'pull_request' events, but was triggered on a '${context.eventName}' event. Skipping execution.`
    );
    return;
  }

  const { base, head } = getBaseAndHeadCommitShas(event);
  const resultsReporter = new ResultsReporter({
    octokit,
    event,
    owner,
    repo,
    headSha: head,
  });

  try {
    const results = await runAllTests({
      testsFile,
      apiToken,
      commitSha: head,
      baseCommitSha: base,
      appUrl,
      executionOptions: DEFAULT_EXECUTION_OPTIONS,
      screenshottingOptions: DEFAULT_SCREENSHOTTING_OPTIONS,
      useAssetsSnapshottedInBaseSimulation: false,
      parallelTasks: 8,
      deflake: false,
      useCache: false,
      githubSummary: true,
      onTestRunCreated: (testRun) => resultsReporter.testRunStarted(testRun),
      onTestFinished: (testRun) => resultsReporter.testFinished(testRun),
    });
    await resultsReporter.testRunFinished(results.testRun);
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    setFailed(message);
    resultsReporter.errorRunningTests();
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
