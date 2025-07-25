import { getOctokit } from "@actions/github";
import { context } from "@actions/github";
import { GitHubService } from "../types";
import { METICULOUS_LOGGER_NAME } from "@alwaysmeticulous/common";
import log from "loglevel";

export class DefaultGitHubService implements GitHubService {
  getOctokit(token: string) {
    if (!token) {
      throw new Error("github-token is required");
    }

    try {
      return getOctokit(token);
    } catch (err) {
      const logger = log.getLogger(METICULOUS_LOGGER_NAME);
      logger.error(err);
      throw new Error(
        "Error connecting to GitHub. Did you specify a valid 'github-token'?"
      );
    }
  }

  getContext() {
    return context;
  }
}