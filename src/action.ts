import { spawn } from "child_process";
import { readFile } from "fs/promises";
import { getInput, setFailed } from "@actions/core";
import { context } from "@actions/github";
import { getBaseAndHeadCommitShas } from "./utils/get-base-and-head-commit-shas";
import { getCodeChangeEvent } from "./utils/get-code-change-event";

export const runMeticulousTestsAction = async (): Promise<void> => {
  try {

    const { payload } = context;
    const event = getCodeChangeEvent(context.eventName, payload);

    if (event == null) {
      console.warn(
        `Running report-diffs-action is only supported for 'push' and 'pull_request' events, but was triggered on a '${context.eventName}' event. Skipping execution.`
      );
      return;
    }

    const { base, head } = await getBaseAndHeadCommitShas(event);
    console.log("Base Commit SHA", base);
    console.log("Head Commit SHA", head);

    // Get the JSON webhook payload for the event that triggered the workflow
    console.log(`The event payload: ${JSON.stringify(payload, undefined, 2)}`);

    const apiToken = getInput("apiToken");
    const cliArguments = getInput("arguments").split("\n");
    console.log(["run-all-tests", `--apiToken=${apiToken}`, ...cliArguments]);

    const child = spawn(
      "/app/node_modules/@alwaysmeticulous/cli/bin/meticulous",
      ["run-all-tests", `--apiToken=${apiToken}`, `--commitSha=${head}`, `--baseCommitSha=${base}`, ...cliArguments],
      { stdio: "inherit" }
    );
    await new Promise<void>((resolve) => {
      child.on("close", (code) => {
        if (code != 0) {
          setFailed(`Command exited with code: ${code}`);
        }
        resolve();
      });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    setFailed(message);
  }
};
