import { Context } from "@actions/github/lib/context";
import { getOctokit } from "@actions/github";
import { RunningTestRunExecution } from "@alwaysmeticulous/sdk-bundles-api";
import { Logger } from "loglevel";

export interface GitHubService {
  getOctokit(token: string): ReturnType<typeof getOctokit>;
  getContext(): Context;
}

export interface MeticulousService {
  createClient(options: { apiToken: string }): any;
  getLatestTestRunResults(options: {
    client: any;
    commitSha: string;
    logicalEnvironmentVersion: string | number;
  }): Promise<any>;
  executeTestRun(options: any): Promise<any>;
}

export interface FileSystemService {
  exists(path: string): Promise<boolean>;
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  setMeticulousLocalDataDir(): void;
}

export interface NetworkService {
  checkConnection(url: string): Promise<void>;
  spinUpProxy(options: {
    targetUrl: string;
    additionalPorts?: string | null;
    aliasedUrl?: string | boolean | null;
    logger: Logger;
  }): void;
}

export interface ActionsService {
  setFailed(message: string): void;
  setOutput(name: string, value: string): void;
  info(message: string): void;
  warning(message: string): void;
  error(message: string): void;
}

export interface SentryService {
  initSentry(dsn: string, sampleRate: number): Promise<void>;
  captureException(error: Error): void;
  startSpan<T>(options: any, callback: (span: any) => Promise<T>): Promise<T>;
  flush(timeout: number): Promise<boolean>;
  close(timeout: number): Promise<boolean>;
  enrichContextWithGitHubActions(): void;
}

export interface ActionDependencies {
  github: GitHubService;
  meticulous: MeticulousService;
  fileSystem: FileSystemService;
  network: NetworkService;
  actions: ActionsService;
  sentry: SentryService;
  logger: Logger;
}