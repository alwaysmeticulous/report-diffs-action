import { getInputFromEnv } from "../../common/get-input-from-env";

export const getMainActionInputs = () => {
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
  const appUrl = getInputFromEnv({
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
  const allowedEnvironments = getInputFromEnv({
    name: "allowed-environments",
    required: false,
    type: "string-array",
  });
  const additionalPorts = getInputFromEnv({
    name: "additional-ports",
    required: false,
    type: "string",
  });

  if (appUrl != null && appUrl != "" && useDeploymentUrl === true) {
    throw new Error("Cannot use both app-url and use-deployment-url");
  }

  if (!useDeploymentUrl && allowedEnvironments != null) {
    throw new Error(
      "allowed-environments can only be used when use-deployment-url is true. Please set use-deployment-url to true to run the tests " +
        "against a deployment URL, and then set allowed-environments to specify which environment to test against."
    );
  }

  if (allowedEnvironments != null && allowedEnvironments.length === 0) {
    throw new Error(
      "allowed-environments cannot be empty. Please either omit it as an input or specify at least one environment to test against."
    );
  }

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
    allowedEnvironments,
    additionalPorts,
  };
};
