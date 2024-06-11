import {
  createClient,
  getGitHubCloudReplayBaseTestRun,
  GitHubBaseTestRunResponse,
} from "@alwaysmeticulous/client";

export const getCloudComputeBaseTestRun = async ({
  apiToken,
  headCommitSha,
}: {
  apiToken: string;
  headCommitSha: string;
}): Promise<GitHubBaseTestRunResponse> => {
  const client = createClient({ apiToken });
  const result = await getGitHubCloudReplayBaseTestRun({
    client,
    headCommitSha,
  });
  console.log(result);
  return result;
};
