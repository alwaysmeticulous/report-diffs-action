import { TestRunEnvironment } from "@alwaysmeticulous/api";
import { CodeChangeEvent } from "../types";

export const getEnvironment = ({
  event,
  head,
}: {
  event: CodeChangeEvent;
  head: string;
}): TestRunEnvironment => {
  if (event.type === "push") {
    return {
      context: {
        type: "github",
        event: "push",
        beforeSha: event.payload.before,
        afterSha: event.payload.after,
        ref: event.payload.ref,
      },
    };
  }

  if (event.type === "pull_request") {
    return {
      context: {
        type: "github",
        event: "pull-request",
        title: event.payload.pull_request.title,
        number: event.payload.pull_request.number,
        htmlUrl: event.payload.pull_request.html_url,
        baseSha: event.payload.pull_request.base.sha,
        baseRef: event.payload.pull_request.base.ref,
        headSha: event.payload.pull_request.head.sha,
        headRef: event.payload.pull_request.head.ref,
      },
    };
  }

  return {
    context: {
      type: "github",
      event: "workflow-dispatch",
      ref: event.payload.ref,
      inputs: event.payload.inputs,
      headSha: head,
    },
  };
};

const SHORT_SHA_LENGTH = 7;

export const shortCommitSha = (sha: string) =>
  sha.substring(0, SHORT_SHA_LENGTH);
