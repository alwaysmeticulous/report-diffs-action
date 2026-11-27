import { getInput } from "@actions/core";
import {
  ActionAuthInputs,
  getActionAuthInputs,
} from "../../common/resolve-api-token";

export interface EnsureBaseInputs extends ActionAuthInputs {
  githubToken: string;
  ref?: string;
}

export const getEnsureBaseInputs = (): EnsureBaseInputs => {
  const authInputs = getActionAuthInputs();
  const githubToken = getInput("github-token", { required: true });
  const ref = getInput("ref", { required: false }) || undefined;
  return { ...authInputs, githubToken, ...(ref ? { ref } : {}) };
};
