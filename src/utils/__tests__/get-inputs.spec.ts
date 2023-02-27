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

describe("getInputs", () => {
  const oldEnv: Record<string, any> = {};

  beforeEach(() => {
    keys.forEach((key) => {
      oldEnv[key] = process.env[key];
    });
  });

  afterEach(() => {
    keys.forEach((key) => {
      process.env[key] = oldEnv[key];
    });
  });

  it("parses the required values correctly", () => {
    process.env.API_TOKEN = "mock-api-token";
    process.env.GITHUB_TOKEN = "mock-github-token";
    process.env.MAX_RETRIES_ON_FAILURE = "5";
    process.env.MAX_ALLOWED_COLOR_DIFFERENCE = "0.01";
    process.env.MAX_ALLOWED_PROPORTION_OF_CHANGED_PIXELS = "0.00001";

    expect(getInputs()).toEqual({
      apiToken: "mock-api-token",
      githubToken: "mock-github-token",
      maxRetriesOnFailure: 5,
      maxAllowedColorDifference: 0.01,
      maxAllowedProportionOfChangedPixels: 0.00001,
      appUrl: null,
      localhostAliases: null,
      parallelTasks: null,
      testsFile: null,
    });
  });
});
