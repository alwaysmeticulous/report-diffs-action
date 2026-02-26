import { getInput } from "@actions/core";
import { ContainerEnvVariable } from "@alwaysmeticulous/client";

export interface UploadContainerInputs {
  apiToken: string;
  githubToken: string;
  imageTag: string;
  waitForBase: boolean;
  containerPort: number | undefined;
  containerEnv: ContainerEnvVariable[] | undefined;
}

export const getUploadContainerInputs = (): UploadContainerInputs => {
  const apiToken = getInput("api-token", { required: true });
  const githubToken = getInput("github-token", { required: true });
  const imageTag = getInput("image-tag", { required: true });
  const waitForBaseStr = getInput("wait-for-base") || "true";
  const waitForBase = waitForBaseStr.toLowerCase() === "true";
  const containerPortStr = getInput("container-port");
  const containerEnvStr = getInput("container-env");

  if (!imageTag || imageTag.trim() === "") {
    throw new Error("image-tag must be a non-empty string");
  }

  let containerPort: number | undefined;
  if (containerPortStr && containerPortStr.trim() !== "") {
    containerPort = parseInt(containerPortStr.trim(), 10);
    if (isNaN(containerPort)) {
      throw new Error("container-port must be a valid integer");
    }
  }

  let containerEnv: ContainerEnvVariable[] | undefined;
  if (containerEnvStr && containerEnvStr.trim() !== "") {
    containerEnv = containerEnvStr
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"))
      .map((line) => {
        const eqIndex = line.indexOf("=");
        if (eqIndex === -1) {
          throw new Error(
            `container-env: invalid line "${line}" - expected KEY=VALUE format`
          );
        }
        return { name: line.slice(0, eqIndex), value: line.slice(eqIndex + 1) };
      });
  }

  return {
    apiToken,
    githubToken,
    imageTag: imageTag.trim(),
    waitForBase,
    containerPort,
    containerEnv,
  };
};
