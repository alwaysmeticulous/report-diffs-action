import { WebhookPayload } from "@actions/github/lib/interfaces";
import { CodeChangePayload } from "../types";

export const shouldRunForPayload = (
  payload: WebhookPayload
): payload is CodeChangePayload => {
  return payload.action === "push" || payload.action === "pull_request";
};
