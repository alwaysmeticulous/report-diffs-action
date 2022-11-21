import { CodeChangePayload } from "../types";

interface BaseAndHeadCommitShas {
  base: string;
  head: string;
}

export const getBaseAndHeadCommitShas = (
  payload: CodeChangePayload
): BaseAndHeadCommitShas => {
  if (payload.action === "pull_request") {
    return {
      base: payload.pull_request.base.sha,
      head: payload.pull_request.head.sha,
    };
  } else if (payload.action === "push") {
    return { base: payload.before, head: payload.after };
  } else {
    return assertNever(payload);
  }
};

const assertNever = (payload: never): never => {
  throw new Error("Unexpected payload: " + JSON.stringify(payload));
};
