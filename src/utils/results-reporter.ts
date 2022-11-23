import { getOctokit } from "@actions/github";
import { TestRun } from "@alwaysmeticulous/cli";
import { CodeChangeEvent } from "../types";
import { updateStatusComment } from "./update-status-comment";

const METICULOUS_MARKDOWN_LINK = "[Meticulous](${METICULOUS_URL})";

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
    this.shortHeadSha = this.options.headSha.substring(0, 8);
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
    const percentComplete = Math.round(
      (executedTestCases / totalTestCases) * 100
    );
    await this.setCommitStatus({
      state: "pending",
      description: `Testing ${testRun.progress.runningTestCases} sessions (${percentComplete}% complete)...`,
      ...(testRun.progress.failedTestCases > 0
        ? { targetUrl: testRun.url }
        : {}),
    });
    if (testRun.progress.failedTestCases > 0) {
      await this.setStatusComment({
        body: `🤖 ${METICULOUS_MARKDOWN_LINK} is replaying ${testRun.progress.runningTestCases} sessions to check for differences. No differences detected so far. (${percentComplete}% complete, commit: ${this.shortHeadSha})`,
      });
    } else {
      await this.setStatusComment({
        body: `🤖 ${METICULOUS_MARKDOWN_LINK} is replaying ${testRun.progress.runningTestCases} sessions to check for differences: [view differences detected so far](${testRun.url}) (${percentComplete}% complete, commit: ${this.shortHeadSha})`,
      });
    }
  }

  async testRunFinished(
    testRun: TestRun & {
      status: "Success" | "Failure";
    }
  ) {
    const { passedTestCases, failedTestCases } = testRun.progress;
    const totalTestCases = passedTestCases + failedTestCases;

    if (testRun.status === "Success") {
      await this.setCommitStatus({
        description: `Zero differences across ${passedTestCases} sessions tested`,
        state: "success",
      });
      await this.setStatusComment({
        createIfDoesNotExist: true,
        body: `✅ ${METICULOUS_MARKDOWN_LINK} spotted zero visual differences across ${passedTestCases} sessions tested.`,
      });
    } else {
      await this.setCommitStatus({
        description: `Differences in ${failedTestCases} of ${totalTestCases} sessions tested, click details to view`,
        state: "success",
        targetUrl: testRun.url,
      });
      await this.setStatusComment({
        createIfDoesNotExist: true,
        body: `🤖 ${METICULOUS_MARKDOWN_LINK} spotted visual differences in ${failedTestCases} of ${totalTestCases} sessions tested: [view differences detected](${testRun.url}) (commit: ${this.shortHeadSha}).`,
      });
    }
  }

  async errorRunningTests() {
    await this.setCommitStatus({
      description: "Failed to execute, see logs for details",
      state: "error",
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
