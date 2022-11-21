import { WebhookPayload } from "@actions/github/lib/interfaces";
import { CodeChangeEvent, PullRequestPayload, PushPayload } from "../types";

export const getCodeChangeEvent = (
  eventName: string,
  payload: WebhookPayload
): CodeChangeEvent | null => {
  if (eventName === "push") {
    return { type: "push", payload: payload as PushPayload };
  } else if (eventName === "pull_request") {
    return { type: "pull_request", payload: payload as PullRequestPayload };
  } else {
    return null;
  }
};
