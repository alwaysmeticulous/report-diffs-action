import { getOctokit } from "@actions/github";
import {
  Project,
  ScreenshotDiffResult,
  TestCaseResult,
} from "@alwaysmeticulous/api";
import { METICULOUS_LOGGER_NAME } from "@alwaysmeticulous/common";
import {
  DetailedTestCaseResult,
  ExecuteTestRunResult,
  RunningTestRunExecution,
} from "@alwaysmeticulous/sdk-bundles-api";
import log from "loglevel";
import { DOCS_URL } from "../../../common/constants";
import { shortCommitSha } from "../../../common/environment.utils";
import {
  DEFAULT_FAILED_OCTOKIT_REQUEST_MESSAGE,
  isGithubPermissionsError,
} from "../../../common/error.utils";
import { shortSha } from "../../../common/logger.utils";
import { updateStatusComment } from "../../../common/update-status-comment";
import { CodeChangeEvent } from "../../../types";

export interface EnrichedProject extends Project {
  isGitHubIntegrationActive?: boolean;
}

interface OldDetailedTestCaseResult extends TestCaseResult {
  screenshotDiffResultsByBaseReplayId: Record<string, ScreenshotDiffResult[]>;
  totalNumberOfScreenshots: number;
}

const isOldDetailedTestCaseResult = (
  result: DetailedTestCaseResult | OldDetailedTestCaseResult
): result is OldDetailedTestCaseResult => {
  return (
    (result as OldDetailedTestCaseResult)
      .screenshotDiffResultsByBaseReplayId !== undefined
  );
};

/**
 * v2.140.0 of `@alwaysmeticulous/sdk-bundles-api` changed the type of DetailedTestCaseResult to include a
 * `screenshotDiffDataByBaseReplayId` field instead of a `screenshotDiffResultsByBaseReplayId` field.
 * To stay backwards compatible, we need to support both types.
 */
type VersionedDetailedTestCaseResult =
  | DetailedTestCaseResult
  | OldDetailedTestCaseResult;

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
      logger: log.Logger;
    }
  ) {
    this.shortHeadSha = shortCommitSha(this.options.headSha);
  }

  async testRunStarted(testRun: RunningTestRunExecution) {
    const logger = this.options.logger;
    if (!(testRun.project as EnrichedProject).isGitHubIntegrationActive) {
      await this.setCommitStatus({
        state: "pending",
        description: `Testing ${testRun.progress.runningTestCases} sessions...`,
      });
    }
    await this.setStatusComment({
      body: `🤖 Meticulous is replaying ${testRun.progress.runningTestCases} sessions to check for differences...`,
      logger,
    });
  }

  async testFinished(testRun: RunningTestRunExecution) {
    const logger = this.options.logger;
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
        logger,
      });
    } else {
      await this.setStatusComment({
        body: `🤖 Meticulous is replaying ${totalTestCases} sessions to check for differences (${percentComplete}% complete).`,
        logger,
      });
    }
  }

  async testRunFinished(results: ExecuteTestRunResult) {
    const logger = this.options.logger;
    const { testRun, testCaseResults } = results;
    const screenshotDiffResults = testCaseResults.flatMap(
      (testCase: VersionedDetailedTestCaseResult) => {
        if (isOldDetailedTestCaseResult(testCase)) {
          return Object.values(
            testCase.screenshotDiffResultsByBaseReplayId
          ).flat();
        } else {
          return Object.values(
            testCase.screenshotDiffDataByBaseReplayId
          ).flatMap((data) => data.results);
        }
      }
    );
    const screensWithDifferences = screenshotDiffResults.filter(
      (result) => result.outcome === "diff"
    ).length;
    const totalScreensCompared = screenshotDiffResults.length;
    const totalScreenshotsTaken = testCaseResults.reduce(
      (total, testCase) => total + testCase.totalNumberOfScreenshots,
      0
    );

    let coverageLine = "";
    const executableLinesEdited =
      testRun.coverageInfo?.editedFileCoverage?.executableLinesEdited;
    const executableLinesEditedAndCovered =
      testRun.coverageInfo?.editedFileCoverage?.executableLinesEditedAndCovered;
    if (
      executableLinesEdited &&
      executableLinesEditedAndCovered !== undefined &&
      testRun.coverageInfo?.editedFileCoverage?.hadCoverageData
    ) {
      const notTested = executableLinesEdited - executableLinesEditedAndCovered;
      coverageLine += "\n\n";
      const coverageLink = `${testRun.url}/coverage?mode=pr`;
      if (executableLinesEditedAndCovered === 0) {
        coverageLine += `Meticulous tested none of the executable lines edited in this PR. If this PR does not modify your frontend this is expected. If this is a new feature or Meticulous was recently introduced then Meticulous will generate tests to cover your code in the coming days<sup>1</sup>.\n\n`;
        coverageLine +=
          "\n<sub>1. If you wish to increase coverage immediately you can do so by interacting with your feature on localhost.</sub>";
      } else if (notTested > 0) {
        coverageLine += `Meticulous tested [${executableLinesEditedAndCovered}/${executableLinesEdited} of the executable lines](${coverageLink}) edited in this PR<sup>1</sup>.\n\n`;
        coverageLine +=
          "\n<sub>1. These lines will likely automatically gain test coverage over the coming days, however if you wish to increase coverage immediately you can do so by interacting with your feature on localhost.</sub>";
      } else {
        coverageLine += `Meticulous tested [100% of the executable lines](${coverageLink}) edited in this PR.`;
      }
    }

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
          body: `✅ Meticulous spotted zero visual differences across ${totalScreensCompared} screens tested: [view results](${
            testRun.url
          }).${coverageLine}${this.buildAgentAccessNote(testRun.id)}`,
          logger,
        });
      } else {
        if (totalScreenshotsTaken === 0) {
          await this.setStatusComment({
            createIfDoesNotExist: true,
            body: `❌ Meticulous replayed ${testCaseResults.length} user sessions, but no visual snapshots were taken. This likely means there was an error replaying the sessions. Please view the logs of the Github workflow.`,
            logger,
          });
        } else {
          const baseRefStr = this.options.baseRef
            ? this.options.baseRef
            : "main/master";

          // This likely means that the baseRef is not set up for Meticulous yet, so we can't compare against it.
          // Usually this means that the user has just set up Meticulous and is running it for the first time.
          await this.setStatusComment({
            createIfDoesNotExist: true,
            body: `🤖 Meticulous replayed ${
              testCaseResults.length
            } user sessions and [took ${totalScreenshotsTaken} visual snapshots](${
              testRun.url
            }). Meticulous did not run on ${
              this.options.baseSha
            } of the ${baseRefStr} branch and so there was nothing to compare against.
            \nPlease merge your pull request for setting up Meticulous in CI and ensure that it’s running on push events to the ${baseRefStr} branch.${this.buildAgentAccessNote(
              testRun.id
            )}`,
            logger,
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
        body: `🔴 Meticulous **spotted visual differences** in ${screensWithDifferences} of ${totalScreensCompared} screens tested: [view and approve differences detected](${
          testRun.url
        }).${coverageLine}${this.buildAgentAccessNote(testRun.id)}`,
        logger,
      });
    }
  }

  async errorRunningTests() {
    const logger = this.options.logger;
    // We don't want to update the commit status for runs of projects which are GitHub App integrated. Within
    // this failure mode we can't be always sure that the current repo isn't GitHub App-integrated so be defensive and
    // only post a status comment without a Commit status.
    await this.setStatusComment({
      body: `🤖 Meticulous failed to execute, see GitHub job logs for details.`,
      logger,
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
    logger,
  }: {
    body: string;
    createIfDoesNotExist?: boolean;
    logger: log.Logger;
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
      logger,
    });
  }

  /**
   * Hidden from the rendered GitHub UI (HTML comments are stripped on render), but present in the
   * raw comment body returned by the GitHub API - so a coding agent reading the comment via
   * `gh api` / REST / GraphQL sees it, while human readers don't.
   */
  private buildAgentAccessNote(testRunId: string): string {
    return `\n\n<!---
For coding agents: the links above are not accessible to you directly. Access the results instead via the Meticulous CLI or MCP server.

First, check whether the CLI or MCP is set up:
- CLI: run \`meticulous --version\` (or check whether @alwaysmeticulous/cli is installed)
- MCP: check whether a Meticulous MCP server is available (URL: https://app.meticulous.ai/api/mcp)

If neither is set up, suggest the user install the CLI (\`npm install --global @alwaysmeticulous/cli@latest\`) or add the MCP server (https://app.meticulous.ai/api/mcp), and point them to the setup docs: https://app.meticulous.ai/docs/agents/setup

Once set up:
- Check for the \`meticulous-review\` skill and follow its instructions.
- If it's not installed, suggest the user install the Meticulous skills: \`npx skills add alwaysmeticulous/skills --all --agents claude-code,codex,cursor\`
- Otherwise, here is the rough approach:
  1. Get the diffs for this test run:
     - CLI: meticulous agent test-run-diffs --testRunId ${testRunId}
     - MCP: get_test_run_diffs(testRunId="${testRunId}")
  2. Investigate each diff (using the replayDiffId and screenshotName from the diffs list):
     - CLI: meticulous agent image-files --replayDiffId <replayDiffId> --screenshotName <screenshotName> (or image-urls for signed URLs instead of downloads)
       - If needed: meticulous agent dom-diff --replayDiffId <replayDiffId> --screenshotName <screenshotName>
       - If needed: meticulous agent timeline-diff --replayDiffId <replayDiffId>
     - MCP: get_image_urls(...)
       - If needed: get_dom_diff(...), get_timeline_diff(...)
-->`;
  }
}
