import { getInput } from "@actions/core";
import { AssetUploadMetadata } from "@alwaysmeticulous/api";

export interface UploadAssetsInputs {
  apiToken: string;
  githubToken: string;
  appDirectory: string;
  rewrites: AssetUploadMetadata["rewrites"];
}

export const getUploadAssetsInputs = (): UploadAssetsInputs => {
  const apiToken = getInput("api-token", { required: true });
  const githubToken = getInput("github-token", { required: true });
  const appDirectory = getInput("app-directory", { required: true });
  const rewrites = JSON.parse(getInput("rewrites") || "[]");

  if (!Array.isArray(rewrites)) {
    throw new Error("Rewrites must be an array");
  }

  for (const rule of rewrites) {
    if (typeof rule !== "object" || rule === null) {
      throw new Error("Each rewrite rule must be an object");
    }

    if (typeof rule.source !== "string") {
      throw new Error("Each rewrite rule must have a string 'source' property");
    }

    if (typeof rule.destination !== "string") {
      throw new Error(
        "Each rewrite rule must have a string 'destination' property"
      );
    }
  }

  return {
    apiToken,
    githubToken,
    appDirectory,
    rewrites,
  };
};
