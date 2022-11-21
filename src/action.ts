import { spawn } from "child_process";
import { getInput, setFailed } from "@actions/core";
import { context } from "@actions/github";

export const runMeticulousTestsAction = async (): Promise<void> => {
  try {
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(context.payload, undefined, 2);
    console.log(`The event payload: ${payload}`);

    const apiToken = getInput("api_token");
    const cliArguments = getInput("arguments");
    console.log(["run-all-tests", `--apiToken=${apiToken}`, cliArguments]);
    const child = spawn(
      "/app/node_modules/@alwaysmeticulous/cli/bin/meticulous",
      ["run-all-tests", `--apiToken=${apiToken}`, cliArguments],
      { stdio: "inherit" }
    );
    await new Promise<void>((resolve) => {
      child.on("close", (code) => {
        console.log(`Exit code: ${code}`);
        resolve();
      });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    setFailed(message);
  }
};
