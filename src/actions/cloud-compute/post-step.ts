import { createClient, getProject } from "@alwaysmeticulous/client";
import { runPostStep } from "../../common/run-post-step";
import { getInCloudActionInputs } from "./get-inputs";

export const runCloudComputePostStep = async (): Promise<void> => {
  const { projectTargets, githubToken } = getInCloudActionInputs();

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
      });
    })
  );
};
