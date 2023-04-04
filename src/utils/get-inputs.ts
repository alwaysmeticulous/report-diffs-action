import { getInputFromEnv } from "./get-input-from-env";

export const getInputs = () => {
  // The names, required value, and types should match that in action.yml
  const apiToken = getInputFromEnv({
    name: "api-token",
    required: true,
    type: "string",
  });
  const githubToken = getInputFromEnv({
    name: "github-token",
    required: true,
    type: "string",
  });
  const appUrl_ = getInputFromEnv({
    name: "app-url",
    required: false,
    type: "string",
  });
  const testsFile = getInputFromEnv({
    name: "tests-file",
    required: false,
    type: "string",
  });
  const maxRetriesOnFailure = getInputFromEnv({
    name: "max-retries-on-failure",
    required: true,
    type: "int",
  });
  const parallelTasks = getInputFromEnv({
    name: "parallel-tasks",
    required: false,
    type: "int",
  });
  const localhostAliases = getInputFromEnv({
    name: "localhost-aliases",
    required: false,
    type: "string",
  });
  const maxAllowedColorDifference = getInputFromEnv({
    name: "max-allowed-color-difference",
    required: true,
    type: "float",
  });
  const maxAllowedProportionOfChangedPixels = getInputFromEnv({
    name: "max-allowed-proportion-of-changed-pixels",
    required: true,
    type: "float",
  });
  const useDeploymentUrl = getInputFromEnv({
    name: "use-deployment-url",
    required: true,
    type: "boolean",
  });
  const testSuiteId = getInputFromEnv({
    name: "test-suite-id",
    required: false,
    type: "string",
  });

  if (appUrl_ != null && appUrl_ != "" && useDeploymentUrl === true) {
    throw new Error("Cannot use both app-url and use-deployment-url");
  }

  const appUrl = appUrl_ ? handleLocalhostUrl(appUrl_) : appUrl_;

  return {
    apiToken,
    githubToken,
    appUrl,
    testsFile,
    maxRetriesOnFailure,
    parallelTasks,
    localhostAliases,
    maxAllowedColorDifference,
    maxAllowedProportionOfChangedPixels,
    useDeploymentUrl,
    testSuiteId,
  };
};

export const DOCKER_BRIDGE_NETWORK_GATEWAY = "172.17.0.1";

// Swaps "localhost" with the IP address of the Docker host
const handleLocalhostUrl = (appUrl: string): string => {
  try {
    const url = new URL(appUrl);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      url.hostname = DOCKER_BRIDGE_NETWORK_GATEWAY;
    }
    return url.toString();
  } catch (error) {
    return appUrl;
  }
};
