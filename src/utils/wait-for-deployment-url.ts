import { GitHub } from "@actions/github/lib/utils";
import { Hub } from "@sentry/node";
import { Transaction } from "@sentry/types";
import { EXPECTED_PERMISSIONS_BLOCK } from "./constants";

const TIMEOUT_MS = 30 * 60 * 1_000; // 30 minutes
const MIN_POLL_FREQUENCY = 1_000;
const MAX_POLL_FREQUENCY = 10 * 1_000;

export const waitForDeploymentUrl = async ({
  owner,
  repo,
  commitSha,
  octokit,
  sentryHub,
  transaction,
  environmentName,
}: {
  owner: string;
  repo: string;
  commitSha: string;
  octokit: InstanceType<typeof GitHub>;
  sentryHub: Hub;
  transaction: Transaction;
  environmentName: string | null;
}): Promise<string> => {
  const waitForDeploymentSpan = transaction.startChild({
    op: "waitForDeployment",
  });
  const startTime = Date.now();
  let pollFrequency = MIN_POLL_FREQUENCY;
  while (Date.now() - startTime < TIMEOUT_MS) {
    const deploymentUrl = await getDeploymentUrl({
      owner,
      repo,
      commitSha,
      octokit,
      sentryHub,
      environmentName,
    });
    if (deploymentUrl != null) {
      console.log(`Testing against deployment URL '${deploymentUrl}'`);
      return deploymentUrl;
    }
    await new Promise((resolve) => setTimeout(resolve, pollFrequency));
    pollFrequency = Math.min(
      MAX_POLL_FREQUENCY,
      pollFrequency + MIN_POLL_FREQUENCY
    );
  }
  waitForDeploymentSpan.finish();
  throw new Error(
    `Timed out after waiting ${(TIMEOUT_MS / 1000).toFixed(
      0
    )} seconds for a deployment URL for commit ${commitSha}`
  );
};

const MAX_GITHUB_ALLOWED_PAGE_SIZE = 100;

const getDeploymentUrl = async ({
  owner,
  repo,
  commitSha,
  octokit,
  sentryHub,
  environmentName,
}: {
  owner: string;
  repo: string;
  commitSha: string;
  octokit: InstanceType<typeof GitHub>;
  sentryHub: Hub;
  environmentName: string | null;
}): Promise<string | null> => {
  let deployments: Awaited<
    ReturnType<typeof octokit.rest.repos.listDeployments>
  > | null = null;
  try {
    deployments = await octokit.rest.repos.listDeployments({
      owner,
      repo,
      sha: commitSha,
      per_page: MAX_GITHUB_ALLOWED_PAGE_SIZE,
    });
  } catch (err) {
    console.error("Error listing deployments", err);
  }

  if (deployments == null || deployments.status !== 200) {
    throw new Error(
      `Failed to list deployments for commit ${commitSha}.\n\n` +
        "Note: if using 'use-deployment-url' then you must provide permissions for the action to read deployments. " +
        "To do this edit the 'permissions:' block in your workflow file to include 'deployments: read'. Your permissions block should look like:\n\n" +
        EXPECTED_PERMISSIONS_BLOCK
    );
  }

  console.debug(`Found ${deployments.data.length} deployments`);

  if (hasMorePages(deployments)) {
    throw new Error(
      `More than ${MAX_GITHUB_ALLOWED_PAGE_SIZE} deployments found for commit ${commitSha}. Meticulous currently supports at most ${MAX_GITHUB_ALLOWED_PAGE_SIZE} deployments per commit.`
    );
  }

  sentryHub.captureEvent({
    message: "Found deployments",
    level: "debug",
    extra: {
      deployments: deployments.data.map((deployment) => ({
        id: deployment.id,
        environment: deployment.environment,
        original_environment: deployment.original_environment,
        production_environment: deployment.production_environment,
      })),
    },
  });

  const matchingDeployments = deployments.data.filter(
    (deployment) =>
      environmentName == null || deployment.environment === environmentName
  );

  if (matchingDeployments.length === 0) {
    return null;
  }
  if (matchingDeployments.length > 1) {
    if (environmentName == null) {
      const deploymentDescriptions = matchingDeployments.map(
        (deployment) =>
          `deployment ${deployment.id} (environment name: "${deployment.environment}", description: "${deployment.description}")`
      );
      throw new Error(
        `More than one deployment found for commit ${commitSha}: ${deploymentDescriptions.join(
          ", "
        )}. Please specify an environment name using the 'environment-to-test' input.`
      );
    } else {
      throw new Error(
        `More than one deployment found for commit ${commitSha} with environment ${environmentName}.`
      );
    }
  }

  const matchingDeployment = matchingDeployments[0];

  console.debug(`Checking status of deployment ${matchingDeployment.id}`);

  const deploymentStatuses = await octokit.rest.repos.listDeploymentStatuses({
    owner,
    repo,
    deployment_id: matchingDeployment.id,
    per_page: MAX_GITHUB_ALLOWED_PAGE_SIZE,
  });

  if (hasMorePages(deploymentStatuses)) {
    throw new Error(
      `More than ${MAX_GITHUB_ALLOWED_PAGE_SIZE} deployment status found for deployment ${matchingDeployment.id} of commit ${commitSha}. Meticulous currently supports at most ${MAX_GITHUB_ALLOWED_PAGE_SIZE} deployment statuses per deployment.`
    );
  }

  const deploymentStatus = deploymentStatuses.data.find(
    (status) => status.state === "success"
  );
  if (deploymentStatus?.environment_url != null) {
    return deploymentStatus?.environment_url;
  }

  const latestDeploymentStatus = findLatest(deploymentStatuses.data);
  if (
    latestDeploymentStatus?.state === "error" ||
    latestDeploymentStatus?.state === "failure"
  ) {
    throw new Error(
      `Deployment ${matchingDeployment.id} failed with status ${latestDeploymentStatus?.state}. Cannot test against a failed deployment.`
    );
  }

  return null; // Let's continue waiting for a successful deployment
};

const findLatest = <T extends { created_at: string }>(items: T[]): T | null => {
  let latest = items[0];
  items.forEach((item) => {
    if (
      Date.parse(item.created_at).valueOf() >
      Date.parse(latest.created_at).valueOf()
    ) {
      latest = item;
    }
  });
  return latest ?? null;
};

const hasMorePages = (response: { headers: { link?: string | undefined } }) =>
  response.headers.link?.includes('rel="next"');
