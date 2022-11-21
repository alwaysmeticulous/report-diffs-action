import { WebhookPayload } from "@actions/github/lib/interfaces";
import { CodeChangePayload } from "../types";

export const shouldRunForEvent = (
  eventName: string,
  _payload: WebhookPayload
): _payload is CodeChangePayload => {
  return eventName === "push" || eventName === "pull_request";
};
