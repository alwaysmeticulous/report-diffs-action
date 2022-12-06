import { TestRunEnvironment } from "@alwaysmeticulous/api";
import { CodeChangeEvent } from "../types";

export const getEnvironment = ({
  event,
}: {
  event: CodeChangeEvent;
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
        headSha: event.payload.pull_request.head.sha,
      },
    };
  }

  return {
    context: {
      type: "github",
      event: "workflow-dispatch",
      ref: event.payload.ref,
      inputs: event.payload.inputs,
    } as any,
  };
};
