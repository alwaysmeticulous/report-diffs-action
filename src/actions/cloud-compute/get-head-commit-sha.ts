import { Logger } from "loglevel";
import { getHeadCommitShaFromRepo } from "../../common/get-base-and-head-commit-shas";

/*
 * Computes the HEAD commit SHA to use when creating a test run.

 * In a PR workflow this will by default be process.env.GITHUB_SHA (the temporary merge commit) or
 * sometimes the head commit of the PR.
 * Users can also explicitly provide the head commit SHA to use as input. This is useful when the action is not
 * run with the code checked out.
 * Our backend is responsible for computing the correct BASE commit to create the test run for.
 */
export const getHeadCommitSha = async ({
  headShaFromInput,
  logger,
}: {
  headShaFromInput: string | null;
  logger: Logger;
}): Promise<
  { type: "success"; sha: string } | { type: "error"; error: unknown }
> => {
  // TODO: && headShaFromInput.length > 0
  if (headShaFromInput != null) {
    return { type: "success", sha: headShaFromInput };
  }

  try {
    return { type: "success", sha: await getHeadCommitShaFromRepo() };
  } catch (error) {
    logger.error(
      `Failed to get HEAD commit SHA from repo. Error: ${error}. Reporting telemetry without a HEAD commit SHA.`
    );
    return { type: "error", error };
  }
};
