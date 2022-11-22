import { spawn } from "child_process";
import { getInput, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { CodeChangeEvent } from "./types";
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
    postOrUpdateComment({
      octokit,
      owner,
      repo,
      event,
      body: `🤖 Executing ? user sessions covering ? screens to check for differences... ([details](https://app.meticulous.ai), commit: ${head.substring(
        0,
        8
      )})`,
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
      postOrUpdateComment({
        octokit,
        owner,
        repo,
        event,
        body: `✅ Spotted zero visual differences across ? sessions: [view ? screens tested](https://app.meticulous.ai) (commit: ${head.substring(
          0,
          8
        )}).`,
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
      postOrUpdateComment({
        octokit,
        owner,
        repo,
        event,
        body: `🤖 Spotted ? visual differences out of ? screens rendered: [view differences detected](https://app.meticulous.ai) (commit: ${head.substring(
          0,
          8
        )}).`,
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

const postOrUpdateComment = async ({
  octokit,
  event,
  owner,
  repo,
  body,
}: {
  octokit: ReturnType<typeof getOctokit>;
  event: CodeChangeEvent;
  owner: string;
  repo: string;
  body: string;
}) => {
  if (event.type !== "pull_request") {
    return;
  }

  // Check for existing comments
  const comments = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: event.payload.pull_request.number,
    per_page: 1000,
  });
  console.log(`Existing comments: ${JSON.stringify(comments)}`);

  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: event.payload.pull_request.number,
    body,
  });
};
