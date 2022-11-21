import { spawn } from "child_process";
import { getInput, setFailed, setOutput } from "@actions/core";
import { context } from "@actions/github";
import { getBaseAndHeadCommitShas } from "./utils/get-base-and-head-commit-shas";
import { shouldRunForPayload } from "./utils/should_run_for_payload";

export const runMeticulousTestsAction = async (): Promise<void> => {
  try {
    const { payload } = context;

    if (!shouldRunForPayload(payload)) {
      console.warn(
        `Running report-diffs-action is only supported for 'push' and 'pull_request' events, but was triggered on a '${context.payload.action}' (${context.eventName}) event. Skipping execution.`
      );
      return;
    }

    const { base, head } = await getBaseAndHeadCommitShas(payload);
    console.log("Base Commit SHA", base);
    console.log("Head Commit SHA", head);

    // `who_to_greet` input defined in action metadata file
    // const nameToGreet = getInput("who_to_greet");
    // console.log(`Hello ${nameToGreet}!`);
    const time = new Date().toTimeString();
    setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    console.log(`The event payload: ${JSON.stringify(payload, undefined, 2)}`);

    const apiToken = getInput("apiToken");
    const child = spawn(
      "/app/node_modules/@alwaysmeticulous/cli/bin/meticulous",
      ["show-project", "--logLevel=trace", `--apiToken=${apiToken}`],
      { stdio: "inherit" }
    );
    await new Promise<void>((resolve) => {
      child.on("close", resolve);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    setFailed(message);
  }
};
