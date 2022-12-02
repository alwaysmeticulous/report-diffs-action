import { getOctokit } from "@actions/github";

export const getOctokitOrFail = (githubToken: string | null) => {
  if (githubToken == null) {
    throw new Error("github-token is required");
  }

  try {
    return getOctokit(githubToken);
  } catch (err) {
    console.error(err);
    throw new Error(
      "Error connecting to GitHub. Did you specify a valid 'github-token'?"
    );
  }
};
