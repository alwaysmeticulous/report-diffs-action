import { CodeChangeEvent } from "../../types";

export const getPullRequestId = (
  event: CodeChangeEvent | null
): string | null => {
  if (!event || event.type !== "pull_request") {
    return null;
  }
  return event.payload.pull_request.number.toString();
};
