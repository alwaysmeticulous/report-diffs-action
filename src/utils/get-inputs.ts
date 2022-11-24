import { getInputFromEnv } from "./get-input-from-env";

export const getInputs = () => {
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
  const testsFile = getInputFromEnv({
    name: "tests-file",
    required: false,
    type: "string",
  });
  return { apiToken, githubToken, appUrl, testsFile };
};
