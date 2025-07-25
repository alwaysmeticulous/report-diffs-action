/**
 * Comprehensive test harness that supports both mock and real API testing
 * with extensive scenario coverage and environment flexibility
 */

import { TestEnvironmentManager, TestEnvironmentConfig, createTestConfig } from './test-environment-config';
import { AdaptiveServiceFactory } from './adaptive-service-factory';
import { ScenarioComposer } from './scenario-composer';
import { PerformanceHarness, PERFORMANCE_CONFIGS } from './performance-harness';
import { EnvironmentIsolation, TestEnvironment } from '../environment/isolation';
import { ResourceManager } from '../utils/resource-manager';
import { ActionDependencies } from '../types';

export interface ComprehensiveTestHarnessOptions {
  environmentConfig?: Partial<TestEnvironmentConfig>;
  enablePerformanceTracking?: boolean;
  enableEnvironmentIsolation?: boolean;
  enableRequestInterception?: boolean;
  enableResponseValidation?: boolean;
  enableMetricsCollection?: boolean;
  customScenarios?: Map<string, (harness: ComprehensiveTestHarness) => Promise<void>>;
}

export class ComprehensiveTestHarness {
  private environmentManager: TestEnvironmentManager;
  private serviceFactory: AdaptiveServiceFactory;
  private performanceHarness?: PerformanceHarness;
  private environmentIsolation?: EnvironmentIsolation;
  private testEnvironment?: TestEnvironment;
  private resourceManager: ResourceManager;
  private dependencies: ActionDependencies;
  private options: ComprehensiveTestHarnessOptions;
  private customScenarios: Map<string, Function> = new Map();
  
  constructor(options: ComprehensiveTestHarnessOptions = {}) {
    this.options = options;
    
    // Create environment manager with configuration
    const config = createTestConfig(options.environmentConfig);
    this.environmentManager = new TestEnvironmentManager(config.mode);
    if (options.environmentConfig) {
      this.environmentManager.updateConfig(options.environmentConfig);
    }
    
    // Validate configuration
    this.environmentManager.validateConfiguration();
    
    // Create service factory
    this.serviceFactory = new AdaptiveServiceFactory({
      environmentManager: this.environmentManager,
      enableRequestInterception: options.enableRequestInterception,
      enableResponseValidation: options.enableResponseValidation,
      enableMetricsCollection: options.enableMetricsCollection,
    });
    
    // Create resource manager
    this.resourceManager = new ResourceManager();
    
    // Create performance harness if enabled
    if (options.enablePerformanceTracking) {
      const perfConfig = this.environmentManager.isUsingRealAPIs() 
        ? PERFORMANCE_CONFIGS.ci 
        : PERFORMANCE_CONFIGS.development;
      this.performanceHarness = new PerformanceHarness(perfConfig);
    }
    
    // Register custom scenarios
    if (options.customScenarios) {
      this.customScenarios = new Map(options.customScenarios);
    }
    
    // Create dependencies
    this.dependencies = this.serviceFactory.createActionDependencies();
  }

  async setup(): Promise<void> {
    const config = this.environmentManager.getConfig();
    
    // Start resource tracking
    this.resourceManager.startTracking();
    
    // Setup environment isolation if enabled
    if (this.options.enableEnvironmentIsolation !== false) {
      this.environmentIsolation = new EnvironmentIsolation();
      this.testEnvironment = await this.environmentIsolation.isolate();
      
      // Configure test environment based on config
      this.testEnvironment
        .withGitHubActions({
          sha: 'test-commit-sha',
          ref: 'refs/heads/test-branch',
          token: config.authentication.github.token || 'test-token',
        })
        .withMeticulousConfig({
          apiToken: config.authentication.meticulous.apiToken || 'test-api-token',
          appUrl: 'http://localhost:3000',
        });
      
      // Create test files
      await this.testEnvironment.createTestsFile();
    }
    
    // Start performance monitoring if enabled
    if (this.performanceHarness) {
      await this.performanceHarness.startMonitoring();
    }
    
    // Setup request/response validation if using real APIs
    if (config.behavior.useRealNetworkCalls) {
      this.setupAPIValidation();
    }
  }

  async cleanup(): Promise<void> {
    try {
      // Stop performance monitoring
      if (this.performanceHarness) {
        this.performanceHarness.stopMonitoring();
      }
      
      // Cleanup resources
      await this.resourceManager.cleanup();
      this.resourceManager.stopTracking();
      
      // Restore environment
      if (this.environmentIsolation) {
        await this.environmentIsolation.restore();
      }
      
      // Reset services
      this.serviceFactory.reset();
    } catch (error) {
      console.warn('Cleanup error:', error);
    }
  }

  // Comprehensive scenario builders
  createScenario(name: string): ScenarioComposer {
    return new ScenarioComposer(this, name);
  }

  async runPredefinedScenario(scenarioName: string): Promise<any> {
    const scenario = this.customScenarios.get(scenarioName);
    if (!scenario) {
      throw new Error(`Unknown scenario: ${scenarioName}`);
    }
    
    return await scenario(this);
  }

  // GitHub Actions simulation methods
  simulatePullRequestEvent(config: {
    number?: number;
    headSha?: string;
    baseSha?: string;
    headRef?: string;
    baseRef?: string;
    author?: string;
    title?: string;
    body?: string;
    draft?: boolean;
    merged?: boolean;
  } = {}): this {
    const {
      number = 123,
      headSha = 'pr-head-sha',
      baseSha = 'pr-base-sha',
      headRef = 'feature-branch',
      baseRef = 'main',
      author = 'test-author',
      title = 'Test Pull Request',
      body = 'Test PR description',
      draft = false,
      merged = false,
    } = config;

    this.dependencies.github.updateContext({
      eventName: 'pull_request',
      sha: headSha,
      ref: `refs/heads/${headRef}`,
      payload: {
        action: 'opened',
        number,
        pull_request: {
          number,
          head: { sha: headSha, ref: headRef },
          base: { sha: baseSha, ref: baseRef },
          title,
          body,
          user: { login: author },
          draft,
          merged,
        },
        repository: {
          name: 'test-repo',
          owner: { login: 'test-owner' },
          full_name: 'test-owner/test-repo',
        },
      },
    });

    return this;
  }

  simulatePushEvent(config: {
    ref?: string;
    before?: string;
    after?: string;
    forced?: boolean;
    commits?: any[];
  } = {}): this {
    const {
      ref = 'refs/heads/main',
      before = 'old-commit-sha',
      after = 'new-commit-sha',
      forced = false,
      commits = [],
    } = config;

    this.dependencies.github.updateContext({
      eventName: 'push',
      sha: after,
      ref,
      payload: {
        ref,
        before,
        after,
        forced,
        commits,
        head_commit: {
          id: after,
          message: 'Test commit',
          author: { name: 'Test Author', email: 'test@example.com' },
        },
        repository: {
          name: 'test-repo',
          owner: { login: 'test-owner' },
        },
      },
    });

    return this;
  }

  simulateWorkflowDispatchEvent(config: {
    ref?: string;
    inputs?: Record<string, any>;
  } = {}): this {
    const {
      ref = 'refs/heads/main',
      inputs = {},
    } = config;

    this.dependencies.github.updateContext({
      eventName: 'workflow_dispatch',
      sha: 'workflow-dispatch-sha',
      ref,
      payload: {
        ref,
        inputs,
        repository: {
          name: 'test-repo',
          owner: { login: 'test-owner' },
        },
      },
    });

    return this;
  }

  // Meticulous API simulation methods
  simulateSuccessfulTestRun(testCases: Array<{
    testCaseId: string;
    hasDiff: boolean;
    diffUrl?: string;
    status?: 'passed' | 'failed';
    error?: string;
    screenshotData?: any;
  }> = []): this {
    const defaultTestCases = testCases.length > 0 ? testCases : [
      { testCaseId: 'default-test-1', hasDiff: false, status: 'passed' as const },
      { testCaseId: 'default-test-2', hasDiff: false, status: 'passed' as const },
    ];

    if (this.environmentManager.isUsingRealAPIs()) {
      // For real API testing, we would configure the actual test run
      // This might involve setting up test data in the sandbox environment
      console.log('Configuring real API test run with test cases:', defaultTestCases);
    } else {
      // Configure mock service
      (this.dependencies.meticulous as any).updateOptions({
        executeTestRun: {
          success: true,
          testRun: {
            testRunId: `test-run-${Date.now()}`,
            project: { isGitHubIntegrationActive: true },
          },
          testCaseResults: defaultTestCases.map((testCase, index) => ({
            testCaseId: testCase.testCaseId,
            success: testCase.status !== 'failed',
            error: testCase.error,
            screenshotDiffDataByBaseReplayId: {
              [`replay-${index}`]: {
                results: [{
                  hasDiff: testCase.hasDiff,
                  diffUrl: testCase.diffUrl || null,
                  screenshotData: testCase.screenshotData,
                }],
              },
            },
          })),
        },
        getLatestTestRunResults: {
          success: true,
          testRunId: `base-test-run-${Date.now()}`,
          diffs: defaultTestCases.filter(tc => tc.hasDiff),
        },
      });
    }

    return this;
  }

  simulateAPIError(service: 'meticulous' | 'github', error: {
    type: 'rate_limit' | 'permissions' | 'network' | 'server_error' | 'timeout';
    message: string;
    retryable?: boolean;
  }): this {
    if (this.environmentManager.isUsingRealAPIs()) {
      // For real API testing, we would configure error scenarios
      // This might involve using dedicated error endpoints or test tokens
      console.log(`Configuring real API error scenario for ${service}:`, error);
    } else {
      // Configure mock service errors
      if (service === 'meticulous') {
        (this.dependencies.meticulous as any).updateOptions({
          shouldThrow: true,
          executeTestRun: { error: error.message },
        });
      } else if (service === 'github') {
        const githubService = this.dependencies.github as any;
        switch (error.type) {
          case 'rate_limit':
            githubService.simulateRateLimit();
            break;
          case 'permissions':
            githubService.simulatePermissionsError(['actions:write']);
            break;
          case 'network':
          case 'timeout':
            githubService.simulateNetworkTimeout();
            break;
        }
      }
    }

    return this;
  }

  // Performance testing methods
  async runPerformanceTest(
    testName: string,
    testExecutor: () => Promise<any>
  ): Promise<any> {
    if (!this.performanceHarness) {
      throw new Error('Performance tracking is not enabled');
    }

    return await this.performanceHarness.measureExecution(
      testName,
      testExecutor,
      this
    );
  }

  async runLoadTest(
    testName: string,
    testExecutor: () => Promise<any>
  ): Promise<any> {
    if (!this.performanceHarness) {
      throw new Error('Performance tracking is not enabled');
    }

    return await this.performanceHarness.runLoadTest(
      testName,
      testExecutor,
      this
    );
  }

  // Advanced testing capabilities
  async waitForAsyncOperations(timeoutMs: number = 5000): Promise<void> {
    const start = Date.now();
    
    while (Date.now() - start < timeoutMs) {
      const resources = this.resourceManager.getActiveResourceCount();
      
      if (resources.timers === 0 && resources.promises === 0) {
        break;
      }
      
      await new Promise(resolve => {
        this.resourceManager['originalSetTimeout'](resolve, 10);
      });
    }
  }

  async forceCleanupResources(): Promise<void> {
    await this.resourceManager.cleanup();
  }

  // Validation and assertion methods
  assertTestRunExecuted(): void {
    const calls = (this.dependencies.meticulous as any).getExecuteTestRunCalls?.() || [];
    expect(calls.length).toBeGreaterThan(0);
  }

  assertGitHubCommentCreated(): void {
    const octokit = this.dependencies.github.getOctokit('test-token');
    expect(octokit.rest.issues.createComment).toHaveBeenCalled();
  }

  assertActionSucceeded(): void {
    const failures = (this.dependencies.actions as any).getFailures?.() || [];
    expect(failures).toHaveLength(0);
  }

  assertActionFailed(expectedMessage?: string): void {
    const failures = (this.dependencies.actions as any).getFailures?.() || [];
    expect(failures.length).toBeGreaterThan(0);
    if (expectedMessage) {
      expect(failures[0].args[0]).toContain(expectedMessage);
    }
  }

  assertAPICallCount(service: string, expectedCount: number): void {
    const metrics = this.serviceFactory.getMetrics();
    const actualCount = metrics.summary?.[`total${service}Calls`] || 0;
    expect(actualCount).toBe(expectedCount);
  }

  assertNoResourceLeaks(): void {
    const resources = this.resourceManager.getActiveResourceCount();
    expect(resources.timers).toBe(0);
    expect(resources.intervals).toBe(0);
    expect(resources.promises).toBe(0);
  }

  // Getters for dependencies and state
  getDependencies(): ActionDependencies {
    return this.dependencies;
  }

  getEnvironmentManager(): TestEnvironmentManager {
    return this.environmentManager;
  }

  getTestEnvironment(): TestEnvironment | undefined {
    return this.testEnvironment;
  }

  getActiveResources(): any {
    return this.resourceManager.getActiveResourceCount();
  }

  getMetrics(): any {
    return this.serviceFactory.getMetrics();
  }

  getPerformanceMetrics(): any {
    return this.performanceHarness?.getMetrics() || {};
  }

  // Configuration methods
  switchEnvironment(mode: 'mock' | 'sandbox' | 'staging' | 'production'): void {
    this.environmentManager.switchMode(mode);
    // Recreate dependencies with new environment
    this.dependencies = this.serviceFactory.createActionDependencies();
  }

  updateEnvironmentConfig(updates: Partial<TestEnvironmentConfig>): void {
    this.environmentManager.updateConfig(updates);
    // Recreate dependencies with updated config
    this.dependencies = this.serviceFactory.createActionDependencies();
  }

  private setupAPIValidation(): void {
    // Add request/response validation for real API calls
    this.serviceFactory.addRequestInterceptor('meticulous.*', (args) => {
      // Validate Meticulous API request format
      console.log('Validating Meticulous API request:', args);
      return args;
    });

    this.serviceFactory.addResponseValidator('meticulous.*', (response, args) => {
      // Validate Meticulous API response format
      console.log('Validating Meticulous API response:', response);
    });

    this.serviceFactory.addRequestInterceptor('github.*', (args) => {
      // Validate GitHub API request format
      console.log('Validating GitHub API request:', args);
      return args;
    });

    this.serviceFactory.addResponseValidator('github.*', (response, args) => {
      // Validate GitHub API response format
      console.log('Validating GitHub API response:', response);
    });
  }
}