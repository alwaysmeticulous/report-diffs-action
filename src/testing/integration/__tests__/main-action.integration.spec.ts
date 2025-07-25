import { MainAction } from "../../../actions/main/main-action";
import { TestHarness } from "../../test-harness";

describe("MainAction Integration Tests", () => {
  let harness: TestHarness;
  let action: MainAction;

  beforeEach(() => {
    harness = new TestHarness();
    action = new MainAction(harness.getDependencies());
    
    // Set required environment variables
    process.env.API_TOKEN = "test-api-token";
    process.env.GITHUB_TOKEN = "test-github-token";
    process.env.MAX_RETRIES_ON_FAILURE = "5";
    process.env.MAX_ALLOWED_COLOR_DIFFERENCE = "0.01";
    process.env.MAX_ALLOWED_PROPORTION_OF_CHANGED_PIXELS = "0.00001";
    process.env.USE_DEPLOYMENT_URL = "false";
  });

  afterEach(() => {
    harness.reset();
    // Clear environment variables
    delete process.env.API_TOKEN;
    delete process.env.GITHUB_TOKEN;
    delete process.env.APP_URL;
    delete process.env.TESTS_FILE;
  });

  describe("Pull Request Scenarios", () => {
    it("should successfully run tests for a pull request with no diffs", async () => {
      // Arrange
      process.env.APP_URL = "http://localhost:3000";
      process.env.TESTS_FILE = "./tests/react-bmi-calculator/meticulous.json";
      
      harness.setupDefaultPullRequestScenario();

      // Act
      const exitCode = await action.run();

      // Assert
      expect(exitCode).toBe(0);
      harness.assertActionSucceeded();
      harness.assertTestRunExecuted();
      
      const testRunCalls = harness.meticulous.getExecuteTestRunCalls();
      expect(testRunCalls[0]).toMatchObject({
        appUrl: "http://localhost:3000",
        testsFile: "./tests/react-bmi-calculator/meticulous.json",
        commitSha: "head-sha",
        baseCommitSha: "base-sha",
      });
    });

    it("should successfully run tests for a pull request with diffs", async () => {
      // Arrange
      process.env.APP_URL = "http://localhost:3000";
      process.env.TESTS_FILE = "./tests/react-bmi-calculator/meticulous.json";
      
      harness.setupDefaultPullRequestScenario();
      harness.simulateTestRunWithDiffs();

      // Act
      const exitCode = await action.run();

      // Assert
      expect(exitCode).toBe(0);
      harness.assertActionSucceeded();
      harness.assertTestRunExecuted();
      harness.assertGitHubCommentCreated();
    });

    it("should handle pull request without base test run", async () => {
      // Arrange
      process.env.APP_URL = "http://localhost:3000";
      process.env.TESTS_FILE = "./tests/react-bmi-calculator/meticulous.json";
      
      harness.simulatePullRequest();
      harness.setupDefaultTestsFile();
      
      // Simulate no base test run exists
      harness.meticulous.updateOptions({
        getLatestTestRunResults: {
          success: false,
          error: "No base test run found",
        },
        executeTestRun: {
          success: true,
          testRunId: "test-run-123",
          diffs: [],
        },
      });

      // Act
      const exitCode = await action.run();

      // Assert
      expect(exitCode).toBe(0);
      harness.assertActionSucceeded();
      
      const testRunCalls = harness.meticulous.getExecuteTestRunCalls();
      expect(testRunCalls[0]).toMatchObject({
        baseCommitSha: null, // No base to compare against
      });
    });
  });

  describe("Push Scenarios", () => {
    it("should successfully run tests for a push event", async () => {
      // Arrange
      process.env.APP_URL = "http://localhost:3000";
      process.env.TESTS_FILE = "./tests/react-bmi-calculator/meticulous.json";
      
      harness.simulatePush("push-sha-123");
      harness.simulateSuccessfulTestRun();
      harness.setupDefaultTestsFile();

      // Act
      const exitCode = await action.run();

      // Assert
      expect(exitCode).toBe(0);
      harness.assertActionSucceeded();
      harness.assertTestRunExecuted();
    });
  });

  describe("Deployment URL Scenarios", () => {
    it("should wait for deployment URL when use-deployment-url is true", async () => {
      // Arrange
      process.env.USE_DEPLOYMENT_URL = "true";
      process.env.TESTS_FILE = "./tests/react-bmi-calculator/meticulous.json";
      
      harness.setupDefaultPullRequestScenario();
      
      // Mock deployment URL
      const mockOctokit = harness.github.getOctokit("test-token");
      mockOctokit.rest.repos.listDeployments.mockResolvedValue({
        data: [{
          id: 123,
          environment: "staging",
          sha: "head-sha",
        }],
      });

      // Act
      const exitCode = await action.run();

      // Assert
      expect(exitCode).toBe(0);
      expect(mockOctokit.rest.repos.listDeployments).toHaveBeenCalled();
    });
  });

  describe("Error Scenarios", () => {
    it("should fail gracefully when Meticulous API returns an error", async () => {
      // Arrange
      process.env.APP_URL = "http://localhost:3000";
      process.env.TESTS_FILE = "./tests/react-bmi-calculator/meticulous.json";
      
      harness.setupDefaultPullRequestScenario();
      harness.simulateMeticulousApiError("API rate limit exceeded");

      // Act
      const exitCode = await action.run();

      // Assert
      expect(exitCode).toBe(1);
      harness.assertActionFailed("API rate limit exceeded");
    });

    it("should fail when GitHub token is invalid", async () => {
      // Arrange
      process.env.GITHUB_TOKEN = "";
      process.env.APP_URL = "http://localhost:3000";
      
      harness.setupDefaultPullRequestScenario();

      // Act
      const exitCode = await action.run();

      // Assert
      expect(exitCode).toBe(1);
      harness.assertActionFailed("github-token is required");
    });

    it("should fail when cannot connect to app URL", async () => {
      // Arrange
      process.env.APP_URL = "http://localhost:3000";
      process.env.TESTS_FILE = "./tests/react-bmi-calculator/meticulous.json";
      
      harness.setupDefaultPullRequestScenario();
      harness.network.setShouldFailConnection(true);

      // Act
      const exitCode = await action.run();

      // Assert
      expect(exitCode).toBe(1);
      harness.assertActionFailed("Cannot connect to");
    });

    it("should skip execution for unsupported event types", async () => {
      // Arrange
      process.env.APP_URL = "http://localhost:3000";
      
      harness.github.updateContext({
        eventName: "issues",
        payload: {},
      });

      // Act
      const exitCode = await action.run();

      // Assert
      expect(exitCode).toBe(0);
      harness.assertNoTestRunExecuted();
    });
  });

  describe("Configuration Scenarios", () => {
    it("should use custom retry and threshold settings", async () => {
      // Arrange
      process.env.APP_URL = "http://localhost:3000";
      process.env.TESTS_FILE = "./tests/react-bmi-calculator/meticulous.json";
      process.env.MAX_RETRIES_ON_FAILURE = "10";
      process.env.MAX_ALLOWED_COLOR_DIFFERENCE = "0.05";
      process.env.MAX_ALLOWED_PROPORTION_OF_CHANGED_PIXELS = "0.001";
      
      harness.setupDefaultPullRequestScenario();

      // Act
      const exitCode = await action.run();

      // Assert
      expect(exitCode).toBe(0);
      
      const testRunCalls = harness.meticulous.getExecuteTestRunCalls();
      expect(testRunCalls[0]).toMatchObject({
        maxRetriesOnFailure: 10,
        screenshottingOptions: {
          diffOptions: {
            diffPixelThreshold: 0.05,
            diffThreshold: 0.001,
          },
        },
      });
    });

    it("should handle localhost aliases", async () => {
      // Arrange
      process.env.APP_URL = "http://localhost:3000";
      process.env.TESTS_FILE = "./tests/react-bmi-calculator/meticulous.json";
      process.env.LOCALHOST_ALIASES = "app.local,test.local";
      
      harness.setupDefaultPullRequestScenario();

      // Act
      const exitCode = await action.run();

      // Assert
      expect(exitCode).toBe(0);
      harness.assertTestRunExecuted();
    });
  });
});