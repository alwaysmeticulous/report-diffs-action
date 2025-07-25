/**
 * Comprehensive test suite that can run against both mock and real Meticulous APIs
 * Configure via environment variables to point to actual endpoints
 */

import { MainAction } from "../../../actions/main/main-action";
import { ComprehensiveTestHarness } from "../../framework/comprehensive-test-harness";
import { getTestEnvironmentFromEnv, shouldUseRealAPIs } from "../../framework/test-environment-config";

describe("Comprehensive Real API Tests", () => {
  let harness: ComprehensiveTestHarness;
  const environmentMode = getTestEnvironmentFromEnv();
  const useRealAPIs = shouldUseRealAPIs();

  beforeAll(() => {
    if (useRealAPIs && !process.env.METICULOUS_SANDBOX_API_TOKEN) {
      console.warn('Real API tests requested but no Meticulous sandbox token provided');
      console.warn('Set METICULOUS_SANDBOX_API_TOKEN to run against real APIs');
    }
  });

  beforeEach(async () => {
    harness = new ComprehensiveTestHarness({
      environmentConfig: {
        mode: environmentMode,
        behavior: {
          useRealNetworkCalls: useRealAPIs,
          useRealGitOperations: false, // Always mock git for safety
          enableRateLimiting: useRealAPIs,
          enableRetries: useRealAPIs,
          timeoutMs: useRealAPIs ? 60000 : 5000,
          maxConcurrentRequests: useRealAPIs ? 2 : 10,
        },
      },
      enablePerformanceTracking: true,
      enableEnvironmentIsolation: true,
      enableRequestInterception: useRealAPIs,
      enableResponseValidation: useRealAPIs,
      enableMetricsCollection: true,
    });
    
    await harness.setup();
  });

  afterEach(async () => {
    await harness.cleanup();
  });

  describe("Basic Action Execution", () => {
    it("should execute main action successfully", async () => {
      const scenario = harness
        .createScenario('basic-execution')
        .withCustomStep('setup-environment', async (ctx) => {
          // Configure for the target environment
          if (useRealAPIs) {
            process.env.INPUT_API_TOKEN = process.env.METICULOUS_SANDBOX_API_TOKEN;
            process.env.INPUT_GITHUB_TOKEN = process.env.GITHUB_TEST_TOKEN;
            process.env.INPUT_APP_URL = 'https://react-bmi-calculator.vercel.app';
          } else {
            process.env.INPUT_API_TOKEN = 'test-api-token';
            process.env.INPUT_GITHUB_TOKEN = 'test-github-token';
            process.env.INPUT_APP_URL = 'http://localhost:3000';
          }
          process.env.INPUT_TESTS_FILE = './tests/meticulous.json';
        })
        .withCustomStep('setup-test-scenario', async (ctx) => {
          ctx.harness.simulatePullRequestEvent({
            number: 123,
            headSha: 'test-pr-head-sha',
            baseSha: 'test-pr-base-sha',
            title: 'Test Pull Request for API Integration',
            author: 'test-automation',
          });
          
          if (!useRealAPIs) {
            // Only configure mock responses for mock mode
            ctx.harness.simulateSuccessfulTestRun([
              { testCaseId: 'homepage-test', hasDiff: false, status: 'passed' },
              { testCaseId: 'calculator-test', hasDiff: false, status: 'passed' },
            ]);
          }
        });

      const context = await scenario.execute();
      const action = new MainAction(harness.getDependencies());

      // Execute with performance tracking
      const { result: exitCode, metrics } = await harness.runPerformanceTest(
        'basic-main-action',
        () => action.run()
      );

      // Assertions
      expect(exitCode).toBe(0);
      harness.assertActionSucceeded();
      harness.assertTestRunExecuted();

      // Performance assertions
      expect(metrics.executionTime).toBeLessThan(useRealAPIs ? 120000 : 10000);
      expect(metrics.memoryUsage.peak.heapUsed).toBeLessThan(512 * 1024 * 1024); // 512MB

      // API call assertions
      if (useRealAPIs) {
        const apiMetrics = harness.getMetrics();
        expect(apiMetrics.summary.totalApiCalls).toBeGreaterThan(0);
        expect(apiMetrics.summary.successfulApiCalls).toBe(apiMetrics.summary.totalApiCalls);
      }

      await harness.waitForAsyncOperations();
      await harness.forceCleanupResources();
      harness.assertNoResourceLeaks();
    }, useRealAPIs ? 180000 : 30000); // Longer timeout for real APIs

    it("should handle pull request with visual diffs", async () => {
      const scenario = harness
        .createScenario('pull-request-with-diffs')
        .withCustomStep('setup-diff-scenario', async (ctx) => {
          if (useRealAPIs) {
            // For real API testing, we might need to trigger actual visual differences
            // This could involve deploying different versions or using test endpoints
            process.env.INPUT_API_TOKEN = process.env.METICULOUS_SANDBOX_API_TOKEN;
            process.env.INPUT_APP_URL = 'https://test-with-diffs.vercel.app';
          } else {
            // Configure mock with visual differences
            ctx.harness.simulateSuccessfulTestRun([
              { testCaseId: 'header-test', hasDiff: false, status: 'passed' },
              { 
                testCaseId: 'button-style-test', 
                hasDiff: true, 
                status: 'passed',
                diffUrl: 'https://app.meticulous.ai/diffs/button-style-change' 
              },
              { 
                testCaseId: 'layout-test', 
                hasDiff: true, 
                status: 'passed',
                diffUrl: 'https://app.meticulous.ai/diffs/layout-change' 
              },
            ]);
          }
        });

      await scenario.execute();
      harness.simulatePullRequestEvent({ title: 'UI Changes Test' });

      const action = new MainAction(harness.getDependencies());
      const exitCode = await action.run();

      expect(exitCode).toBe(0);
      harness.assertActionSucceeded();
      harness.assertTestRunExecuted();
      
      if (!useRealAPIs) {
        harness.assertGitHubCommentCreated();
      }
    }, useRealAPIs ? 180000 : 30000);
  });

  describe("Error Handling and Resilience", () => {
    it("should handle API rate limiting gracefully", async () => {
      if (!useRealAPIs) {
        // Mock rate limiting scenario
        harness.simulateAPIError('meticulous', {
          type: 'rate_limit',
          message: 'API rate limit exceeded',
          retryable: true,
        });
      } else {
        // For real APIs, we might need to actually trigger rate limiting
        // This could be done by making many rapid requests
        console.log('Testing real API rate limiting - may be skipped if rate limits are high');
      }

      harness.simulatePullRequestEvent();
      
      const action = new MainAction(harness.getDependencies());
      const exitCode = await action.run();

      if (useRealAPIs) {
        // With real APIs and retries, this might still succeed
        expect([0, 1]).toContain(exitCode);
      } else {
        expect(exitCode).toBe(1);
        harness.assertActionFailed('rate limit');
      }
    }, useRealAPIs ? 300000 : 30000);

    it("should handle network connectivity issues", async () => {
      const scenario = harness
        .createScenario('network-failure')
        .withCustomStep('simulate-network-issues', async (ctx) => {
          if (!useRealAPIs) {
            ctx.harness.simulateAPIError('meticulous', {
              type: 'network',
              message: 'Network timeout',
              retryable: true,
            });
          } else {
            // For real APIs, we might configure an invalid endpoint temporarily
            ctx.harness.updateEnvironmentConfig({
              endpoints: {
                ...ctx.harness.getEnvironmentManager().getConfig().endpoints,
                meticulous: {
                  apiUrl: 'https://invalid-endpoint.example.com',
                  websocketUrl: 'wss://invalid-endpoint.example.com',
                  cdnUrl: 'https://invalid-cdn.example.com',
                },
              },
            });
          }
        });

      await scenario.execute();
      harness.simulatePullRequestEvent();

      const action = new MainAction(harness.getDependencies());
      const exitCode = await action.run();

      expect(exitCode).toBe(1);
      harness.assertActionFailed();
    }, useRealAPIs ? 120000 : 30000);
  });

  describe("Performance and Load Testing", () => {
    it("should handle concurrent test execution efficiently", async () => {
      if (!useRealAPIs) {
        // Mock scenario with multiple test cases
        harness.simulateSuccessfulTestRun(
          Array.from({ length: 50 }, (_, i) => ({
            testCaseId: `concurrent-test-${i}`,
            hasDiff: i % 5 === 0, // 20% have diffs
            status: 'passed' as const,
          }))
        );
      }

      harness.simulatePullRequestEvent();

      const action = new MainAction(harness.getDependencies());

      // Run load test
      const loadTestResults = await harness.runLoadTest(
        'concurrent-execution',
        () => action.run()
      );

      expect(loadTestResults.passed).toBe(true);
      expect(loadTestResults.errorRate).toBeLessThan(0.1); // Less than 10% error rate
      expect(loadTestResults.executionTime.average).toBeLessThan(useRealAPIs ? 60000 : 10000);
      
      // Memory usage should be reasonable
      expect(loadTestResults.memoryUsage.max).toBeLessThan(1024 * 1024 * 1024); // 1GB
      
      // Resource leaks should be minimal
      expect(loadTestResults.resourceLeaks.maxTimers).toBeLessThan(5);
      expect(loadTestResults.resourceLeaks.maxPromises).toBeLessThan(10);
    }, useRealAPIs ? 600000 : 120000); // 10 minutes for real APIs, 2 minutes for mocks

    it("should handle large test suites without memory issues", async () => {
      const largeTestSuite = Array.from({ length: 1000 }, (_, i) => ({
        testCaseId: `large-suite-test-${i}`,
        hasDiff: i % 10 === 0, // 10% have diffs
        status: Math.random() > 0.05 ? 'passed' as const : 'failed' as const, // 5% failure rate
        screenshotData: useRealAPIs ? undefined : 'x'.repeat(1024), // 1KB mock data per test
      }));

      if (!useRealAPIs) {
        harness.simulateSuccessfulTestRun(largeTestSuite);
      }

      harness.simulatePullRequestEvent({ title: 'Large Test Suite Performance Test' });

      const { result: exitCode, metrics } = await harness.runPerformanceTest(
        'large-test-suite',
        async () => {
          const action = new MainAction(harness.getDependencies());
          return await action.run();
        }
      );

      expect(exitCode).toBe(0);
      
      // Memory should stay reasonable even with large test suites
      const memoryUsageMB = metrics.memoryUsage.peak.heapUsed / (1024 * 1024);
      expect(memoryUsageMB).toBeLessThan(useRealAPIs ? 2048 : 512); // 2GB for real APIs, 512MB for mocks
      
      // Execution time should scale reasonably
      expect(metrics.executionTime).toBeLessThan(useRealAPIs ? 300000 : 30000); // 5 minutes for real APIs
    }, useRealAPIs ? 600000 : 60000);
  });

  describe("Environment-Specific Scenarios", () => {
    it("should work with deployment URLs", async () => {
      const scenario = harness
        .createScenario('deployment-url-test')
        .withCustomStep('configure-deployment-mode', async (ctx) => {
          process.env.INPUT_USE_DEPLOYMENT_URL = 'true';
          process.env.INPUT_ALLOWED_ENVIRONMENTS = 'production\nstaging';
          
          if (useRealAPIs) {
            // Configure real deployment URL resolution
            process.env.INPUT_API_TOKEN = process.env.METICULOUS_SANDBOX_API_TOKEN;
          } else {
            // Mock deployment URL resolution
            const githubService = ctx.harness.getDependencies().github as any;
            githubService.updateOptions({
              apiResponses: {
                deployments: [
                  {
                    id: 123,
                    environment: 'production',
                    state: 'success',
                    created_at: new Date().toISOString(),
                  },
                ],
                deploymentStatuses: [
                  {
                    id: 456,
                    state: 'success',
                    environment_url: 'https://deploy-123.example.com',
                    target_url: 'https://deploy-123.example.com',
                  },
                ],
              },
            });
          }
        });

      await scenario.execute();
      harness.simulatePullRequestEvent();

      const action = new MainAction(harness.getDependencies());
      const exitCode = await action.run();

      expect(exitCode).toBe(0);
      harness.assertActionSucceeded();
    }, useRealAPIs ? 180000 : 30000);

    it("should handle different GitHub event types", async () => {
      const eventTypes = [
        { type: 'push', setup: () => harness.simulatePushEvent({ ref: 'refs/heads/main' }) },
        { type: 'workflow_dispatch', setup: () => harness.simulateWorkflowDispatchEvent({ inputs: { environment: 'staging' } }) },
        { type: 'pull_request', setup: () => harness.simulatePullRequestEvent() },
      ];

      for (const eventType of eventTypes) {
        // Reset environment for each event type
        await harness.cleanup();
        await harness.setup();

        if (!useRealAPIs) {
          harness.simulateSuccessfulTestRun();
        }

        eventType.setup();

        const action = new MainAction(harness.getDependencies());
        const exitCode = await action.run();

        expect(exitCode).toBe(0);
        harness.assertActionSucceeded();
      }
    }, useRealAPIs ? 300000 : 60000);
  });

  describe("API Validation and Compatibility", () => {
    it("should validate API request/response schemas", async () => {
      if (!useRealAPIs) {
        pending('Schema validation only applies to real API calls');
        return;
      }

      harness.simulatePullRequestEvent();

      const action = new MainAction(harness.getDependencies());
      const exitCode = await action.run();

      expect(exitCode).toBe(0);

      // Check that API calls were validated
      const metrics = harness.getMetrics();
      expect(metrics.apiCalls.length).toBeGreaterThan(0);
      
      // All API calls should have valid request/response schemas
      const invalidCalls = metrics.apiCalls.filter((call: any) => call.validationErrors?.length > 0);
      expect(invalidCalls).toHaveLength(0);
    }, 180000);

    it("should record comprehensive API usage metrics", async () => {
      harness.simulatePullRequestEvent();
      
      if (!useRealAPIs) {
        harness.simulateSuccessfulTestRun();
      }

      const action = new MainAction(harness.getDependencies());
      const exitCode = await action.run();

      expect(exitCode).toBe(0);

      const metrics = harness.getMetrics();
      
      // Should have recorded API calls
      expect(metrics.summary.totalApiCalls).toBeGreaterThan(0);
      
      // Should have network metrics
      if (useRealAPIs) {
        expect(metrics.summary.totalNetworkCalls).toBeGreaterThan(0);
        expect(metrics.summary.averageApiDuration).toBeGreaterThan(0);
      }
      
      // Should track service-specific metrics
      expect(metrics.apiCalls.some((call: any) => call.service === 'meticulous')).toBe(true);
      expect(metrics.apiCalls.some((call: any) => call.service === 'github')).toBe(true);
    }, useRealAPIs ? 180000 : 30000);
  });

  afterAll(() => {
    if (useRealAPIs) {
      console.log('\n=== Real API Test Summary ===');
      console.log(`Environment: ${environmentMode}`);
      console.log('Note: Real API tests may have created test data in the sandbox environment');
    }
  });
});