'use strict';

require('source-map-support/register');
var core = require('@actions/core');
var Sentry = require('@sentry/node');
var client = require('@alwaysmeticulous/client');
var common = require('@alwaysmeticulous/common');
var log = require('loglevel');
require('loglevel-plugin-prefix');
var github = require('@actions/github');
var node_child_process = require('node:child_process');
var Joi = require('joi');
var YAML = require('yaml');

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

const runPostStep = async ({ apiToken, githubToken, testSuiteOrProjectId, shouldHaveComment, headSha, }) => {
    const octokit = getOctokitOrFail(githubToken);
    const workflow = await octokit.rest.actions.getWorkflowRun({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        run_id: github.context.runId,
    });
    const values = {
        "report_diffs_action.was_cancelled": workflow.data.status === "cancelled" ? 1 : 0,
    };
    // workflow.data.run_started_at should always be set since the workflow is running, but we need to make the compiler happy
    const workflowStartTime = new Date();
    if (workflow.data.run_started_at) {
        workflowStartTime.setTime(new Date(workflow.data.run_started_at).getTime());
        const timeSinceStart = new Date().getTime() - new Date(workflow.data.run_started_at).getTime();
        values["report_diffs_action.job_duration_seconds"] = timeSinceStart / 1000;
    }
    if (github.context.payload.pull_request?.number && shouldHaveComment) {
        const prComments = await octokit.rest.issues.listComments({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.payload.pull_request.number,
            per_page: 1000,
        });
        values["report_diffs_action.saw_comment"] = prComments.data.some((c) => isPrCommentFromAction({
            prComment: c,
            testSuiteOrProjectId,
            workflowStartTime,
        }))
            ? 1
            : 0;
    }
    const client$1 = client.createClient({ apiToken });
    await client.emitTelemetry({
        client: client$1,
        values,
        ...(headSha ? { commitSha: headSha } : {}),
    });
};
const isPrCommentFromAction = ({ prComment, testSuiteOrProjectId, workflowStartTime, }) => {
    if (!prComment.body) {
        return false;
    }
    return (prComment.body?.includes(getCommentIdentifier(testSuiteOrProjectId)) &&
        new Date(prComment.updated_at).getTime() >= workflowStartTime.getTime());
};
const getCommentIdentifier = (testSuiteOrProjectId) => {
    return `<!--- alwaysmeticulous/report-diffs-action/status-comment/${testSuiteOrProjectId}`;
};

/**
 * Get the actual commit SHA that we have the code for.
 */
const getActualCommitShaFromRepo = () => {
    return node_child_process.execSync("git rev-list --max-count=1 HEAD").toString().trim();
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

const runCloudComputePostStep = async () => {
    const logger = initLogger();
    const { projectTargets, githubToken, headSha: headShaFromInput, } = getInCloudActionInputs();
    const headSha = await getHeadCommitSha({
        headShaFromInput,
        logger,
    });
    const projectTargetsToRun = projectTargets.filter((target) => !target.skip);
    await Promise.all(projectTargetsToRun.map(async (target) => {
        const client$1 = client.createClient({ apiToken: target.apiToken });
        const project = await client.getProject(client$1);
        if (!project) {
            throw new Error(`Project for target ${target.name} not found.`);
        }
        return runPostStep({
            apiToken: target.apiToken,
            githubToken,
            testSuiteOrProjectId: project.id,
            shouldHaveComment: true,
            ...(headSha.type === "success" ? { headSha: headSha.sha } : {}),
        });
    }));
};

runCloudComputePostStep().catch(async (error) => {
    // Capture unexpected errors
    Sentry__namespace.captureException(error);
    // We're just emitting telemetry in this post step, so log a warning but don't fail
    const message = error instanceof Error ? error.message : `${error}`;
    core.warning(message);
    await Sentry__namespace.flush(5000); // Wait for Sentry to flush before exiting
});
