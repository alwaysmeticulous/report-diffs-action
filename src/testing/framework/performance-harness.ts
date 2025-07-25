/**
 * Performance testing harness for load testing GitHub Actions
 * Measures memory usage, execution time, and resource utilization
 */

export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: {
    initial: NodeJS.MemoryUsage;
    peak: NodeJS.MemoryUsage;
    final: NodeJS.MemoryUsage;
  };
  resourceCounts: {
    timers: number;
    promises: number;
    fileDescriptors: number;
  };
  apiCallCounts: {
    github: number;
    meticulous: number;
    network: number;
  };
  errorCounts: {
    retries: number;
    failures: number;
  };
}

export interface LoadTestConfig {
  concurrentRuns: number;
  iterationsPerRun: number;
  rampUpTime: number; // ms
  targetThroughput: number; // operations per second
  maxExecutionTime: number; // ms
  memoryLimit: number; // bytes
}

export class PerformanceHarness {
  private metrics: PerformanceMetrics[] = [];
  private startTime: number = 0;
  private memoryMonitor?: NodeJS.Timeout;

  constructor(private config: LoadTestConfig) {}

  async startMonitoring(): Promise<void> {
    this.startTime = Date.now();
    
    // Monitor memory usage every 100ms
    this.memoryMonitor = setInterval(() => {
      const usage = process.memoryUsage();
      if (usage.heapUsed > this.config.memoryLimit) {
        throw new Error(`Memory limit exceeded: ${usage.heapUsed} > ${this.config.memoryLimit}`);
      }
    }, 100);
  }

  stopMonitoring(): void {
    if (this.memoryMonitor) {
      clearInterval(this.memoryMonitor);
      this.memoryMonitor = undefined;
    }
  }

  async measureExecution<T>(
    testName: string,
    executor: () => Promise<T>,
    harness: any
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const initialMemory = process.memoryUsage();
    const startTime = Date.now();
    let peakMemory = initialMemory;

    // Track peak memory during execution
    const memoryTracker = setInterval(() => {
      const current = process.memoryUsage();
      if (current.heapUsed > peakMemory.heapUsed) {
        peakMemory = current;
      }
    }, 10);

    try {
      const result = await executor();
      const endTime = Date.now();
      const finalMemory = process.memoryUsage();

      clearInterval(memoryTracker);

      const metrics: PerformanceMetrics = {
        executionTime: endTime - startTime,
        memoryUsage: {
          initial: initialMemory,
          peak: peakMemory,
          final: finalMemory,
        },
        resourceCounts: harness.getActiveResources(),
        apiCallCounts: {
          github: harness.github.getCallCount(),
          meticulous: harness.meticulous.getCallCount(),
          network: harness.network.getCallCount(),
        },
        errorCounts: {
          retries: harness.getRetryCount(),
          failures: harness.getFailureCount(),
        },
      };

      this.metrics.push(metrics);

      return { result, metrics };
    } catch (error) {
      clearInterval(memoryTracker);
      throw error;
    }
  }

  async runLoadTest(
    testName: string,
    testExecutor: () => Promise<any>,
    harness: any
  ): Promise<LoadTestResults> {
    const results: PerformanceMetrics[] = [];
    const errors: Error[] = [];
    const startTime = Date.now();

    await this.startMonitoring();

    try {
      // Create concurrent test runners
      const runners = Array.from({ length: this.config.concurrentRuns }, async (_, runnerIndex) => {
        // Stagger startup times for ramp-up
        const rampUpDelay = (runnerIndex / this.config.concurrentRuns) * this.config.rampUpTime;
        await new Promise(resolve => setTimeout(resolve, rampUpDelay));

        // Run iterations for this runner
        for (let i = 0; i < this.config.iterationsPerRun; i++) {
          try {
            const { metrics } = await this.measureExecution(
              `${testName}-runner-${runnerIndex}-iter-${i}`,
              testExecutor,
              harness
            );
            results.push(metrics);

            // Throttle to target throughput
            const expectedInterval = 1000 / this.config.targetThroughput;
            const actualInterval = Date.now() - startTime - (results.length - 1) * expectedInterval;
            if (actualInterval < expectedInterval) {
              await new Promise(resolve => setTimeout(resolve, expectedInterval - actualInterval));
            }
          } catch (error) {
            errors.push(error as Error);
          }
        }
      });

      // Wait for all runners to complete
      await Promise.allSettled(runners);

      const totalTime = Date.now() - startTime;

      return this.analyzeResults(testName, results, errors, totalTime);
    } finally {
      this.stopMonitoring();
    }
  }

