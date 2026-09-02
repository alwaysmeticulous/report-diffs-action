import { getInput } from "@actions/core";

export interface EnsureBaseInputs {
  apiToken: string;
  githubToken: string;
}

export const getEnsureBaseInputs = (): EnsureBaseInputs => {
  const apiToken = getInput("api-token", { required: true });
  const githubToken = getInput("github-token", { required: true });
  return { apiToken, githubToken };
};
