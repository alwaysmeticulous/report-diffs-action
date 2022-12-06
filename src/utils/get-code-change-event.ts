import { WebhookPayload } from "@actions/github/lib/interfaces";
import {
  CodeChangeEvent,
  PullRequestPayload,
  PushPayload,
  WorkflowDispatchPayload,
} from "../types";

export const getCodeChangeEvent = (
  eventName: string,
  payload: WebhookPayload
): CodeChangeEvent | null => {
  if (eventName === "push") {
    return { type: "push", payload: payload as PushPayload };
  }
  if (eventName === "pull_request") {
    return { type: "pull_request", payload: payload as PullRequestPayload };
  }
  if (eventName === "workflow_dispatch") {
    return {
      type: "workflow_dispatch",
      payload: payload as WorkflowDispatchPayload,
    };
  }
  return null;
};
