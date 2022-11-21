import { spawn } from "child_process";
import { readFile } from "fs/promises";
import { getInput, setFailed } from "@actions/core";
import { context } from "@actions/github";

export const runMeticulousTestsAction = async (): Promise<void> => {
  try {
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(context.payload, undefined, 2);
    console.log(`The event payload: ${payload}`);

    const apiToken = getInput("api_token");
    const cliArguments = getInput("arguments").split("\n");
    console.log(["run-all-tests", `--apiToken=${apiToken}`, ...cliArguments]);

    console.log(await readFile("tests.json"));

    const child = spawn(
      "/app/node_modules/@alwaysmeticulous/cli/bin/meticulous",
      ["run-all-tests", `--apiToken=${apiToken}`, ...cliArguments],
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
