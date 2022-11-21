import { spawn } from "child_process";
import { getInput, setFailed, setOutput } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { getBaseCommitSha } from "./utils/get-base-commit-sha";
import { shouldRunForPayload } from "./utils/should_run_for_payload";

export const runMeticulousTestsAction = async (): Promise<void> => {
  try {
    if (!shouldRunForPayload(context.payload)) {
      console.warn(
        `Running report-diffs-action is only supported for 'push' and 'pull_request' events, but was triggered on a '${context.payload.action}' event. Skipping execution.`
      );
      return;
    }

    const octokit = getOctokit(getInput("githubToken"));
    const { owner, repo } = context.repo;
    const baseCommitSha = await getBaseCommitSha({
      owner,
      repo,
      payload: context.payload,
      octokit,
    });
    console.log("Base Commit SHA", baseCommitSha);

    // `who_to_greet` input defined in action metadata file
    // const nameToGreet = getInput("who_to_greet");
    // console.log(`Hello ${nameToGreet}!`);
    const time = new Date().toTimeString();
    setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(context.payload, undefined, 2);
    console.log(`The event payload: ${payload}`);

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
