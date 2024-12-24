import { createClient, getProject } from "@alwaysmeticulous/client";
import { initLogger } from "../../common/logger.utils";
import { runPostStep } from "../../common/run-post-step";
import { getHeadCommitSha } from "./get-head-commit-sha";
import { getInCloudActionInputs } from "./get-inputs";

export const runCloudComputePostStep = async (): Promise<void> => {
  const logger = initLogger();
  const {
    projectTargets,
    githubToken,
    headSha: headShaFromInput,
  } = getInCloudActionInputs();

  const headSha = await getHeadCommitSha({
    headShaFromInput,
    throwIfFailedToComputeSha: false,
    logger,
  });

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
        ...(headSha ? { headSha } : {}),
      });
    })
  );
};
