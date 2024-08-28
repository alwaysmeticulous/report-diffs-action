import { context } from "@actions/github";
import { IN_PROGRESS_TEST_RUN_STATUS, TestRun } from "@alwaysmeticulous/client";
import { defer } from "@alwaysmeticulous/common";
import { executeRemoteTestRun } from "@alwaysmeticulous/remote-replay-launcher";
import { throwIfCannotConnectToOrigin } from "../../common/check-connection";
import { tryTriggerTestsWorkflowOnBase } from "../../common/ensure-base-exists.utils";
import { shortCommitSha } from "../../common/environment.utils";
import { getBaseAndHeadCommitShas } from "../../common/get-base-and-head-commit-shas";
import { getCodeChangeEvent } from "../../common/get-code-change-event";
import { isDebugPullRequestRun } from "../../common/is-debug-pr-run";
import { getPrefixedLogger, shortSha } from "../../common/logger.utils";
import { getOctokitOrFail } from "../../common/octokit";
import { updateStatusComment } from "../../common/update-status-comment";
import { DEBUG_MODE_KEEP_TUNNEL_OPEN_DURAION } from "./consts";
import { getCloudComputeBaseTestRun } from "./get-cloud-compute-base-test-run";

export const runOneTestRun = async ({
  apiToken,
  appUrl,
  runNumber,
  githubToken,
  headSha,
}: {
  apiToken: string;
  appUrl: string;
  runNumber: number;
  githubToken: string;
  headSha: string;
}) => {
  const { payload } = context;
  const event = getCodeChangeEvent(context.eventName, payload);
  const { owner, repo } = context.repo;
  const isDebugPRRun = isDebugPullRequestRun(event);
  const octokit = getOctokitOrFail(githubToken);
  const logger = getPrefixedLogger(`Run #${runNumber}`);

  if (event == null) {
    logger.warn(
      `Running report-diffs-action is only supported for 'push', \
      'pull_request' and 'workflow_dispatch' events, but was triggered \
      on a '${context.eventName}' event. Skipping execution.`
    );
    return;
  }

  // Compute the base commit SHA to compare to for the HEAD commit.
  // This will usually be the merge base of the PR head and base commit. In some cases it can be an older main branch commit,
  // for example when running in a monorepo setup.
  const { baseCommitSha, baseTestRun } = await getCloudComputeBaseTestRun({
    apiToken,
    headCommitSha: headSha,
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
    const { base: codeChangeBase } = await getBaseAndHeadCommitShas(
      event,
      {
        useDeploymentUrl: false,
      },
      logger
    );
    if (codeChangeBase) {
      const { baseTestRunExists } = await tryTriggerTestsWorkflowOnBase({
        logger,
        event,
        base: codeChangeBase,
        context,
        octokit,
      });

      if (baseTestRunExists) {
        shaToCompareAgainst = codeChangeBase;
      }
    }
  }

  if (shaToCompareAgainst != null) {
    logger.info(
      `Comparing visual snapshots for the commit ${shortSha(
        headSha
      )}, against ${shortSha(shaToCompareAgainst)}`
    );
  } else {
    logger.info(`Generating visual snapshots for commit ${shortSha(headSha)}`);
  }

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
        shortHeadSha: shortCommitSha(headSha),
        createIfDoesNotExist: true,
        logger,
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
      logger.info(`Executed ${completedTestCases}/${numTestCases} test cases`);
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
    commitSha: headSha,
    environment: "github-actions",
    onTunnelCreated,
    onTestRunCreated,
    onProgressUpdate,
    ...(keepTunnelOpenPromise
      ? { keepTunnelOpenPromise: keepTunnelOpenPromise.promise }
      : {}),
  });
};