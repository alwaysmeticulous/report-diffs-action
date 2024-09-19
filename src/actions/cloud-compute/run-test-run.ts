import { context } from "@actions/github";
import {
  createClient,
  getProject,
  IN_PROGRESS_TEST_RUN_STATUS,
  TestRun,
} from "@alwaysmeticulous/client";
import { defer, METICULOUS_LOGGER_NAME } from "@alwaysmeticulous/common";
import { executeRemoteTestRun } from "@alwaysmeticulous/remote-replay-launcher";
import log from "loglevel";
import { throwIfCannotConnectToOrigin } from "../../common/check-connection";
import { METICULIOUS_APP_URL } from "../../common/constants";
import { tryTriggerTestsWorkflowOnBase } from "../../common/ensure-base-exists.utils";
import { shortCommitSha } from "../../common/environment.utils";
import { getBaseAndHeadCommitShas } from "../../common/get-base-and-head-commit-shas";
import { getCodeChangeEvent } from "../../common/get-code-change-event";
import { isDebugPullRequestRun } from "../../common/is-debug-pr-run";
import {
  getPrefixedLogger,
  initLogger,
  shortSha,
} from "../../common/logger.utils";
import { getOctokitOrFail } from "../../common/octokit";
import { updateStatusComment } from "../../common/update-status-comment";
import { DEBUG_MODE_KEEP_TUNNEL_OPEN_DURATION } from "./consts";
import { getCloudComputeBaseTestRun } from "./get-cloud-compute-base-test-run";

export const runOneTestRun = async ({
  apiToken,
  appUrl,
  testRunId,
  githubToken,
  headSha,
  isSingleTestRunExecution,
}: {
  apiToken: string;
  appUrl: string;
  testRunId: string;
  githubToken: string;
  headSha: string;
  isSingleTestRunExecution: boolean;
}) => {
  const { payload } = context;
  const event = getCodeChangeEvent(context.eventName, payload);
  const { owner, repo } = context.repo;
  const isDebugPRRun = isDebugPullRequestRun(event);
  const octokit = getOctokitOrFail(githubToken);
  const logger = isSingleTestRunExecution
    ? log.getLogger(METICULOUS_LOGGER_NAME)
    : getPrefixedLogger(`Test Run ${testRunId}`);
  const apiClient = createClient({
    apiToken,
  });
  const project = await getProject(apiClient);

  if (!project) {
    throw new Error(
      `Could not retrieve project data${
        isSingleTestRunExecution ? "" : ` for project ${testRunId}`
      }. Is the API token correct?`
    );
  }

  logger.info(
    `Running tests for project ${project.organization.name}/${
      project.name
    } against app URL '${appUrl}' ${
      isSingleTestRunExecution ? "" : ` (test run ID ${testRunId})`
    }...`
  );

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
        getBaseTestRun: async () => {
          const { baseTestRun } = await getCloudComputeBaseTestRun({
            apiToken,
            headCommitSha: headSha,
          });
          return baseTestRun;
        },
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
        body:
          `🤖 Meticulous is running in debug mode. Secure tunnel to ${appUrl} created: ${url} user: \`${basicAuthUser}\` password: \`${basicAuthPassword}\`.\n\n` +
          `Tunnel will be live for up to ${DEBUG_MODE_KEEP_TUNNEL_OPEN_DURATION.toHuman()}. Cancel the workflow run to close the tunnel early.\n\n` +
          `Please open this tunnel in your browser and enter the username and password when prompted to confirm that you are serving your application correctly.\n\n` +
          `If you wish to run Meticulous tests locally against this tunnel using the Meticulous CLI then you can use the environment variables METICULOUS_TUNNEL_USERNAME and METICULOUS_TUNNEL_PASSWORD. For example:\n\n` +
          `\`\`\`bash\n` +
          `METICULOUS_TUNNEL_USERNAME="${basicAuthUser}" METICULOUS_TUNNEL_PASSWORD="${basicAuthPassword}" npx @alwaysmeticulous/cli simulate \\\n` +
          `  --sessionId="<a session id to replay>" \\\n` +
          `  --appUrl="${url}" \\\n` +
          `  --apiToken="<your API token>"\n` +
          `\`\`\`\n\n` +
          `Visit the 'Selected Sessions' tab or 'All Sessions' tab on your [Meticulous project page](${METICULIOUS_APP_URL}), click on a session and select the 'Simulate' tab to find a test session to replay and and to find your API token.`,
        testSuiteId: `__meticulous_debug_${testRunId}__`,
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
        `Test run execution completed. Keeping tunnel open for ${DEBUG_MODE_KEEP_TUNNEL_OPEN_DURATION.toHuman()}`
      );
      keepTunnelOpenTimeout = setTimeout(() => {
        keepTunnelOpenPromise.resolve();
      }, DEBUG_MODE_KEEP_TUNNEL_OPEN_DURATION.as("milliseconds"));
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

  const onTunnelStillLocked = () => {
    logger.info(
      "The test run has completed but additional tasks on the Meticulous platform are using this deployment, please keep this job running..."
    );
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
    isLockable: true,
    onTunnelCreated,
    onTestRunCreated,
    onProgressUpdate,
    onTunnelStillLocked,
    ...(keepTunnelOpenPromise
      ? { keepTunnelOpenPromise: keepTunnelOpenPromise.promise }
      : {}),
  });
};
