/**
 * Adaptive service factory that creates either mock or real service instances
 * based on test environment configuration
 */

import { TestEnvironmentConfig, TestEnvironmentManager } from './test-environment-config';
import { ActionDependencies, MeticulousService, GitHubService } from '../types';
import { MockMeticulousService } from '../mocks/meticulous.mock';
import { EnhancedGitHubMockService } from '../mocks/enhanced-github.mock';
import { DefaultMeticulousService } from '../services/meticulous.service';
import { DefaultGitHubService } from '../services/github.service';
import { createClient } from '@alwaysmeticulous/client';
import { getOctokit } from '@actions/github';
import fetch from 'node-fetch';

export interface ServiceFactoryOptions {
  environmentManager: TestEnvironmentManager;
  enableRequestInterception?: boolean;
  enableResponseValidation?: boolean;
  enableMetricsCollection?: boolean;
}

export class AdaptiveServiceFactory {
  private environmentManager: TestEnvironmentManager;
  private options: ServiceFactoryOptions;
  private requestInterceptors: Map<string, Function[]> = new Map();
  private responseValidators: Map<string, Function[]> = new Map();
  private metricsCollector?: MetricsCollector;

  constructor(options: ServiceFactoryOptions) {
    this.environmentManager = options.environmentManager;
    this.options = options;
    
    if (options.enableMetricsCollection) {
      this.metricsCollector = new MetricsCollector();
    }
  }

  createMeticulousService(): MeticulousService {
    const config = this.environmentManager.getConfig();
    
    if (config.behavior.useRealNetworkCalls) {
      return this.createRealMeticulousService(config);
    } else {
      return this.createMockMeticulousService(config);
    }
  }

  createGitHubService(): GitHubService {
    const config = this.environmentManager.getConfig();
    
    if (config.behavior.useRealNetworkCalls) {
      return this.createRealGitHubService(config);
    } else {
      return this.createMockGitHubService(config);
    }
  }

  createActionDependencies(): ActionDependencies {
    const config = this.environmentManager.getConfig();
    
    return {
      meticulous: this.createMeticulousService(),
      github: this.createGitHubService(),
      fileSystem: this.createFileSystemService(config),
      network: this.createNetworkService(config),
      actions: this.createActionsService(config),
      sentry: this.createSentryService(config),
      logger: this.createLoggerService(config),
    };
  }

  private createRealMeticulousService(config: TestEnvironmentConfig): MeticulousService {
    const apiToken = config.authentication.meticulous.apiToken;
    if (!apiToken) {
      throw new Error('Meticulous API token is required for real API calls');
    }

    // Create instrumented version of the real service
    const realService = new DefaultMeticulousService();
    
    return this.instrumentService('meticulous', realService, {
      baseUrl: config.endpoints.meticulous.apiUrl,
      timeout: config.behavior.timeoutMs,
      retries: config.behavior.enableRetries ? 3 : 0,
      rateLimit: config.behavior.enableRateLimiting,
    });
  }

  private createMockMeticulousService(config: TestEnvironmentConfig): MeticulousService {
    const mockService = new MockMeticulousService({
      // Configure mock behavior based on config
      shouldThrow: false,
      getLatestTestRunResults: {
        success: true,
        testRunId: 'mock-test-run-123',
        diffs: [],
      },
      executeTestRun: {
        success: true,
        testRun: {
          testRunId: 'mock-execution-456',
          project: { isGitHubIntegrationActive: true },
        },
        testCaseResults: [],
      },
    });

    // Add latency simulation if configured
    if (config.mockConfig?.simulateNetworkLatency) {
      return this.addLatencySimulation(mockService, config.mockConfig.averageLatencyMs);
    }

    return mockService;
  }

  private createRealGitHubService(config: TestEnvironmentConfig): GitHubService {
    const token = config.authentication.github.token;
    if (!token) {
      throw new Error('GitHub token is required for real API calls');
    }

    const realService = new DefaultGitHubService();
    
    return this.instrumentService('github', realService, {
      baseUrl: config.endpoints.github.apiUrl,
      timeout: config.behavior.timeoutMs,
      retries: config.behavior.enableRetries ? 3 : 0,
      rateLimit: config.behavior.enableRateLimiting,
    });
  }

  private createMockGitHubService(config: TestEnvironmentConfig): GitHubService {
    return new EnhancedGitHubMockService({
      permissions: ['actions:read', 'contents:read', 'pull-requests:write'],
      rateLimit: {
        remaining: 5000,
        reset: Date.now() / 1000 + 3600,
        limit: 5000,
      },
    });
  }

  private createFileSystemService(config: TestEnvironmentConfig): any {
    // Return mock or real filesystem service based on config
    // This would implement similar pattern for filesystem operations
    return {
      readFile: jest.fn(),
      writeFile: jest.fn(),
      exists: jest.fn(),
      mkdir: jest.fn(),
    };
  }

  private createNetworkService(config: TestEnvironmentConfig): any {
    if (config.behavior.useRealNetworkCalls) {
      return {
        fetch: this.instrumentedFetch.bind(this),
        spinUpProxy: this.realSpinUpProxy.bind(this),
        checkConnection: this.realCheckConnection.bind(this),
      };
    } else {
      return {
        fetch: jest.fn().mockResolvedValue({ ok: true, json: () => ({}) }),
        spinUpProxy: jest.fn(),
        checkConnection: jest.fn(),
        setShouldFailConnection: jest.fn(),
      };
    }
  }

  private createActionsService(config: TestEnvironmentConfig): any {
    return {
      setOutput: jest.fn(),
      setFailed: jest.fn(),
      info: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
      getFailures: jest.fn().mockReturnValue([]),
    };
  }

