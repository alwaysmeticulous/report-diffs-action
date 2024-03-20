import { getInput } from "@actions/core";

export const getInCloudActionInputs = () => {
  // The names, required value, and types should match that in action.yml
  console.log(process.env);

  const apiToken = getInput("api-token", { required: true });
  const githubToken = getInput("github-token", { required: true });
  const appUrl = getInput("app-url", { required: true });

  return {
    apiToken,
    githubToken,
    appUrl,
  };
};