  private analyzeResults(
    testName: string,
    results: PerformanceMetrics[],
    errors: Error[],
    totalTime: number
  ): LoadTestResults {
    if (results.length === 0) {
      throw new Error('No successful test runs completed');
    }

    const executionTimes = results.map(r => r.executionTime);
    const memoryUsages = results.map(r => r.memoryUsage.peak.heapUsed);

    return {
      testName,
      totalOperations: results.length,
      totalErrors: errors.length,
      totalTime,
      throughput: (results.length / totalTime) * 1000, // ops/sec
      
      executionTime: {
        min: Math.min(...executionTimes),
        max: Math.max(...executionTimes),
        average: executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length,
        p95: this.percentile(executionTimes, 95),
        p99: this.percentile(executionTimes, 99),
      },
      
      memoryUsage: {
        min: Math.min(...memoryUsages),
        max: Math.max(...memoryUsages),
        average: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
        p95: this.percentile(memoryUsages, 95),
        p99: this.percentile(memoryUsages, 99),
      },
      
      resourceLeaks: {
        maxTimers: Math.max(...results.map(r => r.resourceCounts.timers)),
        maxPromises: Math.max(...results.map(r => r.resourceCounts.promises)),
        avgTimers: results.reduce((sum, r) => sum + r.resourceCounts.timers, 0) / results.length,
        avgPromises: results.reduce((sum, r) => sum + r.resourceCounts.promises, 0) / results.length,
      },
      
      apiCallStats: {
        totalGitHubCalls: results.reduce((sum, r) => sum + r.apiCallCounts.github, 0),
        totalMeticulousCalls: results.reduce((sum, r) => sum + r.apiCallCounts.meticulous, 0),
        totalNetworkCalls: results.reduce((sum, r) => sum + r.apiCallCounts.network, 0),
      },
      
      errorAnalysis: {
        errorRate: errors.length / (results.length + errors.length),
        errorTypes: this.categorizeErrors(errors),
        totalRetries: results.reduce((sum, r) => sum + r.errorCounts.retries, 0),
      },
      
      passed: errors.length === 0 && results.every(r => 
        r.executionTime < this.config.maxExecutionTime &&
        r.memoryUsage.peak.heapUsed < this.config.memoryLimit &&
        r.resourceCounts.timers === 0 &&
        r.resourceCounts.promises === 0
      ),
    };
  }

  private percentile(values: number[], p: number): number {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  }

  private categorizeErrors(errors: Error[]): Record<string, number> {
    const categories: Record<string, number> = {};
    
    errors.forEach(error => {
      const message = error.message.toLowerCase();
      let category = 'other';
      
      if (message.includes('timeout')) category = 'timeout';
      else if (message.includes('memory')) category = 'memory';
      else if (message.includes('network')) category = 'network';
      else if (message.includes('rate limit')) category = 'rate-limit';
      else if (message.includes('permission')) category = 'permissions';
      
      categories[category] = (categories[category] || 0) + 1;
    });
    
    return categories;
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  generateReport(): string {
    if (this.metrics.length === 0) {
      return 'No performance metrics collected';
    }

    const executionTimes = this.metrics.map(m => m.executionTime);
    const memoryUsages = this.metrics.map(m => m.memoryUsage.peak.heapUsed);

    return `
Performance Test Report
=======================
Total Runs: ${this.metrics.length}
Execution Time (ms):
  - Average: ${(executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length).toFixed(2)}
  - Min: ${Math.min(...executionTimes)}
  - Max: ${Math.max(...executionTimes)}
  - P95: ${this.percentile(executionTimes, 95).toFixed(2)}

Memory Usage (MB):
  - Average: ${(memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length / 1024 / 1024).toFixed(2)}
  - Peak: ${(Math.max(...memoryUsages) / 1024 / 1024).toFixed(2)}
  
Resource Leaks:
  - Max Active Timers: ${Math.max(...this.metrics.map(m => m.resourceCounts.timers))}
  - Max Active Promises: ${Math.max(...this.metrics.map(m => m.resourceCounts.promises))}
`.trim();
  }
}

export interface LoadTestResults {
  testName: string;
  totalOperations: number;
  totalErrors: number;
  totalTime: number;
  throughput: number;
  
  executionTime: {
    min: number;
    max: number;
    average: number;
    p95: number;
    p99: number;
  };
  
  memoryUsage: {
    min: number;
    max: number;
    average: number;
    p95: number;
    p99: number;
  };
  
  resourceLeaks: {
    maxTimers: number;
    maxPromises: number;
    avgTimers: number;
    avgPromises: number;
  };
  
  apiCallStats: {
    totalGitHubCalls: number;
    totalMeticulousCalls: number;
    totalNetworkCalls: number;
  };
  
  errorAnalysis: {
    errorRate: number;
    errorTypes: Record<string, number>;
    totalRetries: number;
  };
  
  passed: boolean;
}

// Performance test configurations
export const PERFORMANCE_CONFIGS = {
  // Light load for development
  development: {
    concurrentRuns: 2,
    iterationsPerRun: 5,
    rampUpTime: 1000,
    targetThroughput: 2,
    maxExecutionTime: 30000,
    memoryLimit: 512 * 1024 * 1024, // 512MB
  },
  
  // Standard CI load
  ci: {
    concurrentRuns: 5,
    iterationsPerRun: 10,
    rampUpTime: 5000,
    targetThroughput: 5,
    maxExecutionTime: 60000,
    memoryLimit: 1024 * 1024 * 1024, // 1GB
  },
  
  // Stress testing
  stress: {
    concurrentRuns: 20,
    iterationsPerRun: 25,
    rampUpTime: 10000,
    targetThroughput: 10,
    maxExecutionTime: 120000,
    memoryLimit: 2048 * 1024 * 1024, // 2GB
  },
} as const;