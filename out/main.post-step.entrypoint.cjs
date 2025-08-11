'use strict';

require('source-map-support/register');
var core = require('@actions/core');
var Sentry = require('@sentry/node');
var github = require('@actions/github');
var client = require('@alwaysmeticulous/client');
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

const getInputFromEnv = ({ name, required, type, }) => {
    const environmentVariableName = name.toUpperCase().replaceAll("-", "_");
    const rawValue = process.env[environmentVariableName];
    if ((type === "string" || type === "string-array") &&
        rawValue === "" &&
        !required) {
        return null;
    }
    const value = parseValue(rawValue, type);
    if (required && value == null) {
        throw new Error(`Input ${name} is required`);
    }
    if (required && isEmpty(value) && type !== "string-array") {
        throw new Error(`Input ${name} is required`);
    }
    if (value != null && typeof value !== expectedValueType(type)) {
        throw new Error(`Expected ${type} for input ${name}, but got ${typeof value}`);
    }
    // Typescript can't infer that if type === number value is a number etc., so
    // so we need to force cast here
    return value;
};
const parseValue = (value, type) => {
    if (value == null) {
        return null;
    }
    if (type === "string") {
        return value;
    }
    if (type === "string-array") {
        // Support both new line and , delimited lists
        // The built-in Github actions generally use new line delimited lists: https://github.com/actions/cache/blob/940f3d7cf195ba83374c77632d1e2cbb2f24ae68/src/utils/actionUtils.ts#L33
        // But some third-party Github actions use comma seperated lists
        if (value.indexOf("\n") === -1) {
            return value
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s !== "");
        }
        return value
            .split("\n")
            .map((s) => s.trim())
            .filter((s) => s !== "");
    }
    if (type === "int") {
        const parsed = Number.parseInt(value);
        if (isNaN(parsed)) {
            return null;
        }
        return parsed;
    }
    if (type === "float") {
        const parsed = Number.parseFloat(value);
        if (isNaN(parsed)) {
            return null;
        }
        return parsed;
    }
    if (type === "boolean") {
        if (value === "") {
            return null;
        }
        if (value !== "true" && value !== "false") {
            throw new Error("Boolean inputs must be equal to the string 'true' or the string 'false'");
        }
        return value === "true";
    }
    return unknownType(type);
};
const unknownType = (type) => {
    throw new Error(`Only string or number inputs currently supported, but got ${type}`);
};
const isEmpty = (value) => {
    if (value == null) {
        return true;
    }
    if (typeof value === "string") {
        return value.length === 0;
    }
    return false;
};
const expectedValueType = (type) => {
    if (type === "string-array") {
        return "object";
    }
    if (type === "string") {
        return "string";
    }
    if (type === "int") {
        return "number";
    }
    if (type === "float") {
        return "number";
    }
    if (type === "boolean") {
        return "boolean";
    }
    return unknownType(type);
};

const getMainActionInputs = () => {
    // The names, required value, and types should match that in action.yml
    const apiToken = getInputFromEnv({
        name: "api-token",
        required: true,
        type: "string",
    });
    const githubToken = getInputFromEnv({
        name: "github-token",
        required: true,
        type: "string",
    });
    const appUrl = getInputFromEnv({
        name: "app-url",
        required: false,
        type: "string",
    });
    const testsFile = getInputFromEnv({
        name: "tests-file",
        required: false,
        type: "string",
    });
    const maxRetriesOnFailure = getInputFromEnv({
        name: "max-retries-on-failure",
        required: true,
        type: "int",
    });
    const parallelTasks = getInputFromEnv({
        name: "parallel-tasks",
        required: false,
        type: "int",
    });
    const localhostAliases = getInputFromEnv({
        name: "localhost-aliases",
        required: false,
        type: "string",
    });
    const maxAllowedColorDifference = getInputFromEnv({
        name: "max-allowed-color-difference",
        required: true,
        type: "float",
    });
    const maxAllowedProportionOfChangedPixels = getInputFromEnv({
        name: "max-allowed-proportion-of-changed-pixels",
        required: true,
        type: "float",
    });
    const useDeploymentUrl = getInputFromEnv({
        name: "use-deployment-url",
        required: true,
        type: "boolean",
    });
    const testSuiteId = getInputFromEnv({
        name: "test-suite-id",
        required: false,
        type: "string",
    });
    const allowedEnvironments = getInputFromEnv({
        name: "allowed-environments",
        required: false,
        type: "string-array",
    });
    const additionalPorts = getInputFromEnv({
        name: "additional-ports",
        required: false,
        type: "string",
    });
    if (appUrl != null && appUrl != "" && useDeploymentUrl === true) {
        throw new Error("Cannot use both app-url and use-deployment-url");
    }
    if (!useDeploymentUrl && allowedEnvironments != null) {
        throw new Error("allowed-environments can only be used when use-deployment-url is true. Please set use-deployment-url to true to run the tests " +
            "against a deployment URL, and then set allowed-environments to specify which environment to test against.");
    }
    if (allowedEnvironments != null && allowedEnvironments.length === 0) {
        throw new Error("allowed-environments cannot be empty. Please either omit it as an input or specify at least one environment to test against.");
    }
    return {
        apiToken,
        githubToken,
        appUrl,
        testsFile,
        maxRetriesOnFailure,
        parallelTasks,
        localhostAliases,
        maxAllowedColorDifference,
        maxAllowedProportionOfChangedPixels,
        useDeploymentUrl,
        testSuiteId,
        allowedEnvironments,
        additionalPorts,
    };
};

const runMainActionPostStep = async () => {
    const { apiToken, githubToken, testSuiteId } = getMainActionInputs();
    return runPostStep({
        apiToken,
        githubToken,
        testSuiteOrProjectId: testSuiteId,
        shouldHaveComment: true,
    });
};

runMainActionPostStep().catch(async (error) => {
    // Capture unexpected errors
    Sentry__namespace.captureException(error);
    // We're just emitting telemetry in this post step, so log a warning but don't fail
    const message = error instanceof Error ? error.message : `${error}`;
    core.warning(message);
    await Sentry__namespace.flush(5000); // Wait for Sentry to flush before exiting
});
