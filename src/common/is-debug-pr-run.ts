import { CodeChangeEvent } from "../types";
import { METICULOUS_DEBUGGING_PR_TAG } from "./constants";

/**
 * Returns true if the running context is a debug PR test run.
 */
export const isDebugPullRequestRun = (
  event: CodeChangeEvent | null
): boolean => {
  return (
    !!event &&
    event.type === "pull_request" &&
    event.payload.pull_request.title
      .toLowerCase()
      .includes(METICULOUS_DEBUGGING_PR_TAG)
  );
};
