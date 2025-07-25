import { createClient, getLatestTestRunResults } from "@alwaysmeticulous/client";
import { executeTestRun } from "@alwaysmeticulous/replay-orchestrator-launcher";
import { MeticulousService } from "../types";

export class DefaultMeticulousService implements MeticulousService {
  createClient(options: { apiToken: string }) {
    return createClient(options);
  }

  async getLatestTestRunResults(options: {
    client: any;
    commitSha: string;
    logicalEnvironmentVersion: string;
  }) {
    return await getLatestTestRunResults(options);
  }

  async executeTestRun(options: any) {
    return await executeTestRun(options);
  }
}