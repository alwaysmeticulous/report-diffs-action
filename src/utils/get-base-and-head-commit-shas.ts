import { context } from "@actions/github";
import { CodeChangeEvent } from "../types";

interface BaseAndHeadCommitShas {
  base: string | null;
  head: string;
}

export const getBaseAndHeadCommitShas = async (
  event: CodeChangeEvent
): Promise<BaseAndHeadCommitShas> => {
  if (event.type === "pull_request") {
    return {
      base: event.payload.pull_request.base.sha,
      head: event.payload.pull_request.head.sha,
    };
  }
  if (event.type === "push") {
    return { base: event.payload.before, head: event.payload.after };
  }
  if (event.type === "workflow_dispatch") {
    return {
      base: null,
      head: context.sha,
    };
  }
  return assertNever(event);
};

const assertNever = (event: never): never => {
  throw new Error("Unexpected event: " + JSON.stringify(event));
};
