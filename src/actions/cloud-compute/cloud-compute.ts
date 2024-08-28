import { error, setFailed } from "@actions/core";
import { initSentry } from "@alwaysmeticulous/sentry";
import { getHeadCommitShaFromRepo } from "../../common/get-base-and-head-commit-shas";
import { getInCloudActionInputs } from "./get-inputs";
import { runOneTestRun } from "./run-test-run";

export const runMeticulousTestsCloudComputeAction = async (): Promise<void> => {
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

  let failureMessage = "";
  const {
    projectTargets,
    headSha: headShaFromInput,
    githubToken,
  } = getInCloudActionInputs();

  // Compute the HEAD commit SHA to use when creating a test run.
  // In a PR workflow this will by default be process.env.GITHUB_SHA (the temporary merge commit) or
  // sometimes the head commit of the PR.
  // Users can also explicitly provide the head commit SHA to use as input. This is useful when the action is not
  // run with the code checked out.
  // Our backend is responsible for computing the correct BASE commit to create the test run for.
  const headSha = headShaFromInput || getHeadCommitShaFromRepo();

  const projectTargetsToRun = projectTargets.filter((target) => !target.skip);

  (
    await Promise.allSettled(
      projectTargetsToRun.map((target, index) =>
        runOneTestRun({
          apiToken: target.apiToken,
          appUrl: target.apiToken,
          // TODO: Use the target ID rather than the index.
          runNumber: index,
          githubToken,
          headSha,
        })
      )
    )
  ).forEach((result, index) => {
    if (result.status === "rejected") {
      const message =
        result.reason instanceof Error ? result.reason.message : `${error}`;
      failureMessage += `Run #${index + 1} failed: ${message}\n`;
    }
  });
  if (failureMessage) {
    setFailed(failureMessage);
    transaction.setStatus("unknown_error");
  } else {
    transaction.setStatus("ok");
  }
  transaction.finish();
  await sentryHub.getClient()?.close(5_000);
  process.exit(failureMessage ? 1 : 0);
};
