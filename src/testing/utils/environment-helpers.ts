export interface EnvironmentSnapshot {
  [key: string]: string | undefined;
}

export class EnvironmentManager {
  private snapshots: EnvironmentSnapshot[] = [];

  snapshot(): EnvironmentSnapshot {
    const snapshot: EnvironmentSnapshot = {};
    for (const key in process.env) {
      snapshot[key] = process.env[key];
    }
    this.snapshots.push(snapshot);
    return snapshot;
  }

  restore(snapshot?: EnvironmentSnapshot): void {
    const targetSnapshot = snapshot || this.snapshots.pop();
    if (!targetSnapshot) {
      throw new Error("No environment snapshot to restore");
    }

    // Clear current environment
    for (const key in process.env) {
      delete process.env[key];
    }

    // Restore snapshot
    for (const [key, value] of Object.entries(targetSnapshot)) {
      if (value !== undefined) {
        process.env[key] = value;
      }
    }
  }

  setTestEnvironment(envVars: Record<string, string>): void {
    for (const [key, value] of Object.entries(envVars)) {
      process.env[key] = value;
    }
  }

  clearTestEnvironment(keys: string[]): void {
    for (const key of keys) {
      delete process.env[key];
    }
  }
}

export const createDefaultActionEnvironment = (): Record<string, string> => ({
  API_TOKEN: "test-api-token",
  GITHUB_TOKEN: "test-github-token",
  MAX_RETRIES_ON_FAILURE: "5",
  MAX_ALLOWED_COLOR_DIFFERENCE: "0.01",
  MAX_ALLOWED_PROPORTION_OF_CHANGED_PIXELS: "0.00001",
  USE_DEPLOYMENT_URL: "false",
  METICULOUS_TELEMETRY_SAMPLE_RATE: "0.01",
});

export const createCloudComputeEnvironment = (): Record<string, string> => ({
  GITHUB_TOKEN: "test-github-token",
});