'use strict';

require('source-map-support/register');
var core = require('@actions/core');
var Sentry = require('@sentry/node');
var github = require('@actions/github');
var client = require('@alwaysmeticulous/client');
var remoteReplayLauncher = require('@alwaysmeticulous/remote-replay-launcher');
var sentry = require('@alwaysmeticulous/sentry');
var luxon = require('luxon');
var common = require('@alwaysmeticulous/common');
var log = require('loglevel');
require('loglevel-plugin-prefix');
var node_child_process = require('node:child_process');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var Sentry__namespace = /*#__PURE__*/_interopNamespaceDefault(Sentry);

const METICULIOUS_APP_URL = "https://app.meticulous.ai";
const DOCS_URL = `${METICULIOUS_APP_URL}/docs/github-actions-v2`;

const isGithubPermissionsError = (error) => {
    const message = getErrorMessage(error);
    return (message.toLowerCase().includes("resource not accessible by integration") ||
        error?.status === 403);
};
const getErrorMessage = (error) => {
    const message = error?.message ?? "";
    return typeof message === "string" ? message : "";
};
const DEFAULT_FAILED_OCTOKIT_REQUEST_MESSAGE = `Please check www.githubstatus.com, and that you have setup the action correctly, including with the correct permissions: see ${DOCS_URL} for the correct setup.`;
const ALL_REQUIRED_PERMISSIONS = [
    "actions: write",
    "contents: read",
    "issues: write",
    "pull-requests: write",
    "statuses: read",
];
const getDetailedGitHubPermissionsError = (error, context) => {
    if (!isGithubPermissionsError(error)) {
        return getErrorMessage(error);
    }
    const acceptedPermissions = error?.response
        ?.headers?.["x-accepted-github-permissions"];
    const apiUrl = error?.response?.url;
    let message = "GitHub API Error: Resource not accessible by integration (403)\n\n";
    // Add specific context based on the operation
    switch (context.operation) {
        case "get_workflow_run":
            message += "Failed to retrieve workflow run information.\n";
            message += "This typically happens when:\n";
            message +=
                "1. The GitHub token doesn't have 'actions: read' permission\n";
            message += "2. The workflow is private and the token lacks access\n";
            break;
        case "trigger_workflow":
            message += "Failed to trigger workflow on base branch.\n";
            message += "This typically happens when:\n";
            message +=
                "1. The GitHub token doesn't have 'actions: write' permission\n";
            message +=
                "2. The workflow doesn't have 'workflow_dispatch' trigger enabled\n";
            message += "3. The branch protection rules prevent workflow dispatch\n";
            break;
        case "get_branch":
            message += "Failed to get branch information.\n";
            message += "This typically happens when:\n";
            message +=
                "1. The GitHub token doesn't have 'contents: read' permission\n";
            message +=
                "2. The branch is protected and requires additional permissions\n";
            break;
        case "comment":
            message += "Failed to create or update PR comment.\n";
            message += "This typically happens when:\n";
            message +=
                "1. The GitHub token doesn't have 'pull-requests: write' permission\n";
            message += "2. The repository has disabled PR comments\n";
            break;
    }
    message += "\n**To fix this issue:**\n\n";
    message += getCommonPermissionsErrorMessage();
    // Add workflow_dispatch requirement if needed
    if (context.operation === "trigger_workflow") {
        message +=
            "Also ensure your workflow has the 'workflow_dispatch' trigger:\n\n";
        message += "```yaml\n";
        message += "on:\n";
        message += "  pull_request: {}\n";
        message += "  push:\n";
        message += "    branches: [main, master]\n";
        message += "  workflow_dispatch: {}\n";
        message += "```\n\n";
    }
    // Add debugging information
    if (apiUrl) {
        message += `API endpoint that failed: ${apiUrl}\n`;
    }
    if (acceptedPermissions) {
        message += `Required GitHub permissions: ${acceptedPermissions}\n`;
    }
    return message;
};
const getCommonPermissionsErrorMessage = () => {
    const permissionLines = ALL_REQUIRED_PERMISSIONS.map((perm) => `  ${perm}`).join("\n");
    return `
If you're seeing this error, it's likely because your GitHub workflow is missing required permissions.

**Most common fix - Add ALL these permissions to your workflow:**

\`\`\`yaml
permissions:
${permissionLines}
\`\`\`


**Also ensure your workflow has the workflow_dispatch trigger:**

\`\`\`yaml
on:
  pull_request: {}
  push:
    branches: [main, master]
  workflow_dispatch: {}  # This line is required!
\`\`\`

**If you're still having issues, check:**
1. Your repository permissions allow the GitHub token to access actions
2. Branch protection rules aren't blocking workflow dispatch
3. The Meticulous GitHub app is properly connected to your repository

For complete setup instructions, see: ${DOCS_URL}
  `.trim();
};

const initLogger = () => {
    const logger = log.getLogger(common.METICULOUS_LOGGER_NAME);
    logger.setDefaultLevel(log.levels.INFO);
    if (+(process.env["RUNNER_DEBUG"] ?? "0")) {
        setLogLevel("trace");
    }
    return logger;
};
const setLogLevel = (logLevel) => {
    const logger = log.getLogger(common.METICULOUS_LOGGER_NAME);
    switch ((logLevel).toLocaleLowerCase()) {
        case "trace":
            logger.setLevel(log.levels.TRACE, false);
            break;
        case "debug":
            logger.setLevel(log.levels.DEBUG, false);
            break;
        case "info":
            logger.setLevel(log.levels.INFO, false);
            break;
        case "warn":
            logger.setLevel(log.levels.WARN, false);
            break;
        case "error":
            logger.setLevel(log.levels.ERROR, false);
            break;
        case "silent":
            logger.setLevel(log.levels.SILENT, false);
            break;
    }
};
const shortSha = (sha) => sha.slice(0, 7);

// The GitHub REST API will not list a workflow run immediately after it has been dispatched
const LISTING_AFTER_DISPATCH_DELAY = luxon.Duration.fromObject({ seconds: 10 });
const WORKFLOW_RUN_UPDATE_STATUS_INTERVAL = luxon.Duration.fromObject({ seconds: 5 });
const WORKFLOW_RUN_SEARCH_COMMIT_INTERVAL = luxon.Duration.fromObject({ hours: 1 });
const GITHUB_DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss'Z'";
const MAX_COMMITS_TO_SEARCH = 500;
const MAX_WORKFLOW_RUNS_TO_SEARCH = 500;
const getCurrentWorkflowId = async ({ context, octokit, }) => {
    const { owner, repo } = context.repo;
    const workflowRunId = context.runId;
    try {
        const { data } = await octokit.rest.actions.getWorkflowRun({
            owner,
            repo,
            run_id: workflowRunId,
        });
        const workflowId = data.workflow_id;
        return { workflowId };
    }
    catch (err) {
        if (isGithubPermissionsError(err)) {
            const detailedError = getDetailedGitHubPermissionsError(err, {
                operation: "get_workflow_run"});
            throw new Error(detailedError);
        }
        throw err;
    }
};
const startNewWorkflowRun = async ({ owner, repo, workflowId, ref, commitSha, octokit, logger, }) => {
    try {
        await octokit.rest.actions.createWorkflowDispatch({
            owner,
            repo,
            workflow_id: workflowId,
            ref,
        });
    }
    catch (err) {
        const message = err?.message ?? "";
        if (message.includes("Workflow does not have 'workflow_dispatch' trigger")) {
            logger.error(`Could not trigger a workflow run on commit ${shortSha(commitSha)} of the base branch (${ref}) to compare against, because there was no Meticulous workflow with the 'workflow_dispatch' trigger on the ${ref} branch.` +
                ` Visual snapshots of the new flows will be taken, but no comparisons will be made.` +
                ` If you haven't merged the PR to setup Meticulous in Github Actions to the ${ref} branch yet then this is expected.` +
                ` Otherwise please check that Meticulous is running on the ${ref} branch, that it has a 'workflow_dispatch' trigger, and has the appropiate permissions.` +
                ` See ${DOCS_URL} for the correct setup.`);
            logger.debug(err);
            return undefined;
        }
        if (isGithubPermissionsError(err)) {
            // https://docs.github.com/en/rest/overview/permissions-required-for-github-apps?apiVersion=2022-11-28#repository-permissions-for-actions
            const detailedError = getDetailedGitHubPermissionsError(err, {
                operation: "trigger_workflow"});
            logger.error(`Missing permission to trigger a workflow run on the base branch (${ref}).` +
                ` Visual snapshots of the new flows will be taken, but no comparisons will be made.\n\n${detailedError}`);
            logger.debug(err);
            return undefined;
        }
        logger.error(`Could not trigger a workflow run on commit ${shortSha(commitSha)} of the base branch (${ref}) to compare against.` +
            ` Visual snapshots of the new flows will be taken, but no comparisons will be made.` +
            ` Please check that Meticulous is running on the ${ref} branch, that it has a 'workflow_dispatch' trigger, and has the appropiate permissions.` +
            ` See ${DOCS_URL} for the correct setup.`, err);
        return undefined;
    }
    // Wait before listing again
    await delay(LISTING_AFTER_DISPATCH_DELAY);
    const newRun = await getPendingWorkflowRun({
        owner,
        repo,
        workflowId,
        commitSha,
        octokit,
        logger,
    });
    return newRun;
};
const waitForWorkflowCompletion = async ({ owner, repo, workflowRunId, octokit, timeout, isCancelled, logger, }) => {
    let workflowRun = null;
    const start = luxon.DateTime.now();
    while ((workflowRun == null || isPendingStatus(workflowRun.status)) &&
        luxon.DateTime.now().diff(start) < timeout) {
        if (isCancelled())
            return null;
        const workflowRunResult = await octokit.rest.actions.getWorkflowRun({
            owner,
            repo,
            run_id: workflowRunId,
        });
        workflowRun = workflowRunResult.data;
        logger.debug(JSON.stringify({
            id: workflowRun.id,
            status: workflowRun.status,
            conclusion: workflowRun.conclusion,
        }, null, 2));
        // Wait before listing again
        await delay(WORKFLOW_RUN_UPDATE_STATUS_INTERVAL);
    }
    return workflowRun;
};
/**
 * Searches for a pending workflow in the commit passed in or one of it's parents
 * within the last hour.
 */
const getPendingWorkflowRun = async ({ owner, repo, workflowId, commitSha, octokit, logger, }) => {
    try {
        const since = luxon.DateTime.utc()
            .minus(WORKFLOW_RUN_SEARCH_COMMIT_INTERVAL)
            .toFormat(GITHUB_DATE_FORMAT);
        const commitResponses = octokit.paginate.iterator(octokit.rest.repos.listCommits, {
            owner,
            repo,
            per_page: 100,
            sha: commitSha,
            since,
        });
        const commits = [];
        for await (const commitResponse of commitResponses) {
            commits.push(...commitResponse.data);
            if (commits.length >= MAX_COMMITS_TO_SEARCH)
                break;
        }
        const workflowRunsResponses = octokit.paginate.iterator(octokit.rest.actions.listWorkflowRuns, {
            owner,
            repo,
            workflow_id: workflowId,
            per_page: 100,
            created: `>${since}`,
        });
        const workflowRuns = [];
        for await (const workflowRunResponse of workflowRunsResponses) {
            workflowRuns.push(...workflowRunResponse.data);
            if (workflowRuns.length >= MAX_WORKFLOW_RUNS_TO_SEARCH)
                break;
        }
        let shaToCheck = commitSha;
        while (shaToCheck) {
            const workflowRunsForCommit = workflowRuns.filter(
            // Note we ignore runs on PR events because these are actually running on the temporary
            // merge commit created by GitHub so they are not useable for comparisons.
            (run) => run.head_sha === shaToCheck && run.event !== "pull_request");
            if (workflowRunsForCommit.length > 0) {
                // We've found a commit that we ran on. If there's a pending run, return it.
                // In any case we can stop searching.
                const pendingRun = workflowRunsForCommit.find((run) => isPendingStatus(run.status));
                if (pendingRun) {
                    return {
                        ...pendingRun,
                        workflowRunId: pendingRun.id,
                    };
                }
                return undefined;
            }
            // If we don't find a workflow on the commit passed in, we search through the parents as the
            // workflow may be selectively executed. Note we _always_ check the commit passed in first,
            // which may be one that's older than an hour ago but that we just triggered a workflow on.
            const commit = commits.find((c) => c.sha === shaToCheck);
            if (!commit) {
                // This must mean the commit is older than an hour ago, so we can stop searching.
                return undefined;
            }
            if (commit.parents.length === 0) {
                // We've reached the root commit, so we can stop searching.
                return undefined;
            }
            shaToCheck = commit.parents[0].sha;
        }
        return undefined;
    }
    catch (err) {
        logger.warn(`Encountered an error while searching for a pending workflow run: ${err}`);
        return undefined;
    }
};
const isPendingStatus = (status) => {
    return ["in_progress", "queued", "requested", "waiting"].some((pending) => pending === status);
};
const delay = async (delay) => {
    return new Promise((resolve) => setTimeout(resolve, delay.toMillis()));
};

const WORKFLOW_RUN_COMPLETION_TIMEOUT_ON_PULL_REQUEST = luxon.Duration.fromObject({
    minutes: 30,
});
luxon.Duration.fromObject({
    minutes: 10,
});
const POLL_FOR_BASE_TEST_RUN_INTERVAL = luxon.Duration.fromObject({
    seconds: 10,
});
const safeEnsureBaseTestsExists = async (...params) => {
    try {
        return await ensureBaseTestsExists(...params);
    }
    catch (error) {
        params[0].logger.error(error);
        const message = `Error while running tests on base ${params[0].base}. No diffs will be reported for this run.`;
        params[0].logger.warn(message);
        core.warning(message);
        return { baseTestRunExists: false };
    }
};
const ensureBaseTestsExists = async ({ event, base, // from the PR event
context, octokit, getBaseTestRun, logger, }) => {
    if (!base) {
        return { baseTestRunExists: false };
    }
    const testRun = await getBaseTestRun({ baseSha: base });
    if (testRun != null) {
        logger.info(`Tests already exist for commit ${base} (${testRun.id})`);
        return { baseTestRunExists: true };
    }
    return await tryTriggerTestsWorkflowOnBase({
        logger,
        event,
        base,
        context,
        octokit,
    });
};
const tryTriggerTestsWorkflowOnBase = async (opts) => {
    let isDone = false;
    const isCancelled = () => {
        return isDone;
    };
    const workflowRunPromise = waitOnWorkflowRun(opts, isCancelled);
    if (!opts.getBaseTestRun) {
        return workflowRunPromise;
    }
    const baseTestRunPromise = waitOnBaseTestRun(opts.getBaseTestRun, isCancelled);
    const result = await Promise.race([workflowRunPromise, baseTestRunPromise]);
    isDone = true;
    return result;
};
const waitOnWorkflowRun = async (opts, isCancelled) => {
    const { logger, event, base, context, octokit } = opts;
    const { owner, repo } = context.repo;
    const { workflowId } = await getCurrentWorkflowId({ context, octokit });
    const alreadyPending = await getPendingWorkflowRun({
        owner,
        repo,
        workflowId,
        commitSha: base,
        octokit,
        logger,
    });
    if (alreadyPending != null) {
        logger.info(`Waiting on workflow run on base commit (${base}) to compare against: ${alreadyPending.html_url}`);
        if (event.type === "pull_request") {
            await waitForWorkflowCompletionAndThrowIfFailed({
                owner,
                repo,
                workflowRunId: alreadyPending.workflowRunId,
                octokit,
                commitSha: base,
                timeout: WORKFLOW_RUN_COMPLETION_TIMEOUT_ON_PULL_REQUEST,
                isCancelled,
                logger,
            });
            return { baseTestRunExists: true };
        }
        // If we are not a PR event, then it's unlikely anyone will be looking at the comparisons. However,
        // it is very possible that someone is waiting for _us_ to complete. So let's not delay the workflow
        // and let's proceed without a base test run, skipping comparisons.
        return { baseTestRunExists: false };
    }
    // Running missing tests on base is only supported for Pull Request events
    if (event.type !== "pull_request") {
        return { baseTestRunExists: false };
    }
    // We can only trigger a workflow_run against the head of the base branch
    // This will give some spurious diffs if it's different from `base`, but it's the best we can do
    const baseRef = event.payload.pull_request.base.ref;
    logger.debug(JSON.stringify({ base, baseRef }, null, 2));
    const currentBaseSha = await getHeadCommitForRef({
        owner,
        repo,
        ref: baseRef,
        octokit,
        logger,
    });
    logger.debug(JSON.stringify({ owner, repo, base, baseRef, currentBaseSha }, null, 2));
    if (base !== currentBaseSha) {
        const message = `Meticulous tests on base commit ${base} haven't started running so we have nothing to compare against.
    In addition we were not able to trigger a run on ${base} since the '${baseRef}' branch is now pointing to ${currentBaseSha}.
    Therefore no diffs will be reported for this run. Re-running the tests may fix this.`;
        logger.warn(message);
        core.warning(message);
        return { baseTestRunExists: false };
    }
    const workflowRun = await startNewWorkflowRun({
        owner,
        repo,
        workflowId,
        ref: baseRef,
        commitSha: base,
        octokit,
        logger,
    });
    if (workflowRun == null) {
        const message = `Warning: Could not retrieve dispatched workflow run. Will not perform diffs against ${base}.`;
        logger.warn(message);
        core.warning(message);
        return { baseTestRunExists: false };
    }
    logger.info(`Waiting on workflow run: ${workflowRun.html_url}`);
    await waitForWorkflowCompletionAndThrowIfFailed({
        owner,
        repo,
        workflowRunId: workflowRun.workflowRunId,
        octokit,
        commitSha: base,
        timeout: WORKFLOW_RUN_COMPLETION_TIMEOUT_ON_PULL_REQUEST,
        isCancelled,
        logger,
    });
    return { baseTestRunExists: true };
};
const waitOnBaseTestRun = async (getBaseTestRun, isCancelled) => {
    let baseTestRun = await getBaseTestRun();
    while (!baseTestRun) {
        if (isCancelled()) {
            return { baseTestRunExists: false };
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_FOR_BASE_TEST_RUN_INTERVAL.as("milliseconds")));
        baseTestRun = await getBaseTestRun();
    }
    return { baseTestRunExists: true };
};
const waitForWorkflowCompletionAndThrowIfFailed = async ({ commitSha, ...otherOpts }) => {
    const finalWorkflowRun = await waitForWorkflowCompletion(otherOpts);
    if (finalWorkflowRun == null || isPendingStatus(finalWorkflowRun.status)) {
        throw new Error(`Timed out while waiting for workflow run (${otherOpts.workflowRunId}) to complete.`);
    }
    if (finalWorkflowRun.status !== "completed" ||
        finalWorkflowRun.conclusion !== "success") {
        throw new Error(`Comparing against visual snapshots taken on ${commitSha}, but the corresponding workflow run [${finalWorkflowRun.id}] did not complete successfully. See: ${finalWorkflowRun.html_url}`);
    }
};
const getHeadCommitForRef = async ({ owner, repo, ref, octokit, logger, }) => {
    try {
        const result = await octokit.rest.repos.getBranch({
            owner,
            repo,
            branch: ref,
        });
        const commitSha = result.data.commit.sha;
        return commitSha;
    }
    catch (err) {
        if (isGithubPermissionsError(err)) {
            // https://docs.github.com/en/rest/overview/permissions-required-for-github-apps?apiVersion=2022-11-28#repository-permissions-for-contents
            const detailedError = getDetailedGitHubPermissionsError(err, {
                operation: "get_branch"});
            throw new Error(`Missing permission to get the head commit of the branch '${ref}'. This is required in order to correctly calculate the two commits to compare.\n\n${detailedError}`);
        }
        logger.error(`Unable to get head commit of branch '${ref}'. This is required in order to correctly calculate the two commits to compare. ${DEFAULT_FAILED_OCTOKIT_REQUEST_MESSAGE}`);
        throw err;
    }
};

/**
 * Get the base commit that we should compare the visual snapshots against, and the head commit to associate
 * the status check with.
 *
 * WARNING: The head commit here is _not_ guaranteed to be the one we have the code for! For a PR checked out
 * in the default way it will be the head of the PR branch, but the code checked out will be the temporary
 * merge commit. If you need the actual commit that we have the code for, use the `getActualCommitShaFromRepo`
 * function.
 */
const getBaseAndHeadCommitShas = async (event, options, logger) => {
    if (event.type === "pull_request") {
        const head = event.payload.pull_request.head.sha;
        const base = event.payload.pull_request.base.sha;
        const baseRef = event.payload.pull_request.base.ref;
        return {
            base: (await tryGetMergeBaseOfTemporaryMergeCommit(head, base, baseRef, logger)) ?? base,
            head,
        };
    }
    if (event.type === "push") {
        return {
            base: event.payload.before,
            head: event.payload.after,
        };
    }
    if (event.type === "workflow_dispatch") {
        return {
            base: null,
            head: github.context.sha,
        };
    }
    return assertNever(event);
};
const assertNever = (event) => {
    throw new Error("Unexpected event: " + JSON.stringify(event));
};
const tryGetMergeBaseOfHeadCommit = (pullRequestHeadSha, pullRequestBaseSha, baseRef, logger) => {
    try {
        markGitDirectoryAsSafe();
        // Only a single commit is fetched by the checkout action by default
        // (https://github.com/actions/checkout#checkout-v3)
        // We therefore run fetch with the `--unshallow` param to fetch the whole branch/commit ancestor chains, which merge-base needs
        node_child_process.execSync(`git fetch origin ${pullRequestHeadSha} --unshallow`);
        node_child_process.execSync(`git fetch origin ${baseRef}`);
        const mergeBase = node_child_process.execSync(`git merge-base ${pullRequestHeadSha} origin/${baseRef}`)
            .toString()
            .trim();
        if (!isValidGitSha(mergeBase)) {
            // Note: the GITHUB_SHA is always a merge commit, even if the merge is a no-op because the PR is up to date
            // So this should never happen
            logger.error(`Failed to get merge base of ${pullRequestHeadSha} and ${baseRef}: value returned by 'git merge-base' was not a valid git SHA ('${mergeBase}').` +
                `Using the base of the pull request instead (${pullRequestBaseSha}).`);
            return null;
        }
        return mergeBase;
    }
    catch (error) {
        logger.error(`Failed to get merge base of ${pullRequestHeadSha} and ${baseRef}. Error: ${error}. Using the base of the pull request instead (${pullRequestBaseSha}).`);
        return null;
    }
};
/**
 * Get the actual commit SHA that we have the code for.
 */
const getActualCommitShaFromRepo = () => {
    return node_child_process.execSync("git rev-list --max-count=1 HEAD").toString().trim();
};
const tryGetMergeBaseOfTemporaryMergeCommit = (pullRequestHeadSha, pullRequestBaseSha, pullRequestBaseRef, logger) => {
    const mergeCommitSha = process.env.GITHUB_SHA;
    if (mergeCommitSha == null) {
        logger.error(`No GITHUB_SHA environment var set, so can't work out true base of the merge commit. Using the base of the pull request instead (${pullRequestBaseSha}).`);
        return null;
    }
    try {
        markGitDirectoryAsSafe();
        const headCommitSha = getActualCommitShaFromRepo();
        if (headCommitSha !== mergeCommitSha) {
            logger.info(`The head commit SHA (${headCommitSha}) does not equal GITHUB_SHA environment variable (${mergeCommitSha}).
          This is likely because a custom ref has been passed to the 'actions/checkout' action. We're assuming therefore
          that the head commit SHA is not a temporary merge commit, but rather the head of the branch. Therefore we're
          using the branching point of the PR branch to compare the visual snapshots against, and not the base
          of GitHub's temporary merge commit.`);
            return tryGetMergeBaseOfHeadCommit(headCommitSha, pullRequestBaseSha, pullRequestBaseRef, logger);
        }
        // The GITHUB_SHA is always a merge commit for PRs
        const parents = node_child_process.execSync(`git cat-file -p ${mergeCommitSha}`)
            .toString()
            .split("\n")
            .filter((line) => line.startsWith("parent "))
            .map((line) => line.substring("parent ".length).trim());
        if (parents.length !== 2) {
            // Note: the GITHUB_SHA is always a merge commit, even if the merge is a no-op because the PR is up to date
            // So this should never happen
            logger.error(`GITHUB_SHA (${mergeCommitSha}) is not a merge commit, so can't work out true base of the merge commit. Using the base of the pull request instead.`);
            return null;
        }
        // The first parent is always the base, and the second parent is the head of the PR
        const mergeBaseSha = parents[0];
        const mergeHeadSha = parents[1];
        if (mergeHeadSha !== pullRequestHeadSha) {
            logger.error(`The second parent (${parents[1]}) of the GITHUB_SHA merge commit (${mergeCommitSha}) is not equal to the head of the PR (${pullRequestHeadSha}),
        so can not confidently determine the base of the merge commit to compare against. Using the base of the pull request instead (${pullRequestBaseSha}).`);
            return null;
        }
        return mergeBaseSha;
    }
    catch (e) {
        logger.error(`Error getting base of merge commit (${mergeCommitSha}). Using the base of the pull request instead (${pullRequestBaseSha}).`, e);
        return null;
    }
};
const markGitDirectoryAsSafe = () => {
    // The .git directory is owned by a different user. By default git therefore won't let us
    // run git commands on it in case that user has inserted malicious code into the .git directory,
    // which gets executed when we run a git command. However we trust github to not do that, so can
    // mark this directory as safe.
    // See https://medium.com/@thecodinganalyst/git-detect-dubious-ownership-in-repository-e7f33037a8f for more details
    node_child_process.execSync(`git config --global --add safe.directory "${process.cwd()}"`);
};
const isValidGitSha = (sha) => {
    return /^[a-f0-9]{40}$/.test(sha);
};

const getCodeChangeEvent = (eventName, payload) => {
    if (eventName === "push") {
        return { type: "push", payload: payload };
    }
    if (eventName === "pull_request") {
        return { type: "pull_request", payload: payload };
    }
    if (eventName === "workflow_dispatch") {
        return {
            type: "workflow_dispatch",
            payload: payload,
        };
    }
    return null;
};

const getOctokitOrFail = (githubToken) => {
    if (githubToken == null) {
        throw new Error("github-token is required");
    }
    try {
        return github.getOctokit(githubToken);
    }
    catch (err) {
        const logger = log.getLogger(common.METICULOUS_LOGGER_NAME);
        logger.error(err);
        throw new Error("Error connecting to GitHub. Did you specify a valid 'github-token'?");
    }
};

/**
 * Enriches Sentry context with GitHub Actions environment information
 * This should be called at the start of each workflow after Sentry is initialized
 */
function enrichSentryContextWithGitHubActionsContext() {
    try {
        const { GITHUB_REPOSITORY, GITHUB_RUN_ID, GITHUB_RUN_NUMBER, GITHUB_WORKFLOW, GITHUB_ACTION, GITHUB_ACTOR, GITHUB_REF, GITHUB_SHA, RUNNER_OS, RUNNER_ARCH, } = process.env;
        Sentry__namespace.setTags({
            github_repository: GITHUB_REPOSITORY,
            github_workflow: GITHUB_WORKFLOW,
            github_run_id: GITHUB_RUN_ID,
            runner_os: RUNNER_OS,
            runner_arch: RUNNER_ARCH,
        });
        Sentry__namespace.setContext("github_action", {
            repository: GITHUB_REPOSITORY,
            run_id: GITHUB_RUN_ID,
            run_number: GITHUB_RUN_NUMBER,
            workflow: GITHUB_WORKFLOW,
            action: GITHUB_ACTION,
            actor: GITHUB_ACTOR,
            ref: GITHUB_REF,
            sha: GITHUB_SHA,
        });
    }
    catch (e) {
        console.debug("Error enriching Sentry context with GitHub Actions context", e);
    }
}

const getUploadAssetsInputs = () => {
    const apiToken = core.getInput("api-token", { required: true });
    const githubToken = core.getInput("github-token", { required: true });
    const appDirectory = core.getInput("app-directory", { required: true });
    const rewrites = JSON.parse(core.getInput("rewrites") || "[]");
    if (!Array.isArray(rewrites)) {
        throw new Error("Rewrites must be an array");
    }
    for (const rule of rewrites) {
        if (typeof rule !== "object" || rule === null) {
            throw new Error("Each rewrite rule must be an object");
        }
        if (typeof rule.source !== "string") {
            throw new Error("Each rewrite rule must have a string 'source' property");
        }
        if (typeof rule.destination !== "string") {
            throw new Error("Each rewrite rule must have a string 'destination' property");
        }
    }
    return {
        apiToken,
        githubToken,
        appDirectory,
        rewrites,
    };
};

const runMeticulousUploadAssetsAction = async () => {
    const logger = initLogger();
    await sentry.initSentry("report-diffs-action-upload-assets-v1", 1.0);
    enrichSentryContextWithGitHubActionsContext();
    const exitCode = await Sentry__namespace.startSpan({
        name: "report-diffs-action.runMeticulousUploadAssetsAction",
        op: "report-diffs-action.runMeticulousUploadAssetsAction",
    }, async (span) => {
        try {
            const { apiToken, githubToken, appDirectory, rewrites } = getUploadAssetsInputs();
            const event = getCodeChangeEvent(github.context.eventName, github.context.payload);
            const octokit = getOctokitOrFail(githubToken);
            if (event == null) {
                logger.error(`Running this Action is only supported for 'push', \
            'pull_request' and 'workflow_dispatch' events, but was triggered \
            on a '${github.context.eventName}' event. Skipping execution.`);
                return;
            }
            const { base } = await getBaseAndHeadCommitShas(event, { useDeploymentUrl: false }, logger);
            await safeEnsureBaseTestsExists({
                event,
                apiToken,
                base,
                context: github.context,
                octokit,
                getBaseTestRun: async ({ baseSha }) => await client.getLatestTestRunResults({
                    client: client.createClient({ apiToken }),
                    commitSha: baseSha,
                    // We deliberately don't filter by environment version here because when static assets are uploaded,
                    // the backend can trigger a re-run. So we don't care whether we have a valid base now,
                    // just whether the commit was tested at some point which means we have the assets.
                }),
                logger,
            });
            logger.info(`Uploading assets from directory: ${appDirectory}`);
            await remoteReplayLauncher.uploadAssetsAndTriggerTestRun({
                apiToken,
                appDirectory,
                commitSha: getActualCommitShaFromRepo(),
                rewrites,
                waitForBase: false,
            });
            span.setStatus({ code: 1, message: "ok" });
            return 0;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : `${error}`;
            core.setFailed(message);
            span.setStatus({ code: 2, message: "unknown_error" });
            return 1;
        }
    });
    await Sentry__namespace.getClient()?.close(5000);
    process.exit(exitCode);
};

runMeticulousUploadAssetsAction().catch(async (error) => {
    // Capture unexpected errors
    Sentry__namespace.captureException(error);
    const message = error instanceof Error ? error.message : `${error}`;
    core.setFailed(message);
    await Sentry__namespace.flush(5000); // Wait for Sentry to flush before exiting
    process.exit(1);
});
