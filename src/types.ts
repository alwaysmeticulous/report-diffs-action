export type CodeChangeEvent =
  | { type: "push"; payload: PushPayload }
  | { type: "pull_request"; payload: PullRequestPayload }
  | { type: "workflow_dispatch"; payload: WorkflowDispatchPayload };

// https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#push
export interface PushPayload {
  /**
   * The SHA of the most recent commit on ref before the push.
   */
  before: string;

  /**
   * The SHA of the most recent commit on ref after the push.
   */
  after: string;

  /**
   * The git ref
   */
  ref: string;
}

// https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#pull_request
export interface PullRequestPayload {
  pull_request: {
    number: number;
    head: {
      sha: string;
      ref: string;
    };
    base: {
      sha: string;
      ref: string;
    };
    title: string;
    html_url: string;
  };
}

// https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#workflow_dispatch
export interface WorkflowDispatchPayload {
  ref: string;
  inputs: {
    [key: string]: unknown;
  };
}
