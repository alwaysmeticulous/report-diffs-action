import { initSentry } from "@alwaysmeticulous/sentry";
import * as Sentry from "@sentry/node";
import { enrichSentryContextWithGitHubActionsContext } from "../../common/sentry.utils";
import { SentryService } from "../types";

export class DefaultSentryService implements SentryService {
  async initSentry(dsn: string, sampleRate: number): Promise<void> {
    await initSentry(dsn, sampleRate);
  }

  captureException(error: Error): void {
    Sentry.captureException(error);
  }

  async startSpan<T>(options: any, callback: (span: any) => Promise<T>): Promise<T> {
    return await Sentry.startSpan(options, callback);
  }

  async flush(timeout: number): Promise<boolean> {
    return await Sentry.flush(timeout);
  }

  async close(timeout: number): Promise<boolean> {
    const client = Sentry.getClient();
    return client ? await client.close(timeout) : true;
  }

  enrichContextWithGitHubActions(): void {
    enrichSentryContextWithGitHubActionsContext();
  }
}