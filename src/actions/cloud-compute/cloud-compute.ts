import { setFailed } from "@actions/core";
import { context } from "@actions/github";
import { IN_PROGRESS_TEST_RUN_STATUS, TestRun } from "@alwaysmeticulous/client";
import { defer, METICULOUS_LOGGER_NAME } from "@alwaysmeticulous/common";
import { executeRemoteTestRun } from "@alwaysmeticulous/remote-replay-launcher";
import { initSentry } from "@alwaysmeticulous/sentry";
import log from "loglevel";
import { Duration } from "luxon";
import { throwIfCannotConnectToOrigin } from "../../common/check-connection";
import { tryTriggerTestsWorkflowOnBase } from "../../common/ensure-base-exists.utils";
import { shortCommitSha } from "../../common/environment.utils";
import {
  getBaseAndHeadCommitShas,
  getHeadCommitShaFromRepo,
} from "../../common/get-base-and-head-commit-shas";
import { getCodeChangeEvent } from "../../common/get-code-change-event";
import { isDebugPullRequestRun } from "../../common/is-debug-pr-run";
import { initLogger, setLogLevel, shortSha } from "../../common/logger.utils";
import { getOctokitOrFail } from "../../common/octokit";
import { updateStatusComment } from "../../common/update-status-comment";
import { getCloudComputeBaseTestRun } from "./get-cloud-compute-base-test-run";
import { getInCloudActionInputs } from "./get-inputs";

const DEBUG_MODE_KEEP_TUNNEL_OPEN_DURAION = Duration.fromObject({
  minutes: 45,
});

export const runMeticulousTestsCloudComputeAction = async (): Promise<void> => {
  initLogger();

  // Init Sentry without sampling traces on the action run.
  // Children processes, (test run executions) will use
  // the global sample rate.
  const sentryHub = await initSentry(
    "report-diffs-action-cloud-compute-v1",
    1.0
  );

  const transaction = sentryHub.startTransaction({
    name: "report-diffs-action.runMeticulousTestsActionInCloud",
    description: "Run Meticulous tests action (in cloud)",
    op: "report-diffs-action.runMeticulousTestsActionInCloud",
  });

  if (+(process.env["RUNNER_DEBUG"] ?? "0")) {
    setLogLevel("trace");
  }

  const {
    apiToken,
    githubToken,
    appUrl,
    headSha: headShaFromInput,
  } = getInCloudActionInputs();
  const { payload } = context;
  const event = getCodeChangeEvent(context.eventName, payload);
  const { owner, repo } = context.repo;
  const isDebugPRRun = isDebugPullRequestRun(event);
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

  // Compute the HEAD commit SHA to use when creating a test run.
  // In a PR workflow this will by default be process.env.GITHUB_SHA (the temporary merge commit) or
  // sometimes the head commit of the PR.
  // Users can also explicitly provide the head commit SHA to use as input. This is useful when the action is not
  // run with the code checked out.
  // Our backend is responsible for computing the correct BASE commit to create the test run for.
  const head = headShaFromInput || getHeadCommitShaFromRepo();

  // Compute the base commit SHA to compare to for the HEAD commit.
  // This will usually be the merge base of the PR head and base commit. In some cases it can be an older main branch commit,
  // for example when running in a monorepo setup.
  const { baseCommitSha, baseTestRun } = await getCloudComputeBaseTestRun({
    apiToken,
    headCommitSha: head,
  });

  let shaToCompareAgainst: string | null = null;
  if (baseTestRun != null) {
    shaToCompareAgainst = baseCommitSha;
    logger.info(
      `Tests already exist for commit ${baseCommitSha} (${baseTestRun.id})`
    );
  } else {
    // We compute and use the base SHA from the code change event rather than the `baseCommitSha` computed above
    // as `tryTriggerTestsWorkflowOnBase` can only trigger workflow for the HEAD `main` branch commit.
    // `baseCommitSha` can be an older commit in a monorepo setup (in cases where we selectively run tests for a specific package).
    // In such cases we won't be able to trigger a workflow for the base commit SHA provided by the backend.
    // We will instead trigger test run for a newer base which is the base commit SHA from the code change event and
    // will use that as the base to compare against. This is safe as `codeChangeBase` is guaranteed to be the same
    // or newer commit to `baseCommitSha`.
    const { base: codeChangeBase } = await getBaseAndHeadCommitShas(event, {
      useDeploymentUrl: false,
    });
    if (codeChangeBase) {
      const { shaToCompareAgainst: baseShaFromWorkflow } =
        await tryTriggerTestsWorkflowOnBase({
          logger,
          event,
          base: codeChangeBase,
          context,
          octokit,
        });

      shaToCompareAgainst = baseShaFromWorkflow;
    }
  }

  if (shaToCompareAgainst != null) {
    logger.info(
      `Comparing visual snapshots for the commit ${shortSha(
        head
      )}, against ${shortSha(shaToCompareAgainst)}`
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

      if (isDebugPRRun) {
        updateStatusComment({
          octokit,
          event,
          owner,
          repo,
          body: `🤖 Meticulous is running in debug mode. Secure tunnel to ${appUrl} created: ${url} user: \`${basicAuthUser}\` password: \`${basicAuthPassword}\`.\n\n
Tunnel will be live for up to ${DEBUG_MODE_KEEP_TUNNEL_OPEN_DURAION.toHuman()}. Cancel the workflow run to close the tunnel early.`,
          testSuiteId: "__meticulous_debug__",
          shortHeadSha: shortCommitSha(head),
          createIfDoesNotExist: true,
        }).catch((err) => {
          logger.error(err);
        });
      }
    };

    const keepTunnelOpenPromise = isDebugPRRun ? defer<void>() : null;
    let keepTunnelOpenTimeout: NodeJS.Timeout | null = null;

    let lastSeenNumberOfCompletedTestCases = 0;

    const onProgressUpdate = (testRun: TestRun) => {
      if (
        !IN_PROGRESS_TEST_RUN_STATUS.includes(testRun.status) &&
        keepTunnelOpenPromise &&
        !keepTunnelOpenTimeout
      ) {
        logger.info(
          `Test run execution completed. Keeping tunnel open for ${DEBUG_MODE_KEEP_TUNNEL_OPEN_DURAION.toHuman()}`
        );
        keepTunnelOpenTimeout = setTimeout(() => {
          keepTunnelOpenPromise.resolve();
        }, DEBUG_MODE_KEEP_TUNNEL_OPEN_DURAION.as("milliseconds"));
      }

      const numTestCases = testRun.configData.testCases?.length || 0;
      const completedTestCases = testRun.resultData?.results?.length || 0;

      if (
        completedTestCases != lastSeenNumberOfCompletedTestCases &&
        numTestCases
      ) {
        logger.info(
          `Executed ${completedTestCases}/${numTestCases} test cases`
        );
        lastSeenNumberOfCompletedTestCases = completedTestCases;
      }
    };

    const onTestRunCreated = (testRun: TestRun) => {
      logger.info(`Test run created: ${testRun.url}`);
    };

    // We use MERGE_COMMIT_SHA as the deployment is created for the merge commit.

    await executeRemoteTestRun({
      apiToken,
      appUrl,
      commitSha: head,
      environment: "github-actions",
      onTunnelCreated,
      onTestRunCreated,
      onProgressUpdate,
      ...(keepTunnelOpenPromise
        ? { keepTunnelOpenPromise: keepTunnelOpenPromise.promise }
        : {}),
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
