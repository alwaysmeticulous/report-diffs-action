import { setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { initLogger, runAllTests, setLogLevel } from "@alwaysmeticulous/cli";
import type { ReplayExecutionOptions } from "@alwaysmeticulous/common";
import { setMeticulousLocalDataDir } from "@alwaysmeticulous/common";
import { getEnvironment } from "./utils/environment.utils";
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
  initLogger();
  if (+(process.env["RUNNER_DEBUG"] ?? "0")) {
    setLogLevel("trace");
  }

  const { apiToken, githubToken, appUrl, testsFile } = getInputs();
  const { payload } = context;

  // console.log("=== Payload ===");
  // console.log(JSON.stringify(payload, null, 2));
  // console.log("===============");
  console.log("=== Context ===");
  console.log(JSON.stringify(context, null, 2));
  console.log("===============");

  const event = getCodeChangeEvent(context.eventName, payload);
  const { owner, repo } = context.repo;
  const octokit = getOctokitOrFail(githubToken);

  if (+(process.env["TEST_DISPATCH"] ?? "0")) {
    console.log(`workflow_id = ${payload.workflow}`);
    const result01 = await octokit.rest.actions.getWorkflow({
      owner,
      repo,
      workflow_id: payload.workflow,
    });
    // console.log(JSON.stringify(result01, null, 2));
    const workflowId = result01.data.id;
    const result02 = await octokit.rest.actions.listWorkflowRuns({
      owner,
      repo,
      workflow_id: workflowId,
    });
    console.log(JSON.stringify(result02, null, 2));

    // const result01 = await octokit.rest.actions.listWorkflowRuns({
    //   owner,
    //   repo,
    // });
    throw new Error("TEST_DISPATCH!");
  }

  if (event == null) {
    console.warn(
      `Running report-diffs-action is only supported for 'push', \
      'pull_request' and 'workflow_dispatch' events, but was triggered \
      on a '${context.eventName}' event. Skipping execution.`
    );
    return;
  }

  const { base, head } = await getBaseAndHeadCommitShas(event);

  console.log("=== Git Commit SHAs ===");
  console.log(JSON.stringify({ base, head }, null, 2));
  console.log("=======================");

  const environment = getEnvironment({ event });
  const resultsReporter = new ResultsReporter({
    octokit,
    event,
    owner,
    repo,
    headSha: head,
  });

  try {
    setMeticulousLocalDataDir();
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
      maxRetriesOnFailure: 0,
      githubSummary: true,
      environment,
      onTestRunCreated: (testRun) => resultsReporter.testRunStarted(testRun),
      onTestFinished: (testRun) => resultsReporter.testFinished(testRun),
    });
    await resultsReporter.testRunFinished(results);
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
