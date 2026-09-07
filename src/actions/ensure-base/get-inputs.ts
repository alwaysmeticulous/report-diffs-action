import { getInput } from "@actions/core";

export interface EnsureBaseInputs {
  apiToken: string;
  githubToken: string;
  ref?: string;
}

export const getEnsureBaseInputs = (): EnsureBaseInputs => {
  const apiToken = getInput("api-token", { required: true });
  const githubToken = getInput("github-token", { required: true });
  const ref = getInput("ref", { required: false }) || undefined;
  return { apiToken, githubToken, ...(ref ? { ref } : {}) };
};
