import { getInput } from "@actions/core";

export const getInCloudActionInputs = () => {
  // The names, required value, and types should match that in action.yml
  const apiToken = getInput("api-token", { required: true });
  const githubToken = getInput("github-token", { required: true });
  const appUrl = getInput("app-url", { required: true });
  const headSha = getInput("head-sha");

  return {
    apiToken,
    githubToken,
    appUrl,
    headSha,
  };
};
