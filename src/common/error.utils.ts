import { DOCS_URL } from "./constants";

export const isGithubPermissionsError = (
  error: MaybeOctokitRequestError | unknown
): boolean => {
  const message = getErrorMessage(error);
  return (
    message.toLowerCase().includes("resource not accessible by integration") ||
    (error as MaybeOctokitRequestError)?.status === 403
  );
};

export const getErrorMessage = (error: unknown) => {
  const message = (error as MaybeOctokitRequestError)?.message ?? "";
  return typeof message === "string" ? message : "";
};

// Octokit returns RequestErrors, which have a message and a code
// But we can't make any strong assumptions, so we type it on the safe side
// https://github.com/octokit/request-error.js/blob/372097e9b16f70d4ad75089003dc9154e304faa7/src/index.ts#L16
type MaybeOctokitRequestError =
  | {
      message?: string | unknown;
      status?: number | unknown;
    }
  | null
  | undefined;

export const DEFAULT_FAILED_OCTOKIT_REQUEST_MESSAGE = `Please check www.githubstatus.com, and that you have setup the action correctly, including with the correct permissions: see ${DOCS_URL} for the correct setup.`;
