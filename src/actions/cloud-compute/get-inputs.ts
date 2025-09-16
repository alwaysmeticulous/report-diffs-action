import { getBooleanInput, getInput } from "@actions/core";
import { ProjectTarget } from "./types";
import { parseProjectsYaml } from "./validate-projects-yaml";

export const getInCloudActionInputs = (): {
  githubToken: string;
  headSha: string;
  projectTargets: ProjectTarget[];
  secureTunnelHost?: string;
  proxyAllUrls: boolean;
  rewriteHostnameToAppUrl: boolean;
  companionAssetsFolder?: string;
  companionAssetsRegex?: string;
} => {
  // The names, required value, and types should match that in action.yml
  const apiToken = getInput("api-token", { required: false });
  const githubToken = getInput("github-token", { required: true });
  const appUrl = getInput("app-url", { required: false });
  const headSha = getInput("head-sha");
  const secureTunnelHost = getInput("secure-tunnel-host", { required: false });
  const proxyAllUrls = getBooleanInput("proxy-all-urls", { required: false });
  const companionAssetsFolder = getInput("companion-assets-folder", {
    required: false,
  });
  const companionAssetsRegex = getInput("companion-assets-regex", {
    required: false,
  });
  const rewriteHostnameToAppUrl = getBooleanInput(
    "rewrite-hostname-to-app-url",
    { required: false }
  );

  const projectsYaml = getInput("projects-yaml", { required: false });

  if (!!companionAssetsFolder !== !!companionAssetsRegex) {
    throw new Error(
      "Must provide both 'companion-assets-folder' and 'companion-assets-regex', or neither"
    );
  }

  if (projectsYaml) {
    if (apiToken || appUrl) {
      throw new Error(
        "Cannot provide both 'projects-yaml' and 'api-token' or 'app-url'"
      );
    }

    const projectTargets = parseProjectsYaml(projectsYaml);

    return {
      githubToken,
      headSha,
      projectTargets,
      secureTunnelHost,
      proxyAllUrls,
      rewriteHostnameToAppUrl,
      companionAssetsFolder,
      companionAssetsRegex,
    };
  }

  if (!apiToken || !appUrl) {
    throw new Error(
      "Must provide either 'projects-yaml' or 'api-token' and 'app-url'"
    );
  }

  return {
    githubToken,
    headSha,
    projectTargets: [
      {
        name: "default",
        apiToken,
        appUrl,
        skip: false,
      },
    ],
    secureTunnelHost,
    proxyAllUrls,
    rewriteHostnameToAppUrl,
    companionAssetsFolder,
    companionAssetsRegex,
  };
};
