import { getProject, createClient } from "@alwaysmeticulous/client";
import { createActionApiTokenResolver } from "../../common/resolve-api-token";
import { runPostStep } from "../../common/run-post-step";
import { getUploadContainerInputs } from "./get-inputs";

export const runUploadContainerPostStep = async (): Promise<void> => {
  const {
    apiToken: apiTokenInput,
    project: projectInput,
    oidcAudience,
    githubToken,
  } = getUploadContainerInputs();

  const tokenResolver = createActionApiTokenResolver({
    apiToken: apiTokenInput,
    project: projectInput,
    oidcAudience,
    allowSavedState: true,
    persistState: false,
  });
  const apiToken = await tokenResolver.getApiToken();

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
