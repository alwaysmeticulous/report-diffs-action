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
import { initLogger } from "../common/logger.utils";

export interface TestHarnessOptions {
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
}

export class TestHarness {
  public readonly github: MockGitHubService;
  public readonly meticulous: MockMeticulousService;
  public readonly fileSystem: MockFileSystemService;
  public readonly network: MockNetworkService;
  public readonly actions: MockActionsService;
  public readonly sentry: MockSentryService;
  public readonly logger = initLogger();

  constructor(options: TestHarnessOptions = {}) {
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

  // GitHub simulation helpers
  simulatePullRequest(prNumber: number = 123, headSha: string = "head-sha", baseSha: string = "base-sha") {
    this.github.updateContext({
      eventName: "pull_request",
      payload: {
        pull_request: {
          number: prNumber,
          head: { sha: headSha, ref: "feature-branch" },
          base: { sha: baseSha, ref: "main" },
        },
        repository: {
          name: "test-repo",
          owner: { login: "test-owner" },
        },
      },
    });
  }

  simulatePush(sha: string = "push-sha") {
    this.github.updateContext({
      eventName: "push",
      sha,
      payload: {
        repository: {
          name: "test-repo",
          owner: { login: "test-owner" },
        },
      },
    });
  }

  simulateWorkflowDispatch(ref: string = "main") {
    this.github.updateContext({
      eventName: "workflow_dispatch",
      ref: `refs/heads/${ref}`,
      payload: {
        repository: {
          name: "test-repo",
          owner: { login: "test-owner" },
        },
      },
    });
  }

  // Meticulous simulation helpers
  simulateSuccessfulTestRun(diffs: Array<{ testCaseId: string; hasDiff: boolean; diffUrl?: string }> = []) {
    this.meticulous.updateOptions({
      executeTestRun: {
        success: true,
        testRun: {
          testRunId: "test-run-123",
          project: {
            isGitHubIntegrationActive: true,
          },
        },
        testCaseResults: diffs.map((diff, index) => ({
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
        diffs: [],
      },
    });
  }

  simulateTestRunWithDiffs() {
    this.simulateSuccessfulTestRun([
      { testCaseId: "test-1", hasDiff: false },
      { testCaseId: "test-2", hasDiff: true, diffUrl: "https://app.meticulous.ai/diffs/123" },
      { testCaseId: "test-3", hasDiff: true, diffUrl: "https://app.meticulous.ai/diffs/456" },
    ]);
  }

  simulateMeticulousApiError(error: string = "API Error") {
    this.meticulous.updateOptions({
      shouldThrow: true,
      executeTestRun: { success: false, error },
    });
  }

  simulateGitHubApiError() {
    this.github.updateOctokit({
      issues: {
        createComment: jest.fn().mockRejectedValue(new Error("GitHub API Error")) as any,
      },
    });
  }

  // Test setup helpers
  setupDefaultPullRequestScenario() {
    this.simulatePullRequest();
    this.simulateSuccessfulTestRun();
    this.setupDefaultTestsFile();
  }

  setupDefaultTestsFile() {
    this.fileSystem.setFile("./tests/react-bmi-calculator/meticulous.json", JSON.stringify({
      tests: [
        { name: "test-1", url: "/test1" },
        { name: "test-2", url: "/test2" },
      ],
    }));
  }

  // Assertion helpers
  assertActionSucceeded() {
    const failures = this.actions.getFailures();
    expect(failures).toHaveLength(0);
  }

  assertActionFailed(expectedMessage?: string) {
    const failures = this.actions.getFailures();
    expect(failures.length).toBeGreaterThan(0);
    if (expectedMessage) {
      expect(failures[0].args[0]).toContain(expectedMessage);
    }
  }

  assertTestRunExecuted() {
    const calls = this.meticulous.getExecuteTestRunCalls();
    expect(calls.length).toBeGreaterThan(0);
  }

  assertNoTestRunExecuted() {
    const calls = this.meticulous.getExecuteTestRunCalls();
    expect(calls).toHaveLength(0);
  }

  assertGitHubCommentCreated() {
    const octokit = this.github.getOctokit("mock-token");
    expect(octokit.rest.issues.createComment).toHaveBeenCalled();
  }

  // Reset all mocks
  reset() {
    this.github.updateContext({});
    this.meticulous.reset();
    this.fileSystem.reset();
    this.network.reset();
    this.actions.reset();
    this.sentry.reset();
  }
}