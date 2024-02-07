import { getOctokit } from "@actions/github";
import { Project } from "@alwaysmeticulous/api";
import { METICULOUS_LOGGER_NAME } from "@alwaysmeticulous/common";
import {
  ExecuteTestRunResult,
  RunningTestRunExecution,
} from "@alwaysmeticulous/sdk-bundles-api";
import log from "loglevel";
import { CodeChangeEvent } from "../types";
import { DOCS_URL } from "./constants";
import {
  DEFAULT_FAILED_OCTOKIT_REQUEST_MESSAGE,
  isGithubPermissionsError,
} from "./error.utils";
import { shortSha } from "./logger.utils";
import { updateStatusComment } from "./update-status-comment";

const SHORT_SHA_LENGTH = 7;

export interface EnrichedProject extends Project {
  isGitHubIntegrationActive?: boolean;
}

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
      baseSha: string | null;
      baseRef: string | null;
      testSuiteId: string | null;
    }
  ) {
    this.shortHeadSha = this.options.headSha.substring(0, SHORT_SHA_LENGTH);
  }

  async testRunStarted(testRun: RunningTestRunExecution) {
    if (!(testRun.project as EnrichedProject).isGitHubIntegrationActive) {
      await this.setCommitStatus({
        state: "pending",
        description: `Testing ${testRun.progress.runningTestCases} sessions...`,
      });
    }
    await this.setStatusComment({
      body: `🤖 Meticulous is replaying ${testRun.progress.runningTestCases} sessions to check for differences...`,
    });
  }

  async testFinished(testRun: RunningTestRunExecution) {
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
    if (!(testRun.project as EnrichedProject).isGitHubIntegrationActive) {
      await this.setCommitStatus({
        state: "pending",
        description: `Testing ${totalTestCases} sessions (${percentComplete}% complete)...`,
        ...(testRun.progress.failedTestCases > 0
          ? { targetUrl: testRun.url }
          : {}),
      });
    }
    if (testRun.progress.failedTestCases > 0) {
      await this.setStatusComment({
        body: `🤖 Meticulous is replaying ${totalTestCases} sessions to check for differences. No differences detected so far (${percentComplete}% complete).`,
      });
    } else {
      await this.setStatusComment({
        body: `🤖 Meticulous is replaying ${totalTestCases} sessions to check for differences (${percentComplete}% complete).`,
      });
    }
  }

  async testRunFinished(results: ExecuteTestRunResult) {
    const { testRun, testCaseResults } = results;
    const screenshotDiffResults = testCaseResults.flatMap((testCase) =>
      Object.values(testCase.screenshotDiffResultsByBaseReplayId).flat()
    );
    const screensWithDifferences = screenshotDiffResults.filter(
      (result) => result.outcome === "diff"
    ).length;
    const totalScreensCompared = screenshotDiffResults.length;
    const totalScreenshotsTaken = testCaseResults.reduce(
      (total, testCase) => total + testCase.totalNumberOfScreenshots,
      0
    );

    if (screensWithDifferences === 0) {
      if (!(testRun.project as EnrichedProject).isGitHubIntegrationActive) {
        await this.setCommitStatus({
          description: `Zero differences across ${totalScreensCompared} screens tested`,
          state: "success",
          targetUrl: testRun.url,
        });
      }
      if (totalScreensCompared > 0) {
        await this.setStatusComment({
          createIfDoesNotExist: true,
          body: `✅ Meticulous spotted zero visual differences across ${totalScreensCompared} screens tested: [view results](${testRun.url}).`,
        });
      } else {
        if (totalScreenshotsTaken === 0) {
          await this.setStatusComment({
            createIfDoesNotExist: true,
            body: `❌ Meticulous replayed ${testCaseResults.length} user sessions, but no visual snapshots were taken. This likely means there was an error replaying the sessions. Please view the logs of the Github workflow.`,
          });
        } else {
          const baseRefStr = this.options.baseRef
            ? this.options.baseRef
            : "main/master";

          // This likely means that the baseRef is not set up for Meticulous yet, so we can't compare against it.
          // Usually this means that the user has just set up Meticulous and is running it for the first time.
          await this.setStatusComment({
            createIfDoesNotExist: true,
            body: `🤖 Meticulous replayed ${testCaseResults.length} user sessions and [took ${totalScreenshotsTaken} visual snapshots](${testRun.url}). Meticulous did not run on ${this.options.baseSha} of the ${baseRefStr} branch and so there was nothing to compare against.
            \nPlease merge your pull request for setting up Meticulous in CI and ensure that it’s running on push events to the ${baseRefStr} branch.`,
          });
        }
      }
    } else {
      if (!(testRun.project as EnrichedProject).isGitHubIntegrationActive) {
        await this.setCommitStatus({
          description: `Differences in ${screensWithDifferences} of ${totalScreensCompared} screens, click details to view`,
          state: "success",
          targetUrl: testRun.url,
        });
      }
      await this.setStatusComment({
        createIfDoesNotExist: true,
        body: `🤖 Meticulous spotted visual differences in ${screensWithDifferences} of ${totalScreensCompared} screens tested: [view and approve differences detected](${testRun.url}).`,
      });
    }
  }

  async errorRunningTests() {
    // We don't want to update the commit status for runs of projects which are GitHub App integrated. Within
    // this failure mode we can't be always sure that the current repo isn't GitHub App-integrated so be defensive and
    // only post a status comment without a Commit status.
    await this.setStatusComment({
      body: `🤖 Meticulous failed to execute, see GitHub job logs for details.`,
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
    try {
      return octokit.rest.repos.createCommitStatus({
        owner,
        repo,
        context:
          this.options.testSuiteId != null
            ? `Meticulous (${this.options.testSuiteId})`
            : "Meticulous",
        description,
        state,
        sha: headSha,
        ...(targetUrl ? { target_url: targetUrl } : {}),
      });
    } catch (err: unknown) {
      if (isGithubPermissionsError(err)) {
        // https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs
        throw new Error(
          `Missing permission to create and update commit statuses.` +
            ` Please add the 'statuses: write' permission to your workflow YAML file: see ${DOCS_URL} for the correct setup.`
        );
      }
      const logger = log.getLogger(METICULOUS_LOGGER_NAME);
      logger.error(
        `Unable to create commit status for commit '${shortSha(
          headSha
        )}'. ${DEFAULT_FAILED_OCTOKIT_REQUEST_MESSAGE}`
      );
      throw err;
    }
  }

  private setStatusComment({
    body,
    createIfDoesNotExist,
  }: {
    body: string;
    createIfDoesNotExist?: boolean;
  }) {
    const { octokit, owner, repo, event, testSuiteId } = this.options;
    return updateStatusComment({
      octokit,
      owner,
      repo,
      event,
      createIfDoesNotExist: createIfDoesNotExist ?? false,
      body,
      shortHeadSha: this.shortHeadSha,
      testSuiteId,
    });
  }
}
