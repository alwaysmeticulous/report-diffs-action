import { getProject, createClient } from "@alwaysmeticulous/client";
import { createActionApiTokenResolver } from "../../common/resolve-api-token";
import { runPostStep } from "../../common/run-post-step";
import { getUploadAssetsInputs } from "./get-inputs";

export const runUploadAssetsPostStep = async (): Promise<void> => {
  const {
    apiToken: apiTokenInput,
    project: projectInput,
    oidcAudience,
    baseApiUrl,
    githubToken,
  } = getUploadAssetsInputs();

  if (baseApiUrl) {
    process.env["METICULOUS_API_URL"] = baseApiUrl;
  }

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
