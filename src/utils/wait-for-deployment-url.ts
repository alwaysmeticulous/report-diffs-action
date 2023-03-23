import { GitHub } from "@actions/github/lib/utils";
import { EXPECTED_PERMISSIONS_BLOCK } from "./constants";

const TIMEOUT_MS = 30 * 60 * 1_000; // 30 minutes
const MIN_POLL_FREQUENCY = 1_000;
const MAX_POLL_FREQUENCY = 10 * 1_000;

export const waitForDeploymentUrl = async ({
  owner,
  repo,
  commitSha,
  octokit,
}: {
  owner: string;
  repo: string;
  commitSha: string;
  octokit: InstanceType<typeof GitHub>;
}): Promise<string> => {
  const startTime = Date.now();
  let pollFrequency = MIN_POLL_FREQUENCY;
  while (Date.now() - startTime < TIMEOUT_MS) {
    const deploymentUrl = await getDeploymentUrl({
      owner,
      repo,
      commitSha,
      octokit,
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
}: {
  owner: string;
  repo: string;
  commitSha: string;
  octokit: InstanceType<typeof GitHub>;
}): Promise<string | null> => {
  const deployments = await octokit.rest.repos.listDeployments({
    owner,
    repo,
    sha: commitSha,
    per_page: MAX_GITHUB_ALLOWED_PAGE_SIZE,
  });
  if (deployments.status !== 200) {
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

  const latestDeployment = findLatest(deployments.data);
  if (latestDeployment == null) {
    return null;
  }
  console.debug(`Checking status of deployment ${latestDeployment.id}`);

  const deploymentStatuses = await octokit.rest.repos.listDeploymentStatuses({
    owner,
    repo,
    deployment_id: latestDeployment.id,
    per_page: MAX_GITHUB_ALLOWED_PAGE_SIZE,
  });

  if (hasMorePages(deploymentStatuses)) {
    throw new Error(
      `More than ${MAX_GITHUB_ALLOWED_PAGE_SIZE} deployment status found for deployment ${latestDeployment.id} of commit ${commitSha}. Meticulous currently supports at most ${MAX_GITHUB_ALLOWED_PAGE_SIZE} deployment statuses per deployment.`
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
      `Deployment ${latestDeployment.id} failed with status ${latestDeploymentStatus?.state}. Cannot test against a failed deployment.`
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
