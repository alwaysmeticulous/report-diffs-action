import { TestHarness } from "../test-harness";

export interface TestRunAssertions {
  wasExecuted(): void;
  wasNotExecuted(): void;
  hadConfiguration(config: any): void;
  hadAppUrl(url: string): void;
  hadCommitSha(sha: string): void;
  hadBaseCommitSha(sha: string | null): void;
}

export interface ActionAssertions {
  succeeded(): void;
  failed(expectedMessage?: string): void;
  setOutput(name: string, value?: string): void;
  loggedInfo(message: string): void;
  loggedWarning(message: string): void;
  loggedError(message: string): void;
}

export interface GitHubAssertions {
  commentCreated(expectedContent?: string): void;
  commentUpdated(): void;
  statusSet(state: string): void;
  workflowDispatched(): void;
}

export interface SentryAssertions {
  initialized(): void;
  exceptionCaptured(expectedError?: string): void;
  spanStarted(operationName: string): void;
  flushed(): void;
}

export function createAssertions(harness: TestHarness) {
  const testRun: TestRunAssertions = {
    wasExecuted() {
      const calls = harness.meticulous.getExecuteTestRunCalls();
      expect(calls.length).toBeGreaterThan(0);
    },

    wasNotExecuted() {
      const calls = harness.meticulous.getExecuteTestRunCalls();
      expect(calls).toHaveLength(0);
    },

    hadConfiguration(config: any) {
      const calls = harness.meticulous.getExecuteTestRunCalls();
      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0]).toMatchObject(config);
    },

    hadAppUrl(url: string) {
      this.hadConfiguration({ appUrl: url });
    },

    hadCommitSha(sha: string) {
      this.hadConfiguration({ commitSha: sha });
    },

    hadBaseCommitSha(sha: string | null) {
      this.hadConfiguration({ baseCommitSha: sha });
    },
  };

  const action: ActionAssertions = {
    succeeded() {
      const failures = harness.actions.getFailures();
      expect(failures).toHaveLength(0);
    },

    failed(expectedMessage?: string) {
      const failures = harness.actions.getFailures();
      expect(failures.length).toBeGreaterThan(0);
      if (expectedMessage) {
        expect(failures[0].args[0]).toContain(expectedMessage);
      }
    },

    setOutput(name: string, value?: string) {
      const calls = harness.actions.getCalls();
      const outputCalls = calls.filter(call => call.method === "setOutput" && call.args[0] === name);
      expect(outputCalls.length).toBeGreaterThan(0);
      if (value !== undefined) {
        expect(outputCalls[0].args[1]).toBe(value);
      }
    },

    loggedInfo(message: string) {
      const calls = harness.actions.getCalls();
      const infoCalls = calls.filter(call => call.method === "info");
      expect(infoCalls.some(call => call.args[0].includes(message))).toBe(true);
    },

    loggedWarning(message: string) {
      const calls = harness.actions.getCalls();
      const warningCalls = calls.filter(call => call.method === "warning");
      expect(warningCalls.some(call => call.args[0].includes(message))).toBe(true);
    },

    loggedError(message: string) {
      const calls = harness.actions.getCalls();
      const errorCalls = calls.filter(call => call.method === "error");
      expect(errorCalls.some(call => call.args[0].includes(message))).toBe(true);
    },
  };

  const github: GitHubAssertions = {
    commentCreated(expectedContent?: string) {
      const octokit = harness.github.getOctokit("mock-token");
      expect(octokit.rest.issues.createComment).toHaveBeenCalled();
      if (expectedContent) {
        const calls = octokit.rest.issues.createComment.mock.calls;
        expect(calls.some((call: any) => call[0].body.includes(expectedContent))).toBe(true);
      }
    },

    commentUpdated() {
      const octokit = harness.github.getOctokit("mock-token");
      expect(octokit.rest.issues.updateComment).toHaveBeenCalled();
    },

    statusSet(state: string) {
      const octokit = harness.github.getOctokit("mock-token");
      expect(octokit.rest.repos.createCommitStatus).toHaveBeenCalledWith(
        expect.objectContaining({ state })
      );
    },

    workflowDispatched() {
      const octokit = harness.github.getOctokit("mock-token");
      expect(octokit.rest.actions.createWorkflowDispatch).toHaveBeenCalled();
    },
  };

  const sentry: SentryAssertions = {
    initialized() {
      const calls = harness.sentry.getCalls();
      expect(calls.some(call => call.method === "initSentry")).toBe(true);
    },

    exceptionCaptured(expectedError?: string) {
      const calls = harness.sentry.getCalls();
      const exceptionCalls = calls.filter(call => call.method === "captureException");
      expect(exceptionCalls.length).toBeGreaterThan(0);
      if (expectedError) {
        expect(exceptionCalls.some(call => 
          call.args[0].message?.includes(expectedError)
        )).toBe(true);
      }
    },

    spanStarted(operationName: string) {
      const calls = harness.sentry.getCalls();
      const spanCalls = calls.filter(call => 
        call.method === "startSpan" && 
        call.args[0].op === operationName
      );
      expect(spanCalls.length).toBeGreaterThan(0);
    },

    flushed() {
      const calls = harness.sentry.getCalls();
      expect(calls.some(call => call.method === "flush")).toBe(true);
    },
  };

  return {
    testRun,
    action,
    github,
    sentry,
  };
}