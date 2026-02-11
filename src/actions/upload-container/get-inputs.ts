import { getInput } from "@actions/core";

export interface UploadContainerInputs {
  apiToken: string;
  githubToken: string;
  imageTag: string;
  waitForBase: boolean;
}

export const getUploadContainerInputs = (): UploadContainerInputs => {
  const apiToken = getInput("api-token", { required: true });
  const githubToken = getInput("github-token", { required: true });
  const imageTag = getInput("image-tag", { required: true });
  const waitForBaseStr = getInput("wait-for-base") || "true";
  const waitForBase = waitForBaseStr.toLowerCase() === "true";

  if (!imageTag || imageTag.trim() === "") {
    throw new Error("image-tag must be a non-empty string");
  }

  return {
    apiToken,
    githubToken,
    imageTag: imageTag.trim(),
    waitForBase,
  };
};
