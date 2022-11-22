import { spawn } from "child_process";
import { getInput, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { getBaseAndHeadCommitShas } from "./utils/get-base-and-head-commit-shas";
import { getCodeChangeEvent } from "./utils/get-code-change-event";

export const runMeticulousTestsAction = async (): Promise<void> => {
  try {
    const apiToken = process.env.API_TOKEN ?? null;
    const githubToken = process.env.GITHUB_TOKEN ?? null;
    const octokit = getOctokitOrThrow(githubToken);

    const { payload } = context;
    const event = getCodeChangeEvent(context.eventName, payload);

    if (event == null) {
      console.warn(
        `Running report-diffs-action is only supported for 'push' and 'pull_request' events, but was triggered on a '${context.eventName}' event. Skipping execution.`
      );
      return;
    }

    const { base, head } = getBaseAndHeadCommitShas(event);

    const { owner, repo } = context.repo;
    await octokit.rest.repos.createCommitStatus({
      owner,
      repo,
      context: "Meticulous",
      description: "Testing against ? screens across ? user sessions",
      state: "pending",
      sha: head,
      target_url: "https://app.meticulous.ai/???",
    });

    const additionalArguments = getInput("arguments").split("\n");
    const cliArguments = [
      `--commitSha=${head}`,
      `--baseCommitSha=${base}`,
      ...additionalArguments,
    ];
    console.log(cliArguments);

    const child = spawn(
      "/app/node_modules/@alwaysmeticulous/cli/bin/meticulous",
      ["run-all-tests", `--apiToken=${apiToken}`, ...cliArguments],
      { stdio: "inherit" }
    );
    try {
      await new Promise<void>((resolve) => {
        child.on("close", (code) => {
          if (code != 0) {
            setFailed(`Command exited with code: ${code}`);
          }
          resolve();
        });
      });
      await octokit.rest.repos.createCommitStatus({
        owner,
        repo,
        context: "Meticulous",
        description: "Zero differences spotted in ? screens tested",
        state: "success",
        sha: head,
        target_url: "https://app.meticulous.ai/???",
      });
    } catch (err) {
      await octokit.rest.repos.createCommitStatus({
        owner,
        repo,
        context: "Meticulous",
        description: "Differences in ? out of ? screens, click details to view",
        state: "success",
        sha: head,
        target_url: "https://app.meticulous.ai/???",
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    setFailed(message);
  }
};

const getOctokitOrThrow = (githubToken: string | null) => {
  if (githubToken == null) {
    throw new Error("github-token is required");
  }

  try {
    return getOctokit(githubToken);
  } catch (err) {
    console.error(err);
    throw new Error(
      "Error connecting to Github. Did you specify a valid 'github-token'?"
    );
  }
};
