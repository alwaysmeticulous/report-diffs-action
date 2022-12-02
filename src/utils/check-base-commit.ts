import { setOutput } from "@actions/core";
import { context } from "@actions/github";
import {
  getLatestTestRunResults,
  initLogger,
  setLogLevel,
} from "@alwaysmeticulous/cli";
import { createClient } from "@alwaysmeticulous/cli/dist/api/client.js";
import { getBaseAndHeadCommitShas } from "./get-base-and-head-commit-shas";
import { getCodeChangeEvent } from "./get-code-change-event";
import { getInputs } from "./get-inputs";

export const runCheckBaseCommitAction = async (): Promise<void> => {
  initLogger();
  if (+(process.env["RUNNER_DEBUG"] ?? "0")) {
    setLogLevel("trace");
  }

  const { apiToken } = getInputs();
  const { payload } = context;
  const event = getCodeChangeEvent(context.eventName, payload);

  if (event == null) {
    console.warn(
      `Running report-diffs-action is only supported for 'push' and 'pull_request' events, but was triggered on a '${context.eventName}' event. Skipping execution.`
    );
    return;
  }

  const { base, head } = getBaseAndHeadCommitShas(event);
  const testRun = await getLatestTestRunResults({
    client: createClient({ apiToken }),
    commitSha: base,
  });

  setOutput("base-commit", base);
  setOutput("head-commit", head);

  if (testRun == null) {
    console.log(`No test run found for base commit ${base}`);
    setOutput("base-test-run", "");
    return;
  }

  setOutput("base-test-run", testRun.id);
};
