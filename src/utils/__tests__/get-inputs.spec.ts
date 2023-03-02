import { getInputs } from "../get-inputs";

const keys = [
  "API_TOKEN",
  "GITHUB_TOKEN",
  "APP_URL",
  "TESTS_FILE",
  "MAX_RETRIES_ON_FAILURE",
  "PARALLEL_TASKS",
  "LOCALHOST_ALIASES",
  "MAX_ALLOWED_COLOR_DIFFERENCE",
  "MAX_ALLOWED_PROPORTION_OF_CHANGED_PIXELS",
  "METICULOUS_TELEMETRY_SAMPLE_RATE",
];

const EXPECTED_DEFAULT_VALUES = {
  apiToken: "mock-api-token",
  githubToken: "mock-github-token",
  maxRetriesOnFailure: 5,
  maxAllowedColorDifference: 0.01,
  maxAllowedProportionOfChangedPixels: 0.00001,
  appUrl: null,
  localhostAliases: null,
  parallelTasks: null,
  testsFile: null,
};

describe("getInputs", () => {
  const oldEnv: Record<string, any> = {};

  beforeEach(() => {
    keys.forEach((key) => {
      if (key in process.env) {
        oldEnv[key] = process.env[key];
      }
    });
  });

  afterEach(() => {
    keys.forEach((key) => {
      if (key in process.env && !(key in oldEnv)) {
        delete process.env[key];
      }
      if (key in oldEnv) {
        process.env[key] = oldEnv[key];
      }
    });
  });

  it("parses the required values correctly", () => {
    process.env.API_TOKEN = "mock-api-token";
    process.env.GITHUB_TOKEN = "mock-github-token";
    process.env.MAX_RETRIES_ON_FAILURE = "5";
    process.env.MAX_ALLOWED_COLOR_DIFFERENCE = "0.01";
    process.env.MAX_ALLOWED_PROPORTION_OF_CHANGED_PIXELS = "0.00001";

    expect(getInputs()).toEqual(EXPECTED_DEFAULT_VALUES);
  });

  it("parses the required values correctly, even when GH passes us '1E-05' style values", () => {
    setupDefaultEnvVars();

    expect(getInputs()).toEqual(EXPECTED_DEFAULT_VALUES);
  });

  it("parses the optional values correctly", () => {
    setupDefaultEnvVars();
    process.env.APP_URL = "https://example.com";
    process.env.TESTS_FILE = "tests.json";
    process.env.PARALLEL_TASKS = "5";
    process.env.LOCALHOST_ALIASES = "app1.local,app2.local";

    expect(getInputs()).toEqual({
      ...EXPECTED_DEFAULT_VALUES,
      appUrl: "https://example.com/",
      localhostAliases: "app1.local,app2.local",
      parallelTasks: 5,
      testsFile: "tests.json",
    });
  });

  it("handles rewriting localhost urls to the docker bridge IP", () => {
    setupDefaultEnvVars();
    process.env.APP_URL = "https://localhost/app";

    expect(getInputs()).toEqual({
      ...EXPECTED_DEFAULT_VALUES,
      appUrl: "https://172.17.0.1/app",
    });
  });

  const setupDefaultEnvVars = () => {
    process.env.API_TOKEN = "mock-api-token";
    process.env.GITHUB_TOKEN = "mock-github-token";
    process.env.MAX_RETRIES_ON_FAILURE = "5";
    process.env.MAX_ALLOWED_COLOR_DIFFERENCE = "1E-02";
    process.env.MAX_ALLOWED_PROPORTION_OF_CHANGED_PIXELS = "1E-05";
  };
});