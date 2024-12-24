import { createClient, getProject } from "@alwaysmeticulous/client";
import { getHeadCommitShaFromRepo } from "../../common/get-base-and-head-commit-shas";
import { initLogger } from "../../common/logger.utils";
import { runPostStep } from "../../common/run-post-step";
import { getInCloudActionInputs } from "./get-inputs";

export const runCloudComputePostStep = async (): Promise<void> => {
  const logger = initLogger();
  const {
    projectTargets,
    githubToken,
    headSha: headShaFromInput,
  } = getInCloudActionInputs();

  // Compute the HEAD commit SHA to use when creating a test run.
  // In a PR workflow this will by default be process.env.GITHUB_SHA (the temporary merge commit) or
  // sometimes the head commit of the PR.
  // Users can also explicitly provide the head commit SHA to use as input. This is useful when the action is not
  // run with the code checked out.
  // Our backend is responsible for computing the correct BASE commit to create the test run for.
  let headSha = headShaFromInput;
  if (headSha == null) {
    try {
      headSha = getHeadCommitShaFromRepo();
    } catch (error) {
      logger.error(
        `Failed to get HEAD commit SHA from repo. Error: ${error}. Reporting telemetry without a HEAD commit SHA.`
      );
    }
  }

  const projectTargetsToRun = projectTargets.filter((target) => !target.skip);

  await Promise.all(
    projectTargetsToRun.map(async (target) => {
      const client = createClient({ apiToken: target.apiToken });

      const project = await getProject(client);

      if (!project) {
        throw new Error(`Project for target ${target.name} not found.`);
      }

      return runPostStep({
        apiToken: target.apiToken,
        githubToken,
        testSuiteOrProjectId: project.id,
        headSha,
      });
    })
  );
};
