import { getProject, createClient } from "@alwaysmeticulous/client";
import { runPostStep } from "../../common/run-post-step";
import { getUploadAssetsInputs } from "./get-inputs";

export const runUploadAssetsPostStep = async (): Promise<void> => {
  const { apiToken, githubToken } = getUploadAssetsInputs();

  const client = createClient({ apiToken });

  const project = await getProject(client);

  if (!project) {
    throw new Error("Project not found!");
  }

  return runPostStep({
    apiToken,
    githubToken,
    testSuiteOrProjectId: project.id,
    shouldHaveComment: false,
  });
};
