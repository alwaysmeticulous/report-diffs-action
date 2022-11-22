import { CodeChangeEvent } from "../types";

interface BaseAndHeadCommitShas {
  base: string;
  head: string;
}

export const getBaseAndHeadCommitShas = (
  event: CodeChangeEvent
): BaseAndHeadCommitShas => {
  if (event.type === "pull_request") {
    return {
      base: event.payload.pull_request.base.sha,
      head: event.payload.pull_request.head.sha,
    };
  } else if (event.type === "push") {
    return { base: event.payload.before, head: event.payload.after };
  } else {
    return assertNever(event);
  }
};

const assertNever = (event: never): never => {
  throw new Error("Unexpected event: " + JSON.stringify(event));
};
