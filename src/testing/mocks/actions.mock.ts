import { ActionsService, SentryService, FileSystemService, NetworkService } from "../types";
import { Logger } from "loglevel";

export class MockActionsService implements ActionsService {
  private calls: Array<{ method: string; args: any[] }> = [];

  setFailed(message: string): void {
    this.calls.push({ method: "setFailed", args: [message] });
  }

  setOutput(name: string, value: string): void {
    this.calls.push({ method: "setOutput", args: [name, value] });
  }

  info(message: string): void {
    this.calls.push({ method: "info", args: [message] });
  }

  warning(message: string): void {
    this.calls.push({ method: "warning", args: [message] });
  }

  error(message: string): void {
    this.calls.push({ method: "error", args: [message] });
  }

  getCalls() {
    return this.calls;
  }

  getFailures() {
    return this.calls.filter(call => call.method === "setFailed");
  }

  reset() {
    this.calls = [];
  }
}

export class MockSentryService implements SentryService {
  private calls: Array<{ method: string; args: any[] }> = [];
  private shouldThrow = false;

  async initSentry(dsn: string, sampleRate: number): Promise<void> {
    this.calls.push({ method: "initSentry", args: [dsn, sampleRate] });
  }

  captureException(error: Error): void {
    this.calls.push({ method: "captureException", args: [error] });
  }

  async startSpan<T>(options: any, callback: (span: any) => Promise<T>): Promise<T> {
    this.calls.push({ method: "startSpan", args: [options] });
    const mockSpan = {
      setStatus: (status: any) => this.calls.push({ method: "setStatus", args: [status] }),
    };
    return await callback(mockSpan);
  }

  async flush(timeout: number): Promise<boolean> {
    this.calls.push({ method: "flush", args: [timeout] });
    return true;
  }

  async close(timeout: number): Promise<boolean> {
    this.calls.push({ method: "close", args: [timeout] });
    return true;
  }

  enrichContextWithGitHubActions(): void {
    this.calls.push({ method: "enrichContextWithGitHubActions", args: [] });
  }

  getCalls() {
    return this.calls;
  }

  setShouldThrow(shouldThrow: boolean) {
    this.shouldThrow = shouldThrow;
  }

  reset() {
    this.calls = [];
  }
}

export class MockFileSystemService implements FileSystemService {
  private files: Map<string, string> = new Map();
  private calls: Array<{ method: string; args: any[] }> = [];

  async exists(path: string): Promise<boolean> {
    this.calls.push({ method: "exists", args: [path] });
    return this.files.has(path);
  }

  async readFile(path: string): Promise<string> {
    this.calls.push({ method: "readFile", args: [path] });
    const content = this.files.get(path);
    if (!content) {
      throw new Error(`File not found: ${path}`);
    }
    return content;
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.calls.push({ method: "writeFile", args: [path, content] });
    this.files.set(path, content);
  }

  setMeticulousLocalDataDir(): void {
    this.calls.push({ method: "setMeticulousLocalDataDir", args: [] });
  }

  // Test utilities
  setFile(path: string, content: string) {
    this.files.set(path, content);
  }

  getFile(path: string) {
    return this.files.get(path);
  }

  getCalls() {
    return this.calls;
  }

  reset() {
    this.files.clear();
    this.calls = [];
  }
}

export class MockNetworkService implements NetworkService {
  private calls: Array<{ method: string; args: any[] }> = [];
  private shouldFailConnection = false;

  async checkConnection(url: string): Promise<void> {
    this.calls.push({ method: "checkConnection", args: [url] });
    if (this.shouldFailConnection) {
      throw new Error(`Cannot connect to ${url}`);
    }
  }

  spinUpProxy(options: {
    targetUrl: string;
    additionalPorts?: string;
    aliasedUrl?: string;
    logger: Logger;
  }): void {
    this.calls.push({ method: "spinUpProxy", args: [options] });
  }

  getCalls() {
    return this.calls;
  }

  setShouldFailConnection(shouldFail: boolean) {
    this.shouldFailConnection = shouldFail;
  }

  reset() {
    this.calls = [];
  }
}