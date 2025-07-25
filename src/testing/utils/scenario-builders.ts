import { TestHarness } from "../test-harness";
import { MockGitHubContext } from "../mocks";

export interface ScenarioBuilder {
  withPullRequest(options?: {
    number?: number;
    headSha?: string;
    baseSha?: string;
    headRef?: string;
    baseRef?: string;
  }): ScenarioBuilder;
  
  withPush(options?: {
    sha?: string;
    ref?: string;
  }): ScenarioBuilder;
  
  withWorkflowDispatch(options?: {
    ref?: string;
  }): ScenarioBuilder;
  
  withSuccessfulTestRun(options?: {
    testRunId?: string;
    diffs?: Array<{ testCaseId: string; hasDiff: boolean; diffUrl?: string }>;
  }): ScenarioBuilder;
  
  withTestRunError(error: string): ScenarioBuilder;
  
  withNoBaseTestRun(): ScenarioBuilder;
  
  withGitHubApiError(): ScenarioBuilder;
  
  withNetworkError(): ScenarioBuilder;
  
  withTestsFile(content: any): ScenarioBuilder;
  
  withAppUrl(url: string): ScenarioBuilder;
  
  withDeploymentUrl(options?: {
    environmentUrl?: string;
    allowedEnvironments?: string[];
  }): ScenarioBuilder;
  
  withCustomConfig(config: Record<string, string>): ScenarioBuilder;
  
  build(): TestHarness;
}

export function createScenario(): ScenarioBuilder {
  const harness = new TestHarness();
  
  const builder: ScenarioBuilder = {
    withPullRequest(options = {}) {
      const {
        number = 123,
        headSha = "head-sha",
        baseSha = "base-sha",
        headRef = "feature-branch",
        baseRef = "main",
      } = options;
      
      harness.github.updateContext({
        eventName: "pull_request",
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
        sha: headSha,
        ref: `refs/heads/${headRef}`,
      });
      
      return this;
    },
    
    withPush(options = {}) {
      const { sha = "push-sha", ref = "main" } = options;
      
      harness.github.updateContext({
        eventName: "push",
        sha,
        ref: `refs/heads/${ref}`,
        payload: {
          repository: {
            name: "test-repo",
            owner: { login: "test-owner" },
          },
        },
      });
      
      return this;
    },
    
    withWorkflowDispatch(options = {}) {
      const { ref = "main" } = options;
      
      harness.github.updateContext({
        eventName: "workflow_dispatch",
        ref: `refs/heads/${ref}`,
        payload: {
          repository: {
            name: "test-repo",
            owner: { login: "test-owner" },
          },
        },
      });
      
      return this;
    },
    
    withSuccessfulTestRun(options = {}) {
      const {
        testRunId = "test-run-123",
        diffs = [{ testCaseId: "test-1", hasDiff: false }],
      } = options;
      
      harness.meticulous.updateOptions({
        executeTestRun: {
          success: true,
          testRunId,
          diffs,
        },
        getLatestTestRunResults: {
          success: true,
          testRunId: "base-test-run-123",
          diffs: [],
        },
      });
      
      return this;
    },
    
    withTestRunError(error: string) {
      harness.meticulous.updateOptions({
        shouldThrow: true,
        executeTestRun: { success: false, error },
      });
      
      return this;
    },
    
    withNoBaseTestRun() {
      harness.meticulous.updateOptions({
        getLatestTestRunResults: {
          success: false,
          error: "No base test run found",
        },
      });
      
      return this;
    },
    
    withGitHubApiError() {
      harness.github.updateOctokit({
        issues: {
          createComment: jest.fn().mockRejectedValue(new Error("GitHub API Error")) as any,
        },
      });
      
      return this;
    },
    
    withNetworkError() {
      harness.network.setShouldFailConnection(true);
      return this;
    },
    
    withTestsFile(content: any) {
      harness.fileSystem.setFile(
        "./tests/react-bmi-calculator/meticulous.json",
        JSON.stringify(content)
      );
      
      return this;
    },
    
    withAppUrl(url: string) {
      process.env.APP_URL = url;
      return this;
    },
    
    withDeploymentUrl(options = {}) {
      const { environmentUrl = "https://staging.example.com", allowedEnvironments } = options;
      
      process.env.USE_DEPLOYMENT_URL = "true";
      if (allowedEnvironments) {
        process.env.ALLOWED_ENVIRONMENTS = allowedEnvironments.join("\n");
      }
      
      const mockOctokit = harness.github.getOctokit("test-token");
      mockOctokit.rest.repos.listDeployments.mockResolvedValue({
        data: [{
          id: 123,
          environment: "staging",
          sha: "head-sha",
        }],
      });
      
      return this;
    },
    
    withCustomConfig(config: Record<string, string>) {
      Object.entries(config).forEach(([key, value]) => {
        process.env[key] = value;
      });
      
      return this;
    },
    
    build() {
      return harness;
    },
  };
  
  return builder;
}

// Pre-built common scenarios
export const scenarios = {
  pullRequestWithNoDiffs: () =>
    createScenario()
      .withPullRequest()
      .withSuccessfulTestRun()
      .withTestsFile({
        tests: [
          { name: "test-1", url: "/test1" },
          { name: "test-2", url: "/test2" },
        ],
      })
      .withAppUrl("http://localhost:3000"),
      
  pullRequestWithDiffs: () =>
    createScenario()
      .withPullRequest()
      .withSuccessfulTestRun({
        diffs: [
          { testCaseId: "test-1", hasDiff: false },
          { testCaseId: "test-2", hasDiff: true, diffUrl: "https://app.meticulous.ai/diffs/123" },
        ],
      })
      .withTestsFile({
        tests: [
          { name: "test-1", url: "/test1" },
          { name: "test-2", url: "/test2" },
        ],
      })
      .withAppUrl("http://localhost:3000"),
      
  pushToMain: () =>
    createScenario()
      .withPush({ ref: "main" })
      .withSuccessfulTestRun()
      .withTestsFile({
        tests: [{ name: "test-1", url: "/test1" }],
      })
      .withAppUrl("http://localhost:3000"),
      
  meticulousApiError: () =>
    createScenario()
      .withPullRequest()
      .withTestRunError("API rate limit exceeded")
      .withTestsFile({
        tests: [{ name: "test-1", url: "/test1" }],
      })
      .withAppUrl("http://localhost:3000"),
      
  deploymentUrlScenario: () =>
    createScenario()
      .withPullRequest()
      .withSuccessfulTestRun()
      .withTestsFile({
        tests: [{ name: "test-1", url: "/test1" }],
      })
      .withDeploymentUrl(),
};