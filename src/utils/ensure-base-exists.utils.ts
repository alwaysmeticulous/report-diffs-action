import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";
import { getLatestTestRunResults } from "@alwaysmeticulous/cli";
import { createClient } from "@alwaysmeticulous/cli/dist/api/client.js";
import { METICULOUS_LOGGER_NAME } from "@alwaysmeticulous/common";
import log from "loglevel";
import { CodeChangeEvent } from "../types";
import {
  getCurrentWorkflowId,
  getOrStartNewWorkflowRun,
  waitForWorkflowCompletion,
} from "./workflow.utils";

export const ensureBaseTestsExists = async ({
  event,
  apiToken,
  base,
  context,
  octokit,
}: {
  event: CodeChangeEvent;
  apiToken: string;
  base: string | null;
  context: Context;
  octokit: InstanceType<typeof GitHub>;
}): Promise<void> => {
  const logger = log.getLogger(METICULOUS_LOGGER_NAME);

  // Running missing tests on base is only supported for Pull Request events
  if (event.type !== "pull_request" || !base) {
    return;
  }

  const testRun = await getLatestTestRunResults({
    client: createClient({ apiToken }),
    commitSha: base,
  });

  if (testRun != null) {
    console.log(`Tests already exist for commit ${base} (${testRun.id})`);
    return;
  }

  const { workflowId } = await getCurrentWorkflowId({ context, octokit });
  const { owner, repo } = context.repo;
  const baseRef = event.payload.pull_request.base.ref;

  logger.debug(
    `Debug: ${JSON.stringify({ owner, repo, base, baseRef }, null, 2)}`
  );

  const currentBaseSha = await getHeadCommitForRef({
    owner,
    repo,
    ref: baseRef,
    octokit,
  });

  logger.debug(`Debug: ${JSON.stringify({ currentBaseSha }, null, 2)}`);

  const workflowRun = await getOrStartNewWorkflowRun({
    owner,
    repo,
    workflowId,
    ref: baseRef,
    commitSha: currentBaseSha ?? base,
    octokit,
  });

  if (workflowRun == null) {
    throw new Error(`Could not retrieve dispatched workflow run`);
  }

  console.log(`Waiting on workflow run: ${workflowRun.html_url}`);
  const finalWorkflowRun = await waitForWorkflowCompletion({
    owner,
    repo,
    workflowRunId: workflowRun.workflowRunId,
    octokit,
  });

  if (
    finalWorkflowRun.status !== "completed" ||
    finalWorkflowRun.conclusion !== "success"
  ) {
    throw new Error(
      `Comparing against screenshots taken on ${baseRef}, but the corresponding workflow run [${finalWorkflowRun.id}] did not complete successfully. See: ${finalWorkflowRun.html_url}`
    );
  }
};

const getHeadCommitForRef = async ({
  owner,
  repo,
  ref,
  octokit,
}: {
  owner: string;
  repo: string;
  ref: string;
  octokit: InstanceType<typeof GitHub>;
}): Promise<string | null> => {
  const result = await octokit.rest.repos.getBranch({
    owner,
    repo,
    branch: ref,
  });
  const commitSha = result.data.commit.sha;
  return commitSha;
};
