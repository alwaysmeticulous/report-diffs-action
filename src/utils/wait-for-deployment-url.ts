import { GitHub } from "@actions/github/lib/utils";

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
    per_page: 1000,
  });
  console.debug(`Found ${deployments.data.length} deployments`);

  if (deployments.data.length === 0) {
    return null;
  }
  let latestDeployment = deployments.data[0];
  deployments.data.forEach((deployment) => {
    if (
      Date.parse(deployment.created_at).valueOf() >
      Date.parse(latestDeployment.created_at).valueOf()
    ) {
      latestDeployment = deployment;
    }
  });
  console.debug(`Checking status of deployment ${latestDeployment.id}`);

  const deploymentStatuses = await octokit.rest.repos.listDeploymentStatuses({
    owner,
    repo,
    deployment_id: latestDeployment.id,
    per_page: 1000,
  });
  const deploymentStatus = deploymentStatuses.data.find(
    (status) => status.state === "success"
  );
  return deploymentStatus?.environment_url ?? null;
};
