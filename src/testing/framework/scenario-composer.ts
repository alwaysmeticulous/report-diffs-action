/**
 * Composable scenario builder for complex test workflows
 * Enables building test scenarios from reusable components
 */

export interface ScenarioStep {
  name: string;
  execute: (context: TestContext) => Promise<void>;
  rollback?: (context: TestContext) => Promise<void>;
}

export interface TestContext {
  harness: any;
  state: Map<string, any>;
  metadata: {
    scenarioName: string;
    stepIndex: number;
    totalSteps: number;
  };
}

export class ScenarioComposer {
  private steps: ScenarioStep[] = [];
  private context: TestContext;

  constructor(harness: any, scenarioName: string) {
    this.context = {
      harness,
      state: new Map(),
      metadata: {
        scenarioName,
        stepIndex: 0,
        totalSteps: 0,
      },
    };
  }

  addStep(step: ScenarioStep): this {
    this.steps.push(step);
    this.context.metadata.totalSteps = this.steps.length;
    return this;
  }

  // Fluent API for common scenarios
  withPullRequest(config: any = {}): this {
    return this.addStep({
      name: 'setup-pull-request',
      execute: async (ctx) => {
        ctx.harness.simulatePullRequest(config);
        ctx.state.set('pullRequestConfig', config);
      },
    });
  }

  withSuccessfulTestRun(diffs: any[] = []): this {
    return this.addStep({
      name: 'setup-successful-test-run',
      execute: async (ctx) => {
        ctx.harness.simulateSuccessfulTestRun(diffs);
        ctx.state.set('testRunDiffs', diffs);
      },
    });
  }

  withApiError(error: string): this {
    return this.addStep({
      name: 'setup-api-error',
      execute: async (ctx) => {
        ctx.harness.simulateTestRunError(error);
        ctx.state.set('expectedError', error);
      },
    });
  }

  withNetworkFailure(): this {
    return this.addStep({
      name: 'setup-network-failure',
      execute: async (ctx) => {
        ctx.harness.network.setShouldFailConnection(true);
        ctx.state.set('networkFailure', true);
      },
    });
  }

  withGitHubPermissionsError(missingPerms: string[]): this {
    return this.addStep({
      name: 'setup-github-permissions-error',
      execute: async (ctx) => {
        ctx.harness.github.simulatePermissionsError(missingPerms);
        ctx.state.set('missingPermissions', missingPerms);
      },
    });
  }

  withCustomStep(name: string, executor: (ctx: TestContext) => Promise<void>): this {
    return this.addStep({
      name,
      execute: executor,
    });
  }

  async execute(): Promise<TestContext> {
    for (let i = 0; i < this.steps.length; i++) {
      this.context.metadata.stepIndex = i;
      const step = this.steps[i];
      
      try {
        await step.execute(this.context);
      } catch (error) {
        // Execute rollbacks for completed steps
        for (let j = i - 1; j >= 0; j--) {
          const rollbackStep = this.steps[j];
          if (rollbackStep.rollback) {
            try {
              await rollbackStep.rollback(this.context);
            } catch (rollbackError) {
              console.warn(`Rollback failed for step ${rollbackStep.name}:`, rollbackError);
            }
          }
        }
        throw error;
      }
    }

    return this.context;
  }

  getContext(): TestContext {
    return this.context;
  }
}

// Predefined scenario templates
export class ScenarioTemplates {
  static standardPullRequest(harness: any): ScenarioComposer {
    return new ScenarioComposer(harness, 'standard-pull-request')
      .withPullRequest()
      .withSuccessfulTestRun([
        { testCaseId: 'login-test', hasDiff: false },
        { testCaseId: 'navigation-test', hasDiff: false },
      ]);
  }

  static pullRequestWithDiffs(harness: any): ScenarioComposer {
    return new ScenarioComposer(harness, 'pull-request-with-diffs')
      .withPullRequest()
      .withSuccessfulTestRun([
        { testCaseId: 'header-test', hasDiff: false },
        { 
          testCaseId: 'button-test', 
          hasDiff: true, 
          diffUrl: 'https://app.meticulous.ai/diffs/button-change' 
        },
      ]);
  }

  static apiFailureScenario(harness: any): ScenarioComposer {
    return new ScenarioComposer(harness, 'api-failure')
      .withPullRequest()
      .withApiError('API rate limit exceeded');
  }

  static permissionsFailureScenario(harness: any): ScenarioComposer {
    return new ScenarioComposer(harness, 'permissions-failure')
      .withPullRequest()
      .withGitHubPermissionsError(['actions:write', 'pull-requests:write']);
  }

  static networkFailureScenario(harness: any): ScenarioComposer {
    return new ScenarioComposer(harness, 'network-failure')
      .withPullRequest()
      .withSuccessfulTestRun()
      .withNetworkFailure();
  }
}