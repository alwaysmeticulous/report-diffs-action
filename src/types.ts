export type CodeChangePayload = PushPayload | PullRequestPayload;

// https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#push
export interface PushPayload {
  action: "push";

  /**
   * The SHA of the most recent commit on ref before the push.
   */
  before: string;

  /**
   * The SHA of the most recent commit on ref after the push.
   */
  after: string;
}

// https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#pull_request
export interface PullRequestPayload {
  action: "pull_request";
  pull_request: {
    number: number;
    head: {
      sha: string;
    };
    base: {
      sha: string;
    };
  };
}