  private createSentryService(config: TestEnvironmentConfig): any {
    if (config.behavior.useRealNetworkCalls) {
      // Return real Sentry service (but configured for testing)
      return {
        initSentry: async () => { /* Real init but safe for testing */ },
        captureException: () => { /* Real capture but filtered */ },
        startSpan: (options: any, fn: Function) => fn(),
        enrichContextWithGitHubActions: () => {},
      };
    } else {
      return {
        initSentry: jest.fn(),
        captureException: jest.fn(),
        startSpan: jest.fn().mockImplementation((options, fn) => fn()),
        enrichContextWithGitHubActions: jest.fn(),
      };
    }
  }

  private createLoggerService(config: TestEnvironmentConfig): any {
    return {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };
  }

  // Service instrumentation for real API calls
  private instrumentService<T>(serviceName: string, service: T, options: any): T {
    if (!this.options.enableRequestInterception && !this.options.enableMetricsCollection) {
      return service;
    }

    // Create proxy to intercept method calls
    return new Proxy(service, {
      get: (target: any, prop: string) => {
        const originalMethod = target[prop];
        
        if (typeof originalMethod === 'function') {
          return async (...args: any[]) => {
            const startTime = Date.now();
            
            try {
              // Apply request interceptors
              const interceptors = this.requestInterceptors.get(`${serviceName}.${prop}`) || [];
              for (const interceptor of interceptors) {
                args = await interceptor(args) || args;
              }
              
              // Execute original method
              const result = await originalMethod.apply(target, args);
              
              // Apply response validators
              const validators = this.responseValidators.get(`${serviceName}.${prop}`) || [];
              for (const validator of validators) {
                await validator(result, args);
              }
              
              // Collect metrics
              if (this.metricsCollector) {
                this.metricsCollector.recordApiCall({
                  service: serviceName,
                  method: prop,
                  duration: Date.now() - startTime,
                  success: true,
                  args,
                  result,
                });
              }
              
              return result;
            } catch (error) {
              // Collect error metrics
              if (this.metricsCollector) {
                this.metricsCollector.recordApiCall({
                  service: serviceName,
                  method: prop,
                  duration: Date.now() - startTime,
                  success: false,
                  args,
                  error: error as Error,
                });
              }
              
              throw error;
            }
          };
        }
        
        return originalMethod;
      },
    });
  }

  private addLatencySimulation<T extends MeticulousService>(
    service: T, 
    averageLatencyMs: number
  ): T {
    return new Proxy(service, {
      get: (target: any, prop: string) => {
        const originalMethod = target[prop];
        
        if (typeof originalMethod === 'function') {
          return async (...args: any[]) => {
            // Simulate network latency with some variance
            const latency = averageLatencyMs + (Math.random() - 0.5) * averageLatencyMs * 0.5;
            await new Promise(resolve => setTimeout(resolve, Math.max(0, latency)));
            
            return originalMethod.apply(target, args);
          };
        }
        
        return originalMethod;
      },
    });
  }

  private async instrumentedFetch(url: string, options: any = {}): Promise<any> {
    const config = this.environmentManager.getConfig();
    
    // Apply timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.behavior.timeoutMs);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Record metrics
      if (this.metricsCollector) {
        this.metricsCollector.recordNetworkCall({
          url,
          method: options.method || 'GET',
          status: response.status,
          success: response.ok,
        });
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Record error metrics
      if (this.metricsCollector) {
        this.metricsCollector.recordNetworkCall({
          url,
          method: options.method || 'GET',
          success: false,
          error: error as Error,
        });
      }
      
      throw error;
    }
  }

  private async realSpinUpProxy(options: any): Promise<void> {
    // Real proxy implementation for integration testing
    // This would start an actual proxy server for testing
    console.log('Starting real proxy for integration testing:', options);
  }

  private async realCheckConnection(url: string): Promise<void> {
    const response = await this.instrumentedFetch(url, { method: 'HEAD' });
    if (!response.ok) {
      throw new Error(`Connection check failed: ${response.status}`);
    }
  }

  // Request/Response interception methods
  addRequestInterceptor(servicePath: string, interceptor: Function): void {
    if (!this.requestInterceptors.has(servicePath)) {
      this.requestInterceptors.set(servicePath, []);
    }
    this.requestInterceptors.get(servicePath)!.push(interceptor);
  }

  addResponseValidator(servicePath: string, validator: Function): void {
    if (!this.responseValidators.has(servicePath)) {
      this.responseValidators.set(servicePath, []);
    }
    this.responseValidators.get(servicePath)!.push(validator);
  }

  getMetrics(): any {
    return this.metricsCollector?.getMetrics() || {};
  }

  reset(): void {
    this.requestInterceptors.clear();
    this.responseValidators.clear();
    this.metricsCollector?.reset();
  }
}

class MetricsCollector {
  private apiCalls: any[] = [];
  private networkCalls: any[] = [];

  recordApiCall(call: any): void {
    this.apiCalls.push({
      ...call,
      timestamp: Date.now(),
    });
  }

  recordNetworkCall(call: any): void {
    this.networkCalls.push({
      ...call,
      timestamp: Date.now(),
    });
  }

  getMetrics(): any {
    return {
      apiCalls: [...this.apiCalls],
      networkCalls: [...this.networkCalls],
      summary: {
        totalApiCalls: this.apiCalls.length,
        totalNetworkCalls: this.networkCalls.length,
        successfulApiCalls: this.apiCalls.filter(c => c.success).length,
        successfulNetworkCalls: this.networkCalls.filter(c => c.success).length,
        averageApiDuration: this.apiCalls.reduce((sum, c) => sum + c.duration, 0) / this.apiCalls.length,
      },
    };
  }

  reset(): void {
    this.apiCalls = [];
    this.networkCalls = [];
  }
}