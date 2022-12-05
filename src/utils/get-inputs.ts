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
    required: true,
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
    type: "number",
  });

  const appUrl = handleLocalhostUrl(appUrl_);

  return { apiToken, githubToken, appUrl, testsFile, maxRetriesOnFailure };
};

const DOCKER_BRIDGE_NETWORK_GATEWAY = "172.17.0.1";

// Swaps "localhost" with the IP address of the Docker host
const handleLocalhostUrl = (appUrl: string): string => {
  try {
    const url = new URL(appUrl);
    if (url.hostname === "localhost") {
      url.hostname = DOCKER_BRIDGE_NETWORK_GATEWAY;
    }
    return url.toString();
  } catch (error) {
    return appUrl;
  }
};
