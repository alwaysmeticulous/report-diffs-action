import { MainAction } from "../../../actions/main/main-action";
import { 
  createAssertions, 
  scenarios, 
  EnvironmentManager, 
  createDefaultActionEnvironment 
} from "../../utils";

describe("MainAction Integration Tests (Improved)", () => {
  const envManager = new EnvironmentManager();
  let envSnapshot: any;

  beforeEach(() => {
    envSnapshot = envManager.snapshot();
    envManager.setTestEnvironment(createDefaultActionEnvironment());
  });

  afterEach(() => {
    envManager.restore(envSnapshot);
  });

  describe("Happy Path Scenarios", () => {
    it("should handle pull request with no visual diffs", async () => {
      // Arrange
      const harness = scenarios.pullRequestWithNoDiffs().build();
      const action = new MainAction(harness.getDependencies());
      const assert = createAssertions(harness);

      // Act
      const exitCode = await action.run();

      // Assert
      expect(exitCode).toBe(0);
      assert.action.succeeded();
      assert.testRun.wasExecuted();
      assert.testRun.hadAppUrl("http://localhost:3000");
      assert.testRun.hadCommitSha("head-sha");
      assert.testRun.hadBaseCommitSha("base-sha");
      assert.sentry.initialized();
    });

    it("should handle pull request with visual diffs and create GitHub comment", async () => {
      // Arrange
      const harness = scenarios.pullRequestWithDiffs().build();
      const action = new MainAction(harness.getDependencies());
      const assert = createAssertions(harness);

      // Act
      const exitCode = await action.run();

      // Assert
      expect(exitCode).toBe(0);
      assert.action.succeeded();
      assert.testRun.wasExecuted();
      assert.github.commentCreated();
    });

    it("should handle push to main branch", async () => {
      // Arrange
      const harness = scenarios.pushToMain().build();
      const action = new MainAction(harness.getDependencies());
      const assert = createAssertions(harness);

      // Act
      const exitCode = await action.run();

      // Assert
      expect(exitCode).toBe(0);
      assert.action.succeeded();
      assert.testRun.wasExecuted();
    });

    it("should handle deployment URL scenario", async () => {
      // Arrange
      const harness = scenarios.deploymentUrlScenario().build();
      const action = new MainAction(harness.getDependencies());
      const assert = createAssertions(harness);

      // Act
      const exitCode = await action.run();

      // Assert
      expect(exitCode).toBe(0);
      assert.action.succeeded();
      assert.testRun.wasExecuted();
    });
  });

  describe("Error Scenarios", () => {
    it("should handle Meticulous API errors gracefully", async () => {
      // Arrange
      const harness = scenarios.meticulousApiError().build();
      const action = new MainAction(harness.getDependencies());
      const assert = createAssertions(harness);

      // Act
      const exitCode = await action.run();

      // Assert
      expect(exitCode).toBe(1);
      assert.action.failed("API rate limit exceeded");
      assert.sentry.exceptionCaptured();
    });

    it("should handle network connectivity issues", async () => {
      // Arrange
      const harness = scenarios.pullRequestWithNoDiffs()
        .withNetworkError()
        .build();
      const action = new MainAction(harness.getDependencies());
      const assert = createAssertions(harness);

      // Act
      const exitCode = await action.run();

      // Assert
      expect(exitCode).toBe(1);
      assert.action.failed("Cannot connect to");
    });

    it("should handle GitHub API errors", async () => {
      // Arrange
      const harness = scenarios.pullRequestWithDiffs()
        .withGitHubApiError()
        .build();
      const action = new MainAction(harness.getDependencies());
      const assert = createAssertions(harness);

      // Act
      const exitCode = await action.run();

      // Assert
      expect(exitCode).toBe(1);
      assert.action.failed();
    });
  });

  describe("Configuration Scenarios", () => {
    it("should respect custom retry and threshold settings", async () => {
      // Arrange
      const harness = scenarios.pullRequestWithNoDiffs()
        .withCustomConfig({
          MAX_RETRIES_ON_FAILURE: "10",
          MAX_ALLOWED_COLOR_DIFFERENCE: "0.05",
          MAX_ALLOWED_PROPORTION_OF_CHANGED_PIXELS: "0.001",
        })
        .build();
      const action = new MainAction(harness.getDependencies());
      const assert = createAssertions(harness);

      // Act
      const exitCode = await action.run();

      // Assert
      expect(exitCode).toBe(0);
      assert.testRun.hadConfiguration({
        maxRetriesOnFailure: 10,
        screenshottingOptions: {
          diffOptions: {
            diffPixelThreshold: 0.05,
            diffThreshold: 0.001,
          },
        },
      });
    });

    it("should handle test suite ID for multiple action runs", async () => {
      // Arrange
      const harness = scenarios.pullRequestWithNoDiffs()
        .withCustomConfig({
          TEST_SUITE_ID: "mobile-tests",
        })
        .build();
      const action = new MainAction(harness.getDependencies());
      const assert = createAssertions(harness);

      // Act
      const exitCode = await action.run();

      // Assert
      expect(exitCode).toBe(0);
      assert.action.succeeded();
    });
  });

  describe("Edge Cases", () => {
    it("should skip execution for unsupported events", async () => {
      // Arrange
      const harness = scenarios.pullRequestWithNoDiffs().build();
      harness.github.updateContext({
        eventName: "issues",
        payload: {},
      });
      const action = new MainAction(harness.getDependencies());
      const assert = createAssertions(harness);

      // Act
      const exitCode = await action.run();

      // Assert
      expect(exitCode).toBe(0);
      assert.testRun.wasNotExecuted();
    });

    it("should handle missing base test run", async () => {
      // Arrange
      const harness = scenarios.pullRequestWithNoDiffs()
        .withNoBaseTestRun()
        .build();
      const action = new MainAction(harness.getDependencies());
      const assert = createAssertions(harness);

      // Act
      const exitCode = await action.run();

      // Assert
      expect(exitCode).toBe(0);
      assert.testRun.hadBaseCommitSha(null);
    });
  });
});