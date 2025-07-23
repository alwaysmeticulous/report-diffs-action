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
  // const client = createClient({ apiToken });
  return {
    baseCommitSha: "e072cdce7e9b1f67107729be39b617f3c8174eb2",
    baseTestRun: null,
  };
  // return await getGitHubCloudReplayBaseTestRun({
  //   client,
  //   headCommitSha:
  // });
};
