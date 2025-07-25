/**
 * Enhanced GitHub mock service with comprehensive API coverage
 * Supports all GitHub Actions scenarios and edge cases
 */

import { Context } from "@actions/github/lib/context";
import { getOctokit } from "@actions/github";
import { GitHubService } from "../types";

export interface EnhancedGitHubMockOptions {
  context?: Partial<Context>;
  permissions?: string[];
  rateLimit?: {
    remaining: number;
    reset: number;
    limit: number;
  };
  apiResponses?: {
    deployments?: any[];
    deploymentStatuses?: any[];
    pullRequests?: any[];
    issues?: any[];
    commits?: any[];
    workflows?: any[];
    workflowRuns?: any[];
  };
  simulateErrors?: {
    rateLimitExceeded?: boolean;
    permissionDenied?: boolean;
    serviceUnavailable?: boolean;
    networkTimeout?: boolean;
  };
}

export class EnhancedGitHubMockService implements GitHubService {
  private mockContext: Context;
  private mockOctokit: any;
  private callCounts = new Map<string, number>();
  private options: EnhancedGitHubMockOptions;

  constructor(options: EnhancedGitHubMockOptions = {}) {
    this.options = options;
    this.setupMockContext();
    this.setupMockOctokit();
  }

  private setupMockContext(): void {
    this.mockContext = {
      eventName: this.options.context?.eventName || 'pull_request',
      sha: this.options.context?.sha || 'test-sha-123',
      ref: this.options.context?.ref || 'refs/heads/main',
      workflow: this.options.context?.workflow || 'Test Workflow',
      action: this.options.context?.action || 'test-action',
      actor: this.options.context?.actor || 'test-actor',
      job: this.options.context?.job || 'test-job',
      runNumber: this.options.context?.runNumber || 1,
      runId: this.options.context?.runId || 12345,
      repo: {
        owner: 'test-owner',
        repo: 'test-repo',
        ...this.options.context?.repo,
      },
      payload: {
        repository: {
          name: 'test-repo',
          owner: { login: 'test-owner' },
          full_name: 'test-owner/test-repo',
          default_branch: 'main',
        },
        pull_request: {
          number: 123,
          head: { 
            sha: 'pr-head-sha',
            ref: 'feature-branch',
            repo: { full_name: 'test-owner/test-repo' },
          },
          base: { 
            sha: 'pr-base-sha',
            ref: 'main',
            repo: { full_name: 'test-owner/test-repo' },
          },
          title: 'Test Pull Request',
          body: 'Test PR description',
          user: { login: 'test-author' },
          merged: false,
          draft: false,
        },
        ...this.options.context?.payload,
      },
    } as Context;
  }

  private setupMockOctokit(): void {
    const self = this;

    this.mockOctokit = {
      rest: {
        // Issues API (for PR comments)
        issues: {
          createComment: jest.fn().mockImplementation(async (params) => {
            self.incrementCallCount('issues.createComment');
            
            if (self.options.simulateErrors?.permissionDenied) {
              throw {
                status: 403,
                message: 'Resource not accessible by integration',
                response: {
                  headers: {
                    'x-ratelimit-remaining': '5000',
                    'x-ratelimit-limit': '5000',
                  },
                },
              };
            }

            if (self.options.simulateErrors?.rateLimitExceeded) {
              throw {
                status: 403,
                message: 'API rate limit exceeded',
                response: {
                  headers: {
                    'x-ratelimit-remaining': '0',
                    'x-ratelimit-reset': String(Date.now() / 1000 + 3600),
                    'x-ratelimit-limit': '5000',
                  },
                },
              };
            }

            return {
              data: {
                id: Math.floor(Math.random() * 100000),
                body: params.body,
                user: { login: 'github-actions[bot]' },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            };
          }),

          updateComment: jest.fn().mockImplementation(async (params) => {
            self.incrementCallCount('issues.updateComment');
            return {
              data: {
                id: params.comment_id,
                body: params.body,
                updated_at: new Date().toISOString(),
              },
            };
          }),

          listComments: jest.fn().mockImplementation(async (params) => {
            self.incrementCallCount('issues.listComments');
            return {
              data: self.options.apiResponses?.issues || [],
            };
          }),
        },

        // Pull Requests API
        pulls: {
          get: jest.fn().mockImplementation(async (params) => {
            self.incrementCallCount('pulls.get');
            return {
              data: {
                number: params.pull_number,
                head: { sha: 'pr-head-sha', ref: 'feature-branch' },
                base: { sha: 'pr-base-sha', ref: 'main' },
                merged: false,
                state: 'open',
                title: 'Test Pull Request',
              },
            };
          }),

          list: jest.fn().mockImplementation(async (params) => {
            self.incrementCallCount('pulls.list');
            return {
              data: self.options.apiResponses?.pullRequests || [],
            };
          }),
        },

        // Repository API
        repos: {
          get: jest.fn().mockImplementation(async (params) => {
            self.incrementCallCount('repos.get');
            return {
              data: {
                name: params.repo,
                full_name: `${params.owner}/${params.repo}`,
                default_branch: 'main',
                permissions: {
                  admin: true,
                  push: true,
                  pull: true,
                },
              },
            };
          }),

          // Deployments API
          listDeployments: jest.fn().mockImplementation(async (params) => {
            self.incrementCallCount('repos.listDeployments');
            
            if (self.options.simulateErrors?.serviceUnavailable) {
              throw { status: 503, message: 'Service temporarily unavailable' };
            }

            return {
              data: self.options.apiResponses?.deployments || [
                {
                  id: 123,
                  sha: params.sha || 'deployment-sha',
                  environment: 'production',
                  state: 'success',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
            };
          }),

          listDeploymentStatuses: jest.fn().mockImplementation(async (params) => {
            self.incrementCallCount('repos.listDeploymentStatuses');
            return {
              data: self.options.apiResponses?.deploymentStatuses || [
                {
                  id: 456,
                  state: 'success',
                  target_url: 'https://example.com',
                  environment_url: 'https://deploy.example.com',
                  created_at: new Date().toISOString(),
                },
              ],
            };
          }),

          // Commits API
          getCommit: jest.fn().mockImplementation(async (params) => {
            self.incrementCallCount('repos.getCommit');
            return {
              data: {
                sha: params.ref,
                commit: {
                  message: 'Test commit message',
                  author: {
                    name: 'Test Author',
                    email: 'test@example.com',
                    date: new Date().toISOString(),
                  },
                },
                author: { login: 'test-author' },
                committer: { login: 'test-author' },
              },
            };
          }),

          compareCommits: jest.fn().mockImplementation(async (params) => {
            self.incrementCallCount('repos.compareCommits');
            return {
              data: {
                status: 'ahead',
                ahead_by: 5,
                behind_by: 0,
                total_commits: 5,
                commits: [],
                files: [],
              },
            };
          }),
        },

        // Actions API
        actions: {
          listWorkflowRuns: jest.fn().mockImplementation(async (params) => {
            self.incrementCallCount('actions.listWorkflowRuns');
            return {
              data: {
                total_count: 1,
                workflow_runs: self.options.apiResponses?.workflowRuns || [
                  {
                    id: 789,
                    status: 'completed',
                    conclusion: 'success',
                    workflow_id: 456,
                    head_sha: 'workflow-sha',
                    created_at: new Date().toISOString(),
                  },
                ],
              },
            };
          }),

          getWorkflow: jest.fn().mockImplementation(async (params) => {
            self.incrementCallCount('actions.getWorkflow');
            return {
              data: {
                id: params.workflow_id,
                name: 'Test Workflow',
                path: '.github/workflows/test.yml',
                state: 'active',
              },
            };
          }),

          createWorkflowDispatch: jest.fn().mockImplementation(async (params) => {
            self.incrementCallCount('actions.createWorkflowDispatch');
            
            if (!self.options.permissions?.includes('actions:write')) {
              throw {
                status: 403,
                message: 'Resource not accessible by integration',
              };
            }

            return { status: 204 };
          }),
        },

        // Git API
        git: {
          getRef: jest.fn().mockImplementation(async (params) => {
            self.incrementCallCount('git.getRef');
            return {
              data: {
                ref: params.ref,
                object: {
                  sha: 'ref-sha-123',
                  type: 'commit',
                },
              },
            };
          }),
        },
      },

      // GraphQL API
      graphql: jest.fn().mockImplementation(async (query, variables) => {
        self.incrementCallCount('graphql');
        
        // Mock GraphQL responses based on query patterns
        if (query.includes('repository')) {
          return {
            repository: {
              name: 'test-repo',
              owner: { login: 'test-owner' },
              defaultBranchRef: { name: 'main' },
            },
          };
        }

        return {};
      }),

      // Paginate helper
      paginate: jest.fn().mockImplementation(async (method, params) => {
        self.incrementCallCount('paginate');
        const result = await method(params);
        return result.data;
      }),

      // Hook for custom request modifications
      hook: {
        before: jest.fn(),
        after: jest.fn(),
        error: jest.fn(),
        wrap: jest.fn(),
      },
    };

    // Add response headers to all requests
    Object.keys(this.mockOctokit.rest).forEach(apiGroup => {
      Object.keys(this.mockOctokit.rest[apiGroup]).forEach(method => {
        const originalMethod = this.mockOctokit.rest[apiGroup][method];
        this.mockOctokit.rest[apiGroup][method] = jest.fn().mockImplementation(async (...args) => {
          const result = await originalMethod(...args);
          
          // Add rate limit headers
          if (result && typeof result === 'object') {
            result.headers = {
              'x-ratelimit-limit': String(self.options.rateLimit?.limit || 5000),
              'x-ratelimit-remaining': String(self.options.rateLimit?.remaining || 4999),
              'x-ratelimit-reset': String(self.options.rateLimit?.reset || Date.now() / 1000 + 3600),
              ...result.headers,
            };
          }
          
          return result;
        });
      });
    });
  }

  getOctokit(token: string): ReturnType<typeof getOctokit> {
    return this.mockOctokit as ReturnType<typeof getOctokit>;
  }

  getContext(): Context {
    return this.mockContext;
  }

  // Enhanced testing methods
  updateContext(updates: Partial<Context>): void {
    this.mockContext = { ...this.mockContext, ...updates };
  }

  updateOptions(updates: Partial<EnhancedGitHubMockOptions>): void {
    this.options = { ...this.options, ...updates };
    this.setupMockOctokit(); // Recreate with new options
  }

  simulatePermissionsError(missingPermissions: string[]): void {
    this.options.simulateErrors = {
      ...this.options.simulateErrors,
      permissionDenied: true,
    };
    
    // Update all API methods to throw permission errors
    const permissionError = {
      status: 403,
      message: `Resource not accessible by integration. Required permissions: ${missingPermissions.join(', ')}`,
      response: {
        headers: {
          'x-accepted-oauth-scopes': missingPermissions.join(', '),
          'x-oauth-scopes': this.options.permissions?.join(', ') || '',
        },
      },
    };

    Object.values(this.mockOctokit.rest).forEach((apiGroup: any) => {
      Object.values(apiGroup).forEach((method: any) => {
        if (jest.isMockFunction(method)) {
          method.mockRejectedValue(permissionError);
        }
      });
    });
  }

  simulateRateLimit(): void {
    this.options.rateLimit = {
      remaining: 0,
      reset: Date.now() / 1000 + 3600,
      limit: 5000,
    };
    
    this.options.simulateErrors = {
      ...this.options.simulateErrors,
      rateLimitExceeded: true,
    };
  }

  simulateNetworkTimeout(): void {
    this.options.simulateErrors = {
      ...this.options.simulateErrors,
      networkTimeout: true,
    };
    
    const timeoutError = new Error('Request timeout');
    (timeoutError as any).code = 'ETIMEDOUT';

    Object.values(this.mockOctokit.rest).forEach((apiGroup: any) => {
      Object.values(apiGroup).forEach((method: any) => {
        if (jest.isMockFunction(method)) {
          method.mockRejectedValue(timeoutError);
        }
      });
    });
  }

  getCallCount(apiMethod?: string): number {
    if (apiMethod) {
      return this.callCounts.get(apiMethod) || 0;
    }
    return Array.from(this.callCounts.values()).reduce((sum, count) => sum + count, 0);
  }

  private incrementCallCount(method: string): void {
    this.callCounts.set(method, (this.callCounts.get(method) || 0) + 1);
  }

  getCallCounts(): Map<string, number> {
    return new Map(this.callCounts);
  }

  reset(): void {
    this.callCounts.clear();
    this.options.simulateErrors = {};
    this.setupMockContext();
    this.setupMockOctokit();
  }
}