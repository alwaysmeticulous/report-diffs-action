import { getOctokit } from "@actions/github";
import { METICULOUS_LOGGER_NAME } from "@alwaysmeticulous/common";
import log from "loglevel";

export const getOctokitOrFail = (githubToken: string | null) => {
  if (githubToken == null) {
    throw new Error("github-token is required");
  }

  try {
    return getOctokit(githubToken);
  } catch (err) {
    const logger = log.getLogger(METICULOUS_LOGGER_NAME);
    logger.error(err);
    throw new Error(
      "Error connecting to GitHub. Did you specify a valid 'github-token'?"
    );
  }
};
