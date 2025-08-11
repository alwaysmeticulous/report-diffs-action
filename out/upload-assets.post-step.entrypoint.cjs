'use strict';

var core = require('@actions/core');
var Sentry = require('@sentry/node');
var client = require('@alwaysmeticulous/client');
var github = require('@actions/github');
var common = require('@alwaysmeticulous/common');
var log = require('loglevel');

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
    if (github.context.payload.pull_request?.number && shouldHaveComment) ;
    const client$1 = client.createClient({ apiToken });
    await client.emitTelemetry({
        client: client$1,
        values,
        ...(headSha ? { commitSha: headSha } : {}),
    });
};

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

const runUploadAssetsPostStep = async () => {
    const { apiToken, githubToken } = getUploadAssetsInputs();
    const client$1 = client.createClient({ apiToken });
    const project = await client.getProject(client$1);
    if (!project) {
        throw new Error("Project not found!");
    }
    return runPostStep({
        apiToken,
        githubToken,
        testSuiteOrProjectId: project.id,
        shouldHaveComment: false,
    });
};

runUploadAssetsPostStep().catch(async (error) => {
    // Capture unexpected errors
    Sentry__namespace.captureException(error);
    // We're just emitting telemetry in this post step, so log a warning but don't fail
    const message = error instanceof Error ? error.message : `${error}`;
    core.warning(message);
    await Sentry__namespace.flush(5000); // Wait for Sentry to flush before exiting
});
