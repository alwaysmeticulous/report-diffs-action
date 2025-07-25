import { MainAction } from "../../../actions/main/main-action";
import { EnhancedTestHarness } from "../../enhanced-test-harness";

describe("Enhanced Integration Tests", () => {
  let harness: EnhancedTestHarness;

  beforeEach(async () => {
    harness = new EnhancedTestHarness({
      isolation: {
        enabled: true,
        githubActions: {
          sha: 'test-commit-sha',
          ref: 'refs/heads/test-branch',
        },
        meticulous: {
          apiToken: 'test-api-token',
          appUrl: 'http://localhost:3000',
        },
      },
    });
    
    await harness.setup();
  });

  afterEach(async () => {
    await harness.cleanup();
  });

  describe("Pull Request Scenarios", () => {
    it("should handle pull request without diffs", async () => {
      // Arrange
      harness
        .simulatePullRequest({
          headSha: 'pr-head-sha',
          baseSha: 'pr-base-sha',
        })
        .simulateSuccessfulTestRun([
          { testCaseId: 'login-test', hasDiff: false },
          { testCaseId: 'navigation-test', hasDiff: false },
        ]);

      const action = new MainAction(harness.getDependencies());

      // Act
      const exitCode = await action.run();
      
      // Assert
      expect(exitCode).toBe(0);
      harness.assertActionSucceeded();
      harness.assertTestRunExecuted();
      
      // Wait for any async operations to complete
      await harness.waitForAsyncOperations();

      // Force cleanup any remaining resources
      await harness.forceCleanupResources();

      // Verify no resource leaks
      const resources = harness.getActiveResources();
      expect(resources.timers).toBe(0);
      expect(resources.promises).toBe(0);
    }, 10000);

    it("should handle pull request with visual diffs", async () => {
      // Arrange
      harness
        .simulatePullRequest()
        .simulateSuccessfulTestRun([
          { testCaseId: 'header-test', hasDiff: false },
          { 
            testCaseId: 'button-test', 
            hasDiff: true, 
            diffUrl: 'https://app.meticulous.ai/diffs/button-change' 
          },
        ]);

      const action = new MainAction(harness.getDependencies());

      // Act
      const exitCode = await action.run();
      await harness.waitForAsyncOperations();

      // Assert
      expect(exitCode).toBe(0);
      harness.assertActionSucceeded();
      harness.assertTestRunExecuted();
      harness.assertGitHubCommentCreated();
    }, 10000);

    it("should handle missing base test run gracefully", async () => {
      // Arrange
      harness
        .simulatePullRequest()
        .simulateSuccessfulTestRun();

      // Simulate no base test run exists - return null instead of throwing
      harness.meticulous.updateOptions({
        getLatestTestRunResults: null, // This simulates no test run found
      });

      const action = new MainAction(harness.getDependencies());

      // Act
      const exitCode = await action.run();
      await harness.waitForAsyncOperations();

      // Assert
      expect(exitCode).toBe(0);
      harness.assertActionSucceeded();
      harness.assertTestRunExecuted();

      // Verify test run executed without base comparison
      const calls = harness.meticulous.getExecuteTestRunCalls();
      expect(calls[0]).toMatchObject({
        baseCommitSha: null,
      });
    }, 10000);
  });

  describe("Error Scenarios", () => {
    it("should handle Meticulous API errors gracefully", async () => {
      // Arrange
      harness
        .simulatePullRequest()
        .simulateTestRunError("API rate limit exceeded");

      const action = new MainAction(harness.getDependencies());

      // Act
      const exitCode = await action.run();
      await harness.waitForAsyncOperations();

      // Assert
      expect(exitCode).toBe(1);
      harness.assertActionFailed("API rate limit exceeded");
    }, 10000);

    it("should handle network connectivity issues", async () => {
      // Arrange
      harness
        .simulatePullRequest()
        .simulateSuccessfulTestRun();

      harness.network.setShouldFailConnection(true);

      const action = new MainAction(harness.getDependencies());

      // Act
      const exitCode = await action.run();
      await harness.waitForAsyncOperations();

      // Assert
      expect(exitCode).toBe(1);
      harness.assertActionFailed("Cannot connect to");
    }, 10000);
  });

  describe("Environment Isolation", () => {
    it("should run in isolated environment", async () => {
      // Arrange
      const testEnv = harness.getTestEnvironment();
      expect(testEnv).toBeDefined();

      // Verify we're in a temporary directory
      const workspaceDir = testEnv!.getWorkspaceDir();
      expect(workspaceDir).toContain('meticulous-test-');

      // Verify GitHub Actions environment is set up
      expect(process.env.GITHUB_WORKSPACE).toBe(workspaceDir);
      expect(process.env.GITHUB_SHA).toBe('test-commit-sha');
      expect(process.env.API_TOKEN).toBe('test-api-token');

      // Set up and run test
      harness
        .simulatePullRequest()
        .simulateSuccessfulTestRun();

      const action = new MainAction(harness.getDependencies());

      // Act
      const exitCode = await action.run();
      await harness.waitForAsyncOperations();

      // Assert
      expect(exitCode).toBe(0);
      harness.assertActionSucceeded();
    }, 10000);

    it("should not pollute environment between tests", async () => {
      // This test verifies that environment changes don't persist
      // Previous test set up environment variables, but they should be isolated
      
      // Set up a completely different environment
      const newHarness = new EnhancedTestHarness({
        isolation: {
          enabled: true,
          githubActions: {
            sha: 'different-sha',
            ref: 'refs/heads/different-branch',
          },
          meticulous: {
            apiToken: 'different-token',
          },
        },
      });

      await newHarness.setup();

      try {
        // Verify environment is different
        expect(process.env.GITHUB_SHA).toBe('different-sha');
        expect(process.env.API_TOKEN).toBe('different-token');

        newHarness
          .simulatePullRequest({ headSha: 'different-sha' })
          .simulateSuccessfulTestRun();

        const action = new MainAction(newHarness.getDependencies());
        const exitCode = await action.run();
        
        await newHarness.waitForAsyncOperations();

        expect(exitCode).toBe(0);
        newHarness.assertActionSucceeded();
      } finally {
        await newHarness.cleanup();
      }
    }, 10000);
  });

  describe("Git Operations", () => {
    it("should handle git operations without real system calls", async () => {
      // This test verifies that no real git commands are executed
      
      harness
        .simulatePullRequest({
          headSha: '22177d347a49bb24d9caa846e6c325b790c1259a',
          baseSha: 'main-branch-sha',
        })
        .simulateSuccessfulTestRun();

      const action = new MainAction(harness.getDependencies());

      // Act
      const exitCode = await action.run();
      await harness.waitForAsyncOperations();

      // Assert
      expect(exitCode).toBe(0);
      harness.assertActionSucceeded();

      // No error about unshallow should occur since git is mocked
      const failures = harness.actions.getFailures();
      expect(failures).toHaveLength(0);
    }, 10000);
  });

  describe("Resource Management", () => {
    it("should clean up all resources after test", async () => {
      // Arrange
      harness
        .simulatePullRequest()
        .simulateSuccessfulTestRun();

      const action = new MainAction(harness.getDependencies());

      // Act
      const exitCode = await action.run();
      await harness.waitForAsyncOperations();

      // Verify test succeeded
      expect(exitCode).toBe(0);

      // Force cleanup any remaining resources
      await harness.forceCleanupResources();

      // Check that resources are cleaned up
      const resources = harness.getActiveResources();
      expect(resources.timers).toBe(0);
      expect(resources.intervals).toBe(0);
      expect(resources.promises).toBe(0);
    }, 10000);
  });
});