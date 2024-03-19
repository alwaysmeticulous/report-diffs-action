import { getInputFromEnv } from "../../utils/get-input-from-env";

export const getInCloudActionInputs = () => {
  // The names, required value, and types should match that in action.yml
  const apiToken = getInputFromEnv({
    name: "api-token",
    required: true,
    type: "string",
  });
  const githubToken = getInputFromEnv({
    name: "github-token",
    required: true,
    type: "string",
  });
  const appUrl = getInputFromEnv({
    name: "app-url",
    required: true,
    type: "string",
  });

  return {
    apiToken,
    githubToken,
    appUrl,
  };
};
