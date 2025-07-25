import { tmpdir } from 'os';
import { join } from 'path';
import { mkdtemp, rm, mkdir, writeFile } from 'fs/promises';
import { setupGitMock, teardownGitMock } from '../mocks/git.mock';

export interface EnvironmentSnapshot {
  env: Record<string, string | undefined>;
  cwd: string;
}

export class EnvironmentIsolation {
  private originalSnapshot: EnvironmentSnapshot;
  private tempDir: string | undefined;
  private isIsolated = false;

  constructor() {
    this.originalSnapshot = this.captureEnvironment();
  }

  async isolate(): Promise<TestEnvironment> {
    if (this.isIsolated) {
      throw new Error('Environment is already isolated');
    }

    // Create temporary directory
    this.tempDir = await mkdtemp(join(tmpdir(), 'meticulous-test-'));

    // Set up mock git operations
    setupGitMock();

    // Clear all environment variables except essential ones
    const essentialVars = ['NODE_ENV', 'PATH', 'HOME', 'USER', 'SHELL'];
    Object.keys(process.env).forEach(key => {
      if (!essentialVars.includes(key)) {
        delete process.env[key];
      }
    });

    // Change to temp directory
    process.chdir(this.tempDir);

    this.isIsolated = true;
    return new TestEnvironment(this.tempDir);
  }

  async restore(): Promise<void> {
    if (!this.isIsolated) return;

    try {
      // Restore original environment
      Object.keys(process.env).forEach(key => delete process.env[key]);
      Object.entries(this.originalSnapshot.env).forEach(([key, value]) => {
        if (value !== undefined) {
          process.env[key] = value;
        }
      });

      // Restore original working directory
      process.chdir(this.originalSnapshot.cwd);

      // Cleanup git mocks
      teardownGitMock();

      // Cleanup temporary directory
      if (this.tempDir) {
        try {
          await rm(this.tempDir, { recursive: true, force: true });
        } catch (error) {
          // Ignore cleanup errors
          console.warn(`Failed to cleanup temp directory: ${error}`);
        }
      }
    } finally {
      this.isIsolated = false;
      this.tempDir = undefined;
    }
  }

  private captureEnvironment(): EnvironmentSnapshot {
    return {
      env: { ...process.env },
      cwd: process.cwd(),
    };
  }
}

export class TestEnvironment {
  constructor(private workspaceDir: string) {}

  withGitHubActions(config: {
    sha?: string;
    ref?: string;
    actor?: string;
    token?: string;
    repository?: string;
    eventName?: string;
    runId?: string;
    runNumber?: string;
  } = {}): this {
    // Set GitHub Actions environment variables
    process.env.GITHUB_WORKSPACE = this.workspaceDir;
    process.env.GITHUB_SHA = config.sha || 'test-sha';
    process.env.GITHUB_REF = config.ref || 'refs/heads/test-branch';
    process.env.GITHUB_ACTOR = config.actor || 'test-actor';
    process.env.GITHUB_TOKEN = config.token || 'test-token';
    process.env.GITHUB_REPOSITORY = config.repository || 'test-owner/test-repo';
    process.env.GITHUB_EVENT_NAME = config.eventName || 'pull_request';
    process.env.GITHUB_RUN_ID = config.runId || '12345';
    process.env.GITHUB_RUN_NUMBER = config.runNumber || '1';
    process.env.CI = 'true';
    process.env.GITHUB_ACTIONS = 'true';

    return this;
  }

  withMeticulousConfig(config: {
    apiToken?: string;
    appUrl?: string;
    testsFile?: string;
    maxRetries?: string;
    colorDifference?: string;
    pixelThreshold?: string;
    useDeploymentUrl?: string;
    parallelTasks?: string;
  } = {}): this {
    process.env.API_TOKEN = config.apiToken || 'test-api-token';
    process.env.APP_URL = config.appUrl || 'http://localhost:3000';
    process.env.TESTS_FILE = config.testsFile || './tests/meticulous.json';
    process.env.MAX_RETRIES_ON_FAILURE = config.maxRetries || '5';
    process.env.MAX_ALLOWED_COLOR_DIFFERENCE = config.colorDifference || '0.01';
    process.env.MAX_ALLOWED_PROPORTION_OF_CHANGED_PIXELS = config.pixelThreshold || '0.00001';
    process.env.USE_DEPLOYMENT_URL = config.useDeploymentUrl || 'false';
    process.env.METICULOUS_TELEMETRY_SAMPLE_RATE = '0.01';
    process.env.PARALLEL_TASKS = config.parallelTasks || '';

    return this;
  }

  async createFile(relativePath: string, content: string): Promise<this> {
    const fullPath = join(this.workspaceDir, relativePath);
    const dir = join(fullPath, '..');
    
    await mkdir(dir, { recursive: true });
    await writeFile(fullPath, content, 'utf-8');
    
    return this;
  }

  async createTestsFile(tests: Array<{ name: string; url: string }> = []): Promise<this> {
    const defaultTests = tests.length > 0 ? tests : [
      { name: 'test-1', url: '/test1' },
      { name: 'test-2', url: '/test2' },
    ];

    await this.createFile('tests/react-bmi-calculator/meticulous.json', JSON.stringify({
      tests: defaultTests,
    }, null, 2));

    return this;
  }

  getWorkspaceDir(): string {
    return this.workspaceDir;
  }
}