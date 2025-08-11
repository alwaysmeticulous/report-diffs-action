'use strict';

var core = require('@actions/core');
var Sentry = require('@sentry/node');
var sentry = require('@alwaysmeticulous/sentry');
var common = require('@alwaysmeticulous/common');
var log = require('loglevel');
var prefix = require('loglevel-plugin-prefix');
var node_child_process = require('node:child_process');
var github = require('@actions/github');
var Joi = require('joi');
var YAML = require('yaml');
var client = require('@alwaysmeticulous/client');
var remoteReplayLauncher = require('@alwaysmeticulous/remote-replay-launcher');
var retry = require('retry');
var luxon = require('luxon');

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
var retry__namespace = /*#__PURE__*/_interopNamespaceDefault(retry);

const getPrefixedLogger = (logPrefix) => {
    const prefixedLogger = log.getLogger(`${common.METICULOUS_LOGGER_NAME}/${logPrefix}`);
    prefixedLogger.setLevel(+(process.env["RUNNER_DEBUG"] ?? "0") ? log.levels.TRACE : log.levels.INFO);
    prefix.reg(log);
    prefix.apply(prefixedLogger, {
        template: `[${logPrefix}] %l:`,
    });
    return prefixedLogger;
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

/*
 * Computes the HEAD commit SHA to use when creating a test run.

 * In a PR workflow this will by default be process.env.GITHUB_SHA (the temporary merge commit) or
 * sometimes the head commit of the PR.
 * Users can also explicitly provide the head commit SHA to use as input. This is useful when the action is not
 * run with the code checked out.
 * Our backend is responsible for computing the correct BASE commit to create the test run for.
 */
const getHeadCommitSha = async ({ headShaFromInput, logger, }) => {
    if (headShaFromInput != null && headShaFromInput.length > 0) {
        return { type: "success", sha: headShaFromInput };
    }
    try {
        return { type: "success", sha: await getActualCommitShaFromRepo() };
    }
    catch (error) {
        logger.error(`Failed to get HEAD commit SHA from repo. Error: ${error}. Reporting telemetry without a HEAD commit SHA.`);
        return { type: "error", error };
    }
};

const projectTargetSchema = Joi.object({
    "app-url": Joi.string().required(),
    "api-token": Joi.string().required(),
    skip: Joi.boolean().default(false).optional().label("skip"),
});
const projectsYamlSchema = Joi.object().pattern(Joi.string(), projectTargetSchema);
const parseProjectsYaml = (projectsYaml) => {
    const data = YAML.parse(projectsYaml);
    // Validate the parsed projects data.
    const { error, value } = projectsYamlSchema.validate(data, {
        abortEarly: false,
    });
    if (error) {
        throw new Error(`Invalid projects-yaml: ${error.message}`);
    }
    return Object.entries(value).map(([name, project]) => ({
        name,
        apiToken: project["api-token"],
        appUrl: project["app-url"],
        skip: project.skip,
    }));
};

const getInCloudActionInputs = () => {
    // The names, required value, and types should match that in action.yml
    const apiToken = core.getInput("api-token", { required: false });
    const githubToken = core.getInput("github-token", { required: true });
    const appUrl = core.getInput("app-url", { required: false });
    const headSha = core.getInput("head-sha");
    const secureTunnelHost = core.getInput("secure-tunnel-host", { required: false });
    const proxyAllUrls = core.getBooleanInput("proxy-all-urls", { required: false });
    const rewriteHostnameToAppUrl = core.getBooleanInput("rewrite-hostname-to-app-url", { required: false });
    const projectsYaml = core.getInput("projects-yaml", { required: false });
    if (projectsYaml) {
        if (apiToken || appUrl) {
            throw new Error("Cannot provide both 'projects-yaml' and 'api-token' or 'app-url'");
        }
        const projectTargets = parseProjectsYaml(projectsYaml);
        return {
            githubToken,
            headSha,
            projectTargets,
            secureTunnelHost,
            proxyAllUrls,
            rewriteHostnameToAppUrl,
        };
    }
    if (!apiToken || !appUrl) {
        throw new Error("Must provide either 'projects-yaml' or 'api-token' and 'app-url'");
    }
    return {
        githubToken,
        headSha,
        projectTargets: [
            {
                name: "default",
                apiToken,
                appUrl,
                skip: false,
            },
        ],
        secureTunnelHost,
        proxyAllUrls,
        rewriteHostnameToAppUrl,
    };
};

const throwIfCannotConnectToOrigin = async (appUrl) => {
    // Wait 1s, 2s, 4s, 8s, 16s, 32s, 64s for a total of just over 2 minutes
    const operation = retry__namespace.operation({
        retries: 7,
        factor: 2,
        minTimeout: 1000,
    });
    const url = new URL(appUrl);
    return new Promise((resolve, reject) => {
        operation.attempt(async () => {
            if (await canConnectTo(url)) {
                resolve();
                return;
            }
            const err = new Error(`Could not connect to '${appUrl}'. Please check:\n\n` +
                `1. The server running at '${appUrl}' has fully started by the time the Meticulous action starts. You may need to add a 'sleep 30' after starting the server to ensure that this is the case.\n` +
                `2. The server running at '${appUrl}' is using tcp instead of tcp6. You can use 'netstat -tulpen' to see what addresses and ports it is bound to.\n\n`);
            if (!operation.retry(err)) {
                reject(operation.mainError());
            }
        });
    });
};
const canConnectTo = async (url) => {
    try {
        const result = await fetchWithTimeout(url);
        return result.status !== 502;
    }
    catch (error) {
        return false;
    }
};
async function fetchWithTimeout(url) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, {
        signal: controller.signal,
    });
    clearTimeout(id);
    return response;
}

const METICULIOUS_APP_URL = "https://app.meticulous.ai";
const DOCS_URL = `${METICULIOUS_APP_URL}/docs/github-actions-v2`;
const METICULOUS_DEBUGGING_PR_TAG = "[meticulous debug]";

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

const SHORT_SHA_LENGTH = 7;
const shortCommitSha = (sha) => sha.substring(0, SHORT_SHA_LENGTH);

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

/**
 * Returns true if the running context is a debug PR test run.
 */
const isDebugPullRequestRun = (event) => {
    return (!!event &&
        event.type === "pull_request" &&
        event.payload.pull_request.title
            .toLowerCase()
            .includes(METICULOUS_DEBUGGING_PR_TAG));
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

const getMeticulousCommentIdentifier = (testSuiteId) => `<!--- alwaysmeticulous/report-diffs-action/status-comment${testSuiteId ? "/" + testSuiteId : ""} -->`;
const updateStatusComment = async ({ octokit, event, owner, repo, body, shortHeadSha, testSuiteId, createIfDoesNotExist, logger, }) => {
    if (event.type !== "pull_request") {
        return;
    }
    // Check for existing comments
    try {
        const comments = await octokit.rest.issues.listComments({
            owner,
            repo,
            issue_number: event.payload.pull_request.number,
            per_page: 1000,
        });
        const commentIdentifier = getMeticulousCommentIdentifier(testSuiteId);
        const existingComment = comments.data.find((comment) => (comment.body ?? "").indexOf(commentIdentifier) > -1);
        const testSuiteDescription = testSuiteId
            ? `Test suite: ${testSuiteId}. `
            : "";
        const fullBody = `${body}\n\n<sub>${testSuiteDescription}Last updated for commit ${shortHeadSha}. This comment will update as new commits are pushed.</sub>${commentIdentifier}`;
        if (existingComment != null) {
            await octokit.rest.issues.updateComment({
                owner,
                repo,
                comment_id: existingComment.id,
                body: fullBody,
            });
        }
        else if (createIfDoesNotExist) {
            await octokit.rest.issues.createComment({
                owner,
                repo,
                issue_number: event.payload.pull_request.number,
                body: fullBody,
            });
        }
    }
    catch (err) {
        if (isGithubPermissionsError(err)) {
            // https://docs.github.com/en/rest/overview/permissions-required-for-github-apps?apiVersion=2022-11-28#repository-permissions-for-pull-requests
            const detailedError = getDetailedGitHubPermissionsError(err, {
                operation: "comment"});
            throw new Error(`Missing permission to list and post comments to the pull request #${event.payload.pull_request.number}.\n\n${detailedError}`);
        }
        logger.error(`Unable to post / update comment on PR #${event.payload.pull_request.number}. ${DEFAULT_FAILED_OCTOKIT_REQUEST_MESSAGE}`);
        throw err;
    }
};

const DEBUG_MODE_KEEP_TUNNEL_OPEN_DURATION = luxon.Duration.fromObject({
    minutes: 45,
});

const getCloudComputeBaseTestRun = async ({ apiToken, headCommitSha, }) => {
    const client$1 = client.createClient({ apiToken });
    return await client.getGitHubCloudReplayBaseTestRun({
        client: client$1,
        headCommitSha,
    });
};

const getPullRequestId = (event) => {
    if (!event || event.type !== "pull_request") {
        return null;
    }
    return event.payload.pull_request.number.toString();
};

const runOneTestRun = async ({ apiToken, appUrl, testRunId, githubToken, headSha, isSingleTestRunExecution, secureTunnelHost, proxyAllUrls, rewriteHostnameToAppUrl, }) => {
    const { payload } = github.context;
    const event = getCodeChangeEvent(github.context.eventName, payload);
    const { owner, repo } = github.context.repo;
    const pullRequestId = getPullRequestId(event);
    const isDebugPRRun = isDebugPullRequestRun(event);
    const octokit = getOctokitOrFail(githubToken);
    const logger = isSingleTestRunExecution
        ? log.getLogger(common.METICULOUS_LOGGER_NAME)
        : getPrefixedLogger(`Test Run ${testRunId}`);
    const apiClient = client.createClient({
        apiToken,
    });
    const project = await client.getProject(apiClient);
    if (!project) {
        throw new Error(`Could not retrieve project data${isSingleTestRunExecution ? "" : ` for project ${testRunId}`}. Is the API token correct?`);
    }
    logger.info(`Running tests for project ${project.organization.name}/${project.name} against app URL '${appUrl}' ${isSingleTestRunExecution ? "" : ` (test run ID ${testRunId})`}...`);
    if (event == null) {
        logger.warn(`Running report-diffs-action is only supported for 'push', \
      'pull_request' and 'workflow_dispatch' events, but was triggered \
      on a '${github.context.eventName}' event. Skipping execution.`);
        return;
    }
    // TODO: Remove me
    logger.warn("Head commit SHA: ", headSha);
    // Compute the base commit SHA to compare to for the HEAD commit.
    // This will usually be the merge base of the PR head and base commit. In some cases it can be an older main branch commit,
    // for example when running in a monorepo setup.
    const { baseCommitSha, baseTestRun } = await getCloudComputeBaseTestRun({
        apiToken,
        headCommitSha: headSha,
    });
    let shaToCompareAgainst = null;
    if (baseTestRun != null) {
        shaToCompareAgainst = baseCommitSha;
        logger.info(`Tests already exist for commit ${baseCommitSha} (${baseTestRun.id})`);
    }
    else {
        // We compute and use the base SHA from the code change event rather than the `baseCommitSha` computed above
        // as `tryTriggerTestsWorkflowOnBase` can only trigger workflow for the HEAD `main` branch commit.
        // `baseCommitSha` can be an older commit in a monorepo setup (in cases where we selectively run tests for a specific package).
        // In such cases we won't be able to trigger a workflow for the base commit SHA provided by the backend.
        // We will instead trigger test run for a newer base which is the base commit SHA from the code change event and
        // will use that as the base to compare against. This is safe as `codeChangeBase` is guaranteed to be the same
        // or newer commit to `baseCommitSha`.
        const { base: codeChangeBase } = await getBaseAndHeadCommitShas(event, {
            }, logger);
        if (codeChangeBase) {
            const { baseTestRunExists } = await tryTriggerTestsWorkflowOnBase({
                logger,
                event,
                base: codeChangeBase,
                getBaseTestRun: async () => {
                    const { baseTestRun } = await getCloudComputeBaseTestRun({
                        apiToken,
                        headCommitSha: headSha,
                    });
                    return baseTestRun;
                },
                context: github.context,
                octokit,
            });
            if (baseTestRunExists) {
                shaToCompareAgainst = codeChangeBase;
            }
        }
    }
    if (shaToCompareAgainst != null) {
        logger.info(`Comparing visual snapshots for the commit ${shortSha(headSha)}, against ${shortSha(shaToCompareAgainst)}`);
    }
    else {
        logger.info(`Generating visual snapshots for commit ${shortSha(headSha)}`);
    }
    await throwIfCannotConnectToOrigin(appUrl);
    const onTunnelCreated = ({ url, basicAuthUser, basicAuthPassword, }) => {
        logger.info(`Secure tunnel to ${appUrl} created: ${url}, user: ${basicAuthUser}, password: ${basicAuthPassword}`);
        if (isDebugPRRun) {
            updateStatusComment({
                octokit,
                event,
                owner,
                repo,
                body: `🤖 Meticulous is running in debug mode. Secure tunnel to ${appUrl} created: ${url} user: \`${basicAuthUser}\` password: \`${basicAuthPassword}\`.\n\n` +
                    `Tunnel will be live for up to ${DEBUG_MODE_KEEP_TUNNEL_OPEN_DURATION.toHuman()}. Cancel the workflow run to close the tunnel early.\n\n` +
                    `Please open this tunnel in your browser (and enter the username and password when prompted) and check that you are serving your application correctly.\n\n` +
                    `If you wish to run Meticulous tests locally against this tunnel using the Meticulous CLI then you can use the environment variables \`METICULOUS_TUNNEL_USERNAME\` and \`METICULOUS_TUNNEL_PASSWORD\`. For example:\n\n` +
                    `\`\`\`bash\n` +
                    `METICULOUS_TUNNEL_USERNAME="${basicAuthUser}" METICULOUS_TUNNEL_PASSWORD="${basicAuthPassword}" npx @alwaysmeticulous/cli simulate \\\n` +
                    `  --sessionId="<a session id to replay>" \\\n` +
                    `  --appUrl="${url}" \\\n` +
                    `  --apiToken="<your API token>"\n` +
                    `\`\`\`\n\n` +
                    `To find a test session to replay and to find your API token: visit the 'Selected Sessions' tab or 'All Sessions' tab on your [Meticulous project page](${METICULIOUS_APP_URL}), click on a session and select the 'Simulate' tab.`,
                testSuiteId: `__meticulous_debug_${testRunId}__`,
                shortHeadSha: shortCommitSha(headSha),
                createIfDoesNotExist: true,
                logger,
            }).catch((err) => {
                logger.error(err);
            });
        }
    };
    const keepTunnelOpenPromise = isDebugPRRun ? common.defer() : null;
    let keepTunnelOpenTimeout = null;
    let lastSeenNumberOfCompletedTestCases = 0;
    const onProgressUpdate = (testRun) => {
        if (!client.IN_PROGRESS_TEST_RUN_STATUS.includes(testRun.status) &&
            keepTunnelOpenPromise &&
            !keepTunnelOpenTimeout) {
            logger.info(`Test run execution completed. Keeping tunnel open for ${DEBUG_MODE_KEEP_TUNNEL_OPEN_DURATION.toHuman()}`);
            keepTunnelOpenTimeout = setTimeout(() => {
                keepTunnelOpenPromise.resolve();
            }, DEBUG_MODE_KEEP_TUNNEL_OPEN_DURATION.as("milliseconds"));
        }
        const numTestCases = testRun.configData.testCases?.length || 0;
        const completedTestCases = testRun.resultData?.results?.length || 0;
        if (completedTestCases != lastSeenNumberOfCompletedTestCases &&
            numTestCases) {
            logger.info(`Executed ${completedTestCases}/${numTestCases} test cases`);
            lastSeenNumberOfCompletedTestCases = completedTestCases;
        }
    };
    const onTunnelStillLocked = () => {
        logger.info("The test run has completed but additional tasks on the Meticulous platform are using this deployment, please keep this job running...");
    };
    const onTestRunCreated = (testRun) => {
        logger.info(`Test run created: ${testRun.url}`);
    };
    // We use MERGE_COMMIT_SHA as the deployment is created for the merge commit.
    await remoteReplayLauncher.executeRemoteTestRun({
        apiToken,
        appUrl,
        commitSha: headSha,
        environment: "github-actions",
        isLockable: true,
        proxyAllUrls,
        rewriteHostnameToAppUrl,
        onTunnelCreated,
        onTestRunCreated,
        onProgressUpdate,
        onTunnelStillLocked,
        ...(secureTunnelHost ? { secureTunnelHost } : {}),
        ...(keepTunnelOpenPromise
            ? { keepTunnelOpenPromise: keepTunnelOpenPromise.promise }
            : {}),
        ...(pullRequestId ? { pullRequestHostingProviderId: pullRequestId } : {}),
    });
};

const runMeticulousTestsCloudComputeAction = async () => {
    const logger = initLogger();
    // Init Sentry without sampling traces on the action run.
    // Children processes, (test run executions) will use
    // the global sample rate.
    await sentry.initSentry("report-diffs-action-cloud-compute-v1", 1.0);
    enrichSentryContextWithGitHubActionsContext();
    const failureMessage = await Sentry__namespace.startSpan({
        name: "report-diffs-action.runMeticulousTestsActionInCloud",
        op: "report-diffs-action.runMeticulousTestsActionInCloud",
    }, async (span) => {
        let failureMessage = "";
        const { projectTargets, headSha: headShaFromInput, githubToken, secureTunnelHost, proxyAllUrls, rewriteHostnameToAppUrl, } = getInCloudActionInputs();
        const headSha = await getHeadCommitSha({
            headShaFromInput,
            logger,
        });
        if (headSha.type === "error") {
            // We can't proceed if we don't know the commit SHA
            throw headSha.error;
        }
        const skippedTargets = projectTargets.filter((target) => target.skip);
        const projectTargetsToRun = projectTargets.filter((target) => !target.skip);
        // Single test run execution is a special case where we run a single test run with the "default" name.
        // This will be the case when the user provides `app-url` and `api-token` inputs directly.
        // This is used to simplify some of the logging and error handling.
        const isSingleTestRunExecution = projectTargets.length === 1 && projectTargets[0].name === "default";
        // Log skipped targets, if any
        if (skippedTargets.length > 0) {
            const skippedTargetNames = skippedTargets.map((target) => target.name);
            logger.info(`Skipping test runs for the following targets: ${skippedTargetNames.join(", ")}`);
        }
        (await Promise.allSettled(projectTargetsToRun.map((target) => runOneTestRun({
            testRunId: target.name,
            apiToken: target.apiToken,
            appUrl: target.appUrl,
            githubToken,
            headSha: headSha.sha,
            isSingleTestRunExecution,
            proxyAllUrls,
            rewriteHostnameToAppUrl,
            ...(secureTunnelHost ? { secureTunnelHost } : {}),
        }).catch((e) => {
            if (projectTargets.length > 1) {
                logger.error(`Failed to execute tests for ${target.name}`, e);
            }
            else {
                logger.error(e);
            }
            throw e;
        })))).forEach((result, index) => {
            if (result.status === "rejected") {
                const message = result.reason instanceof Error
                    ? result.reason.message
                    : `${result.reason}`;
                if (!isSingleTestRunExecution) {
                    failureMessage += `Test run ${projectTargetsToRun[index].name} failed: ${message}\n`;
                }
                else {
                    failureMessage = message;
                }
            }
        });
        if (failureMessage) {
            core.setFailed(failureMessage);
            span.setStatus({ code: 2, message: "unknown_error" });
            return failureMessage;
        }
        else {
            span.setStatus({ code: 1, message: "ok" });
        }
    });
    await Sentry__namespace.getClient()?.close(5000);
    process.exit(failureMessage ? 1 : 0);
};

runMeticulousTestsCloudComputeAction().catch(async (error) => {
    Sentry__namespace.captureException(error);
    const message = error instanceof Error ? error.message : `${error}`;
    core.setFailed(message);
    await Sentry__namespace.flush(5000); // Wait for Sentry to flush before exiting
    process.exit(1);
});
