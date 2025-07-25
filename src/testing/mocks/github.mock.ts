import { Context } from "@actions/github/lib/context";
import { getOctokit } from "@actions/github";
import { GitHubService } from "../types";

type OctokitType = ReturnType<typeof getOctokit>;

export interface MockOctokitOptions {
  repos?: Partial<OctokitType["rest"]["repos"]>;
  pulls?: Partial<OctokitType["rest"]["pulls"]>;
  issues?: Partial<OctokitType["rest"]["issues"]>;
  actions?: Partial<OctokitType["rest"]["actions"]>;
}

export interface MockGitHubContext {
  eventName?: string;
  payload?: any;
  repo?: { owner: string; repo: string };
  sha?: string;
  ref?: string;
  actor?: string;
  workflow?: string;
  action?: string;
  job?: string;
  runNumber?: number;
  runId?: number;
}

export class MockGitHubService implements GitHubService {
  private mockContext: Context;
  private mockOctokit: any;

  constructor(
    contextOverrides: MockGitHubContext = {},
    octokitOptions: MockOctokitOptions = {}
  ) {
    this.mockContext = this.createMockContext(contextOverrides);
    this.mockOctokit = this.createMockOctokit(octokitOptions);
  }

  getOctokit(token: string): any {
    if (!token) {
      throw new Error("github-token is required");
    }
    return this.mockOctokit;
  }

  getContext(): Context {
    return this.mockContext;
  }

  updateContext(contextOverrides: MockGitHubContext): void {
    this.mockContext = { ...this.mockContext, ...contextOverrides } as Context;
  }

  updateOctokit(octokitOptions: MockOctokitOptions): void {
    this.mockOctokit = { ...this.mockOctokit, ...this.createMockOctokit(octokitOptions) };
  }

  private createMockContext(overrides: MockGitHubContext): Context {
    const defaultContext = {
      eventName: "pull_request",
      payload: {
        pull_request: {
          number: 123,
          head: { sha: "head-sha", ref: "feature-branch" },
          base: { sha: "base-sha", ref: "main" },
        },
        repository: {
          name: "test-repo",
          owner: { login: "test-owner" },
        },
      },
      repo: { owner: "test-owner", repo: "test-repo" },
      sha: "head-sha",
      ref: "refs/heads/feature-branch",
      actor: "test-actor",
      workflow: "Test Workflow",
      action: "test-action",
      job: "test-job",
      runNumber: 1,
      runId: 12345,
      issue: { owner: "test-owner", repo: "test-repo", number: 123 },
    };

    return { ...defaultContext, ...overrides } as Context;
  }

  private createMockOctokit(options: MockOctokitOptions): any {
    const defaultMock = {
      rest: {
        repos: {
          listDeployments: jest.fn().mockResolvedValue({ data: [] }),
          getDeployment: jest.fn().mockResolvedValue({ data: {} }),
          createCommitStatus: jest.fn().mockResolvedValue({ data: {} }),
          ...options.repos,
        },
        pulls: {
          get: jest.fn().mockResolvedValue({
            data: {
              number: 123,
              head: { sha: "head-sha" },
              base: { sha: "base-sha" },
            },
          }),
          createReview: jest.fn().mockResolvedValue({ data: {} }),
          ...options.pulls,
        },
        issues: {
          createComment: jest.fn().mockResolvedValue({ data: {} }) as any,
          updateComment: jest.fn().mockResolvedValue({ data: {} }) as any,
          listComments: jest.fn().mockResolvedValue({ data: [] }) as any,
          ...options.issues,
        },
        actions: {
          createWorkflowDispatch: jest.fn().mockResolvedValue({ data: {} }),
          ...options.actions,
        },
      },
    };

    return defaultMock;
  }
}