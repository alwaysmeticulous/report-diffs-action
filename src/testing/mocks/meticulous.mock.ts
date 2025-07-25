import { MeticulousService } from "../types";

export interface MockTestRunResult {
  success: boolean;
  testRunId?: string;
  testRun?: {
    testRunId: string;
    project: {
      isGitHubIntegrationActive: boolean;
    };
  };
  testCaseResults?: Array<{
    testCaseId: string;
    success: boolean;
    screenshotDiffDataByBaseReplayId: Record<string, {
      results: Array<{
        hasDiff: boolean;
        diffUrl: string | null;
      }>;
    }>;
  }>;
  diffs?: Array<{
    testCaseId: string;
    diffUrl?: string;
    hasDiff: boolean;
  }>;
  error?: string;
}

export interface MockClientOptions {
  getLatestTestRunResults?: MockTestRunResult | null;
  executeTestRun?: MockTestRunResult;
  shouldThrow?: boolean;
  throwAfterDelay?: number;
}

export class MockMeticulousService implements MeticulousService {
  private options: MockClientOptions;
  private executeTestRunCalls: any[] = [];
  private getLatestTestRunResultsCalls: any[] = [];

  constructor(options: MockClientOptions = {}) {
    this.options = options;
  }

  createClient(options: { apiToken: string }) {
    if (!options.apiToken) {
      throw new Error("API token is required");
    }
    return {
      apiToken: options.apiToken,
      // Mock client methods can be added here
    };
  }

  async getLatestTestRunResults(options: {
    client: any;
    commitSha: string;
    logicalEnvironmentVersion: string;
  }) {
    this.getLatestTestRunResultsCalls.push(options);

    if (this.options.shouldThrow) {
      throw new Error(this.options.getLatestTestRunResults?.error || "Mock error");
    }

    // Handle explicit null case (no test run found)
    if (this.options.getLatestTestRunResults === null) {
      return null;
    }

    return this.options.getLatestTestRunResults || {
      success: true,
      testRunId: "mock-test-run-id",
      diffs: [],
    };
  }

  async executeTestRun(options: any) {
    this.executeTestRunCalls.push(options);

    if (this.options.throwAfterDelay) {
      await new Promise(resolve => setTimeout(resolve, this.options.throwAfterDelay));
    }

    if (this.options.shouldThrow) {
      throw new Error(this.options.executeTestRun?.error || "Mock execution error");
    }

    // Simulate test run progress callbacks
    if (options.onTestRunCreated) {
      options.onTestRunCreated({
        testRunId: "mock-test-run-id",
        status: "running",
        project: {
          isGitHubIntegrationActive: true,
        },
        progress: {
          runningTestCases: 2,
          completedTestCases: 0,
          totalTestCases: 2,
        },
      });
    }

    if (options.onTestFinished) {
      setTimeout(() => {
        options.onTestFinished({
          testRunId: "mock-test-run-id",
          testCaseId: "mock-test-case-1",
          status: "completed",
          progress: {
            runningTestCases: 0,
            completedTestCases: 2,
            totalTestCases: 2,
            passedTestCases: 2,
            failedTestCases: 0,
          },
        });
      }, 100);
    }

    return this.options.executeTestRun || {
      success: true,
      testRun: {
        testRunId: "mock-test-run-id",
        project: {
          isGitHubIntegrationActive: true,
        },
      },
      testCaseResults: [
        {
          testCaseId: "test-case-1",
          success: true,
          screenshotDiffDataByBaseReplayId: {
            "replay-1": {
              results: [
                {
                  hasDiff: false,
                  diffUrl: null,
                },
              ],
            },
          },
        },
        {
          testCaseId: "test-case-2", 
          success: true,
          screenshotDiffDataByBaseReplayId: {
            "replay-2": {
              results: [
                {
                  hasDiff: true,
                  diffUrl: "https://app.meticulous.ai/diffs/mock-diff-url",
                },
              ],
            },
          },
        },
      ],
    };
  }

  // Test utilities
  getExecuteTestRunCalls() {
    return this.executeTestRunCalls;
  }

  getGetLatestTestRunResultsCalls() {
    return this.getLatestTestRunResultsCalls;
  }

  updateOptions(newOptions: Partial<MockClientOptions>) {
    this.options = { ...this.options, ...newOptions };
  }

  reset() {
    this.executeTestRunCalls = [];
    this.getLatestTestRunResultsCalls = [];
  }
}