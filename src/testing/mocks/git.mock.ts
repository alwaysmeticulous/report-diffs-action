import { spawn, exec } from 'child_process';

export interface GitMockResponse {
  stdout?: string;
  stderr?: string;
  code?: number;
  error?: Error;
}

export class GitMock {
  private static instance: GitMock | null = null;
  private responses: Map<string, GitMockResponse> = new Map();
  private originalSpawn: typeof spawn;
  private originalExec: typeof exec;
  private isActive = false;

  private constructor() {
    this.originalSpawn = spawn;
    this.originalExec = exec;
    this.setupDefaultResponses();
  }

  static getInstance(): GitMock {
    if (!GitMock.instance) {
      GitMock.instance = new GitMock();
    }
    return GitMock.instance;
  }

  private setupDefaultResponses(): void {
    // Default successful git responses
    this.responses.set('git fetch origin', {
      stdout: '',
      stderr: '',
      code: 0,
    });

    this.responses.set('git fetch origin --unshallow', {
      stdout: '',
      stderr: '',
      code: 0,
    });

    this.responses.set('git merge-base', {
      stdout: 'base-sha\n',
      stderr: '',
      code: 0,
    });

    this.responses.set('git rev-parse HEAD', {
      stdout: 'head-sha\n',
      stderr: '',
      code: 0,
    });

    this.responses.set('git log --oneline', {
      stdout: 'head-sha Test commit\nbase-sha Base commit\n',
      stderr: '',
      code: 0,
    });

    // Handle unshallow error that was causing issues
    this.responses.set('git fetch origin head-sha --unshallow', {
      stdout: '',
      stderr: 'fatal: --unshallow on a complete repository does not make sense\n',
      code: 128,
    });

    this.responses.set('git fetch origin 22177d347a49bb24d9caa846e6c325b790c1259a --unshallow', {
      stdout: '',
      stderr: 'fatal: --unshallow on a complete repository does not make sense\n',
      code: 128,
    });
  }

  setResponse(command: string, response: GitMockResponse): void {
    this.responses.set(command, response);
  }

  activate(): void {
    if (this.isActive) return;

    const self = this;

    // Mock spawn for git commands
    require('child_process').spawn = function(command: string, args: string[] = [], options: any = {}) {
      const fullCommand = `${command} ${args.join(' ')}`.trim();
      
      if (command === 'git') {
        const response = self.findResponse(fullCommand);
        
        // Create a mock child process
        const mockChild = {
          stdout: {
            on: (event: string, callback: Function) => {
              if (event === 'data' && response.stdout) {
                process.nextTick(() => callback(Buffer.from(response.stdout!)));
              }
            },
            pipe: () => mockChild.stdout,
          },
          stderr: {
            on: (event: string, callback: Function) => {
              if (event === 'data' && response.stderr) {
                process.nextTick(() => callback(Buffer.from(response.stderr!)));
              }
            },
            pipe: () => mockChild.stderr,
          },
          on: (event: string, callback: Function) => {
            if (event === 'close') {
              process.nextTick(() => callback(response.code || 0));
            } else if (event === 'error' && response.error) {
              process.nextTick(() => callback(response.error));
            }
          },
          kill: () => {},
          pid: 12345,
        };

        return mockChild;
      }
      
      // For non-git commands, use original spawn
      return self.originalSpawn(command, args, options);
    };

    // Mock exec for git commands
    require('child_process').exec = function(command: string, options: any, callback?: any) {
      // Handle both exec(command, callback) and exec(command, options, callback)
      let actualCallback = callback;
      let actualOptions = options;
      
      if (typeof options === 'function') {
        actualCallback = options;
        actualOptions = {};
      }

      if (command.startsWith('git ')) {
        const response = self.findResponse(command);
        
        if (actualCallback) {
          process.nextTick(() => {
            if (response.error) {
              actualCallback(response.error, response.stdout || '', response.stderr || '');
            } else {
              const error = response.code !== 0 ? new Error(`Command failed: ${command}`) : null;
              actualCallback(error, response.stdout || '', response.stderr || '');
            }
          });
        }

        return {
          pid: 12345,
          kill: () => {},
        } as any;
      }

      // For non-git commands, use original exec
      return self.originalExec(command, actualOptions, actualCallback);
    };

    this.isActive = true;
  }

  deactivate(): void {
    if (!this.isActive) return;

    require('child_process').spawn = this.originalSpawn;
    require('child_process').exec = this.originalExec;
    this.isActive = false;
  }

  private findResponse(command: string): GitMockResponse {
    // Try exact match first
    if (this.responses.has(command)) {
      return this.responses.get(command)!;
    }

    // Try partial matches for commands with dynamic parts
    for (const [pattern, response] of this.responses.entries()) {
      if (command.includes(pattern) || pattern.includes(command.split(' ').slice(0, 3).join(' '))) {
        return response;
      }
    }

    // Default response for unknown git commands
    return {
      stdout: '',
      stderr: `Unknown git command: ${command}`,
      code: 0,
    };
  }

  reset(): void {
    this.responses.clear();
    this.setupDefaultResponses();
  }
}

// Convenience functions for tests
export const mockGit = GitMock.getInstance();

export function setupGitMock(): void {
  mockGit.activate();
}

export function teardownGitMock(): void {
  mockGit.deactivate();
}

export function setGitResponse(command: string, response: GitMockResponse): void {
  mockGit.setResponse(command, response);
}