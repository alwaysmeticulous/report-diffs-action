import { ActionDependencies } from "./types";
import {
  MockGitHubService,
  MockGitHubContext,
  MockOctokitOptions,
  MockMeticulousService,
  MockClientOptions,
  MockActionsService,
  MockSentryService,
  MockFileSystemService,
  MockNetworkService,
} from "./mocks";
import { EnvironmentIsolation, TestEnvironment } from "./environment/isolation";
import { ResourceManager } from "./utils/resource-manager";
import { setGitResponse } from "./mocks/git.mock";
import { initLogger } from "../common/logger.utils";

export interface EnhancedTestHarnessOptions {
  github?: {
    context?: MockGitHubContext;
    octokit?: MockOctokitOptions;
  };
  meticulous?: MockClientOptions;
  filesystem?: {
    files?: Record<string, string>;
  };
  network?: {
    shouldFailConnection?: boolean;
  };
  isolation?: {
    enabled?: boolean;
    githubActions?: any;
    meticulous?: any;
  };
}

export class EnhancedTestHarness {
  public readonly github: MockGitHubService;
  public readonly meticulous: MockMeticulousService;
  public readonly fileSystem: MockFileSystemService;
  public readonly network: MockNetworkService;
  public readonly actions: MockActionsService;
  public readonly sentry: MockSentryService;
  public readonly logger = initLogger();

  private environmentIsolation?: EnvironmentIsolation;
  private testEnvironment?: TestEnvironment;
  private resourceManager = new ResourceManager();
  private isSetup = false;

  constructor(private options: EnhancedTestHarnessOptions = {}) {
    this.github = new MockGitHubService(
      options.github?.context,
      options.github?.octokit
    );
    this.meticulous = new MockMeticulousService(options.meticulous);
    this.fileSystem = new MockFileSystemService();
    this.network = new MockNetworkService();
    this.actions = new MockActionsService();
    this.sentry = new MockSentryService();

    // Setup filesystem
    if (options.filesystem?.files) {
      Object.entries(options.filesystem.files).forEach(([path, content]) => {
        this.fileSystem.setFile(path, content);
      });
    }

    // Setup network
    if (options.network?.shouldFailConnection) {
      this.network.setShouldFailConnection(true);
    }
  }

  async setup(): Promise<void> {
    if (this.isSetup) return;

    // Start resource tracking
    this.resourceManager.startTracking();

    // Setup environment isolation if enabled
    if (this.options.isolation?.enabled !== false) {
      this.environmentIsolation = new EnvironmentIsolation();
      this.testEnvironment = await this.environmentIsolation.isolate();

      // Apply environment configuration
      if (this.options.isolation?.githubActions) {
        this.testEnvironment.withGitHubActions(this.options.isolation.githubActions);
      } else {
        // Default GitHub Actions environment
        this.testEnvironment.withGitHubActions();
      }

      if (this.options.isolation?.meticulous) {
        this.testEnvironment.withMeticulousConfig(this.options.isolation.meticulous);
      } else {
        // Default Meticulous configuration
        this.testEnvironment.withMeticulousConfig();
      }

      // Create default test files
      await this.testEnvironment.createTestsFile();
    }

    // Setup default git responses
    this.setupDefaultGitResponses();

    this.isSetup = true;
  }

  async cleanup(): Promise<void> {
    if (!this.isSetup) return;

    try {
      // Cleanup resources first
      await this.resourceManager.cleanup();
      this.resourceManager.stopTracking();

      // Restore environment
      if (this.environmentIsolation) {
        await this.environmentIsolation.restore();
      }

      // Reset all mocks
      this.reset();
    } finally {
      this.isSetup = false;
    }
  }

  getDependencies(): ActionDependencies {
    return {
      github: this.github,
      meticulous: this.meticulous,
      fileSystem: this.fileSystem,
      network: this.network,
      actions: this.actions,
      sentry: this.sentry,
      logger: this.logger,
    };
  }

  // Enhanced scenario setup methods
  simulatePullRequest(options: {
    number?: number;
    headSha?: string;
    baseSha?: string;
    headRef?: string;
    baseRef?: string;
  } = {}): this {
    const {
      number = 123,
      headSha = "head-sha",
      baseSha = "base-sha",
      headRef = "feature-branch",
      baseRef = "main",
    } = options;

    this.github.updateContext({
      eventName: "pull_request",
      sha: headSha,
      ref: `refs/heads/${headRef}`,
      payload: {
        pull_request: {
          number,
          head: { sha: headSha, ref: headRef },
          base: { sha: baseSha, ref: baseRef },
        },
        repository: {
          name: "test-repo",
          owner: { login: "test-owner" },
        },
      },
    });

    // Setup corresponding git responses
    setGitResponse(`git merge-base ${baseSha} ${headSha}`, {
      stdout: `${baseSha}\n`,
      code: 0,
    });

    return this;
  }

  simulateSuccessfulTestRun(
    diffs: Array<{ testCaseId: string; hasDiff: boolean; diffUrl?: string }> = []
  ): this {
    const defaultDiffs = diffs.length > 0 ? diffs : [
      { testCaseId: "test-1", hasDiff: false },
      { testCaseId: "test-2", hasDiff: false },
    ];

    this.meticulous.updateOptions({
      executeTestRun: {
        success: true,
        testRun: {
          testRunId: "test-run-123",
          project: {
            isGitHubIntegrationActive: true,
          },
        },
        testCaseResults: defaultDiffs.map((diff, index) => ({
          testCaseId: diff.testCaseId,
          success: true,
          screenshotDiffDataByBaseReplayId: {
            [`replay-${index}`]: {
              results: [
                {
                  hasDiff: diff.hasDiff,
                  diffUrl: diff.diffUrl || null,
                },
              ],
            },
          },
        })),
      },
      getLatestTestRunResults: {
        success: true,
        testRunId: "base-test-run-123",
      },
    });

    return this;
  }

  simulateTestRunError(error: string): this {
    this.meticulous.updateOptions({
      shouldThrow: true,
      executeTestRun: { success: false, error },
    });
    return this;
  }

  // Git operation helpers
  setupDefaultGitResponses(): void {
    // Setup responses for common git operations
    setGitResponse('git fetch origin', { stdout: '', code: 0 });
    setGitResponse('git fetch origin --unshallow', { stdout: '', code: 0 });
    setGitResponse('git rev-parse HEAD', { stdout: 'head-sha\n', code: 0 });
    setGitResponse('git merge-base', { stdout: 'base-sha\n', code: 0 });
    
    // Handle the specific error that was causing issues
    setGitResponse('git fetch origin head-sha --unshallow', {
      stderr: 'fatal: --unshallow on a complete repository does not make sense\n',
      code: 128,
    });

    setGitResponse('git fetch origin 22177d347a49bb24d9caa846e6c325b790c1259a --unshallow', {
      stderr: 'fatal: --unshallow on a complete repository does not make sense\n',
      code: 128,
    });
  }

  async waitForAsyncOperations(timeoutMs: number = 1000): Promise<void> {
    const start = Date.now();
    
    while (Date.now() - start < timeoutMs) {
      const resources = this.resourceManager.getActiveResourceCount();
      
      // If no active resources, we're done
      if (resources.timers === 0 && resources.promises === 0) {
        break;
      }
      
      // Wait a bit before checking again - use untracked timer
      await new Promise(resolve => {
        const timer = this.resourceManager['originalSetTimeout'](resolve, 10);
        // Don't track this timer since it's for test infrastructure
      });
    }
  }

  // Assertion helpers
  assertActionSucceeded(): void {
    const failures = this.actions.getFailures();
    expect(failures).toHaveLength(0);
  }

  assertActionFailed(expectedMessage?: string): void {
    const failures = this.actions.getFailures();
    expect(failures.length).toBeGreaterThan(0);
    if (expectedMessage) {
      expect(failures[0].args[0]).toContain(expectedMessage);
    }
  }

  assertTestRunExecuted(): void {
    const calls = this.meticulous.getExecuteTestRunCalls();
    expect(calls.length).toBeGreaterThan(0);
  }

  assertNoTestRunExecuted(): void {
    const calls = this.meticulous.getExecuteTestRunCalls();
    expect(calls).toHaveLength(0);
  }

  assertGitHubCommentCreated(): void {
    const octokit = this.github.getOctokit("mock-token");
    expect(octokit.rest.issues.createComment).toHaveBeenCalled();
  }

  // Reset all mocks
  reset(): void {
    this.github.updateContext({});
    this.meticulous.reset();
    this.fileSystem.reset();
    this.network.reset();
    this.actions.reset();
    this.sentry.reset();
  }

  // Get test environment for additional setup
  getTestEnvironment(): TestEnvironment | undefined {
    return this.testEnvironment;
  }

  // Resource debugging
  getActiveResources() {
    return this.resourceManager.getActiveResourceCount();
  }

  async forceCleanupResources(): Promise<void> {
    // Force cleanup all resources aggressively
    await this.resourceManager.cleanup();
    
    // Additional cleanup for any Node.js handles
    const process = require('process');
    if (process._getActiveHandles) {
      const handles = process._getActiveHandles();
      handles.forEach((handle: any) => {
        if (handle && typeof handle.close === 'function') {
          try {
            handle.close();
          } catch (e) {
            // Ignore
          }
        }
        if (handle && typeof handle.unref === 'function') {
          try {
            handle.unref();
          } catch (e) {
            // Ignore
          }
        }
      });
    }
  }
}