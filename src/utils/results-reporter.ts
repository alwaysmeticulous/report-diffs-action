import { getOctokit } from "@actions/github";
import { RunAllTestsResult, TestRun } from "@alwaysmeticulous/cli";
import { CodeChangeEvent } from "../types";
import { updateStatusComment } from "./update-status-comment";

const SHORT_SHA_LENGTH = 7;
const METICULOUS_MARKDOWN_LINK = "[Meticulous](https://meticulous.ai/)";

/**
 * Posts/updates Github comments and Github commit statuses to keep the user updated on progress/results.
 */
export class ResultsReporter {
  private shortHeadSha: string;

  constructor(
    private options: {
      octokit: ReturnType<typeof getOctokit>;
      event: CodeChangeEvent;
      owner: string;
      repo: string;
      headSha: string;
    }
  ) {
    this.shortHeadSha = this.options.headSha.substring(0, SHORT_SHA_LENGTH);
  }

  async testRunStarted(
    testRun: TestRun & {
      status: "Running";
    }
  ) {
    await this.setCommitStatus({
      state: "pending",
      description: `Testing ${testRun.progress.runningTestCases} sessions...`,
    });
    await this.setStatusComment({
      body: `🤖 ${METICULOUS_MARKDOWN_LINK} is replaying ${testRun.progress.runningTestCases} sessions to check for differences... (commit: ${this.shortHeadSha})`,
    });
  }

  async testFinished(
    testRun: TestRun & {
      status: "Running";
    }
  ) {
    const executedTestCases =
      testRun.progress.passedTestCases + testRun.progress.failedTestCases;
    const totalTestCases =
      executedTestCases + testRun.progress.runningTestCases;

    if (executedTestCases === totalTestCases) {
      return; // Don't post a confusing 100% comment, wait for the actual test run to complete
    }

    const percentComplete = Math.round(
      (executedTestCases / totalTestCases) * 100
    );
    await this.setCommitStatus({
      state: "pending",
      description: `Testing ${totalTestCases} sessions (${percentComplete}% complete)...`,
      ...(testRun.progress.failedTestCases > 0
        ? { targetUrl: testRun.url }
        : {}),
    });
    if (testRun.progress.failedTestCases > 0) {
      await this.setStatusComment({
        body: `🤖 ${METICULOUS_MARKDOWN_LINK} is replaying ${totalTestCases} sessions to check for differences. No differences detected so far. (${percentComplete}% complete, commit: ${this.shortHeadSha})`,
      });
    } else {
      await this.setStatusComment({
        body: `🤖 ${METICULOUS_MARKDOWN_LINK} is replaying ${totalTestCases} sessions to check for differences: [view differences detected so far](${testRun.url}) (${percentComplete}% complete, commit: ${this.shortHeadSha})`,
      });
    }
  }

  async testRunFinished(results: RunAllTestsResult) {
    const { testRun, testCaseResults } = results;
    const screenshotDiffResults = testCaseResults.flatMap(
      (testCase) => testCase.screenshotDiffResults
    );
    const screensWithDifferences = screenshotDiffResults.filter(
      (result) =>
        result.outcome === "diff" || result.outcome === "different-size"
    ).length;
    const totalScreens = screenshotDiffResults.length;

    if (screensWithDifferences === 0) {
      await this.setCommitStatus({
        description: `Zero differences across ${totalScreens} screens tested`,
        state: "success",
        targetUrl: testRun.url,
      });
      await this.setStatusComment({
        createIfDoesNotExist: true,
        body: `✅ ${METICULOUS_MARKDOWN_LINK} spotted zero visual differences across ${totalScreens} screens tested.`,
      });
    } else {
      await this.setCommitStatus({
        description: `Differences in ${screensWithDifferences} of ${totalScreens} screens, click details to view`,
        state: "success",
        targetUrl: testRun.url,
      });
      await this.setStatusComment({
        createIfDoesNotExist: true,
        body: `🤖 ${METICULOUS_MARKDOWN_LINK} spotted visual differences in ${screensWithDifferences} of ${totalScreens} screens tested: [view differences detected](${testRun.url}) (commit: ${this.shortHeadSha}).`,
      });
    }
  }

  async errorRunningTests() {
    await this.setCommitStatus({
      description: "Failed to execute, see logs for details",
      state: "error",
    });
    await this.setStatusComment({
      body: `🤖 ${METICULOUS_MARKDOWN_LINK} failed to execute, see GitHub job logs for details (commit: ${this.shortHeadSha})`,
    });
  }

  private setCommitStatus({
    state,
    description,
    targetUrl,
  }: {
    state: "error" | "failure" | "pending" | "success";
    description: string;
    targetUrl?: string;
  }) {
    const { octokit, owner, repo, headSha } = this.options;
    return octokit.rest.repos.createCommitStatus({
      owner,
      repo,
      context: "Meticulous",
      description,
      state,
      sha: headSha,
      ...(targetUrl ? { target_url: targetUrl } : {}),
    });
  }

  private setStatusComment({
    body,
    createIfDoesNotExist,
  }: {
    body: string;
    createIfDoesNotExist?: boolean;
  }) {
    const { octokit, owner, repo, event } = this.options;
    return updateStatusComment({
      octokit,
      owner,
      repo,
      event,
      createIfDoesNotExist: createIfDoesNotExist ?? false,
      body,
    });
  }
}
