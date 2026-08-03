import { getInput } from "@actions/core";
import { ContainerEnvVariable } from "@alwaysmeticulous/client";

// Not exported from `@alwaysmeticulous/remote-replay-launcher`, so re-declared here to match
// `CompanionAssetsOptions` structurally.
export interface CompanionAssetsOptions {
  folder?: string;
  zip?: string;
  pathInImage?: string;
  regex: string;
}

export interface UploadContainerInputs {
  apiToken: string;
  githubToken: string;
  imageTag: string;
  containerPort: number | undefined;
  containerEnv: ContainerEnvVariable[] | undefined;
  containerHealthCheckEndpoint: string | undefined;
  commitSha?: string;
  companionAssets: CompanionAssetsOptions | undefined;
}

export const getUploadContainerInputs = (): UploadContainerInputs => {
  const apiToken = getInput("api-token", { required: true });
  const githubToken = getInput("github-token", { required: true });
  const imageTag = getInput("image-tag", { required: true });
  const containerPortStr = getInput("container-port");
  const containerEnvStr = getInput("container-env");
  const containerHealthCheckEndpointStr = getInput(
    "container-health-check-endpoint"
  );
  const commitSha = getInput("commit-sha", { required: false }) || undefined;
  const companionAssetsFolder =
    getInput("companion-assets-folder", { required: false }) || undefined;
  const companionAssetsZip =
    getInput("companion-assets-zip", { required: false }) || undefined;
  const companionAssetsPathInImage =
    getInput("companion-assets-path-in-image", { required: false }) ||
    undefined;
  const companionAssetsRegex =
    getInput("companion-assets-regex", { required: false }) || undefined;

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

  const containerHealthCheckEndpoint =
    containerHealthCheckEndpointStr &&
    containerHealthCheckEndpointStr.trim() !== ""
      ? containerHealthCheckEndpointStr.trim()
      : undefined;

  const companionAssetsSources = [
    companionAssetsFolder,
    companionAssetsZip,
    companionAssetsPathInImage,
  ].filter((value) => value != null);

  if (companionAssetsSources.length > 1) {
    throw new Error(
      "At most one of 'companion-assets-folder', 'companion-assets-zip' and " +
        "'companion-assets-path-in-image' may be provided"
    );
  }

  if (companionAssetsSources.length > 0 && !companionAssetsRegex) {
    throw new Error(
      "'companion-assets-regex' must be provided if 'companion-assets-folder', " +
        "'companion-assets-zip' or 'companion-assets-path-in-image' is provided"
    );
  }

  if (companionAssetsSources.length === 0 && companionAssetsRegex) {
    throw new Error(
      "'companion-assets-regex' was provided but none of 'companion-assets-folder', " +
        "'companion-assets-zip' or 'companion-assets-path-in-image' was provided"
    );
  }

  const companionAssets: CompanionAssetsOptions | undefined =
    companionAssetsSources.length > 0
      ? {
          ...(companionAssetsFolder != null
            ? { folder: companionAssetsFolder }
            : {}),
          ...(companionAssetsZip != null ? { zip: companionAssetsZip } : {}),
          ...(companionAssetsPathInImage != null
            ? { pathInImage: companionAssetsPathInImage }
            : {}),
          regex: companionAssetsRegex as string,
        }
      : undefined;

  return {
    apiToken,
    githubToken,
    imageTag: imageTag.trim(),
    containerPort,
    containerEnv,
    containerHealthCheckEndpoint,
    commitSha,
    companionAssets,
  };
};
