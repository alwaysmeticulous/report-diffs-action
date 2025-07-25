/**
 * Flexible test environment configuration supporting both mock and real API testing
 * Allows seamless switching between mock services and actual Meticulous endpoints
 */

export type TestEnvironmentMode = 'mock' | 'sandbox' | 'staging' | 'production';

export interface TestEnvironmentConfig {
  mode: TestEnvironmentMode;
  
  // Service endpoints
  endpoints: {
    meticulous: {
      apiUrl: string;
      websocketUrl?: string;
      cdnUrl?: string;
    };
    github: {
      apiUrl: string;
      graphqlUrl?: string;
    };
  };
  
  // Authentication
  authentication: {
    meticulous: {
      apiToken?: string;
      clientId?: string;
      clientSecret?: string;
    };
    github: {
      token?: string;
      appId?: string;
      privateKey?: string;
    };
  };
  
  // Test behavior configuration
  behavior: {
    useRealNetworkCalls: boolean;
    useRealGitOperations: boolean;
    enableRateLimiting: boolean;
    enableRetries: boolean;
    timeoutMs: number;
    maxConcurrentRequests: number;
  };
  
  // Mock configuration (only used in mock mode)
  mockConfig?: {
    simulateNetworkLatency: boolean;
    averageLatencyMs: number;
    errorRate: number; // 0-1, percentage of requests that should fail
    enableResourceTracking: boolean;
  };
  
  // Validation settings
  validation: {
    strictApiValidation: boolean;
    validateRequestSchemas: boolean;
    validateResponseSchemas: boolean;
    recordApiCalls: boolean;
  };
}

export const TEST_ENVIRONMENT_CONFIGS: Record<TestEnvironmentMode, TestEnvironmentConfig> = {
  mock: {
    mode: 'mock',
    endpoints: {
      meticulous: {
        apiUrl: 'http://localhost:3001/api',
        websocketUrl: 'ws://localhost:3001/ws',
        cdnUrl: 'http://localhost:3001/cdn',
      },
      github: {
        apiUrl: 'https://api.github.com',
        graphqlUrl: 'https://api.github.com/graphql',
      },
    },
    authentication: {
      meticulous: {
        apiToken: 'mock-api-token-12345',
      },
      github: {
        token: 'mock-github-token-67890',
      },
    },
    behavior: {
      useRealNetworkCalls: false,
      useRealGitOperations: false,
      enableRateLimiting: false,
      enableRetries: false,
      timeoutMs: 5000,
      maxConcurrentRequests: 10,
    },
    mockConfig: {
      simulateNetworkLatency: true,
      averageLatencyMs: 100,
      errorRate: 0.0, // No errors by default in mock mode
      enableResourceTracking: true,
    },
    validation: {
      strictApiValidation: true,
      validateRequestSchemas: true,
      validateResponseSchemas: true,
      recordApiCalls: true,
    },
  },
  
  sandbox: {
    mode: 'sandbox',
    endpoints: {
      meticulous: {
        apiUrl: 'https://api.sandbox.meticulous.ai',
        websocketUrl: 'wss://ws.sandbox.meticulous.ai',
        cdnUrl: 'https://cdn.sandbox.meticulous.ai',
      },
      github: {
        apiUrl: 'https://api.github.com',
        graphqlUrl: 'https://api.github.com/graphql',
      },
    },
    authentication: {
      meticulous: {
        apiToken: process.env.METICULOUS_SANDBOX_API_TOKEN,
      },
      github: {
        token: process.env.GITHUB_TEST_TOKEN,
      },
    },
    behavior: {
      useRealNetworkCalls: true,
      useRealGitOperations: false, // Still mock git for safety
      enableRateLimiting: true,
      enableRetries: true,
      timeoutMs: 30000,
      maxConcurrentRequests: 5,
    },
    validation: {
      strictApiValidation: true,
      validateRequestSchemas: true,
      validateResponseSchemas: true,
      recordApiCalls: true,
    },
  },
  
  staging: {
    mode: 'staging',
    endpoints: {
      meticulous: {
        apiUrl: 'https://api.staging.meticulous.ai',
        websocketUrl: 'wss://ws.staging.meticulous.ai',
        cdnUrl: 'https://cdn.staging.meticulous.ai',
      },
      github: {
        apiUrl: 'https://api.github.com',
        graphqlUrl: 'https://api.github.com/graphql',
      },
    },
    authentication: {
      meticulous: {
        apiToken: process.env.METICULOUS_STAGING_API_TOKEN,
      },
      github: {
        token: process.env.GITHUB_STAGING_TOKEN,
      },
    },
    behavior: {
      useRealNetworkCalls: true,
      useRealGitOperations: false,
      enableRateLimiting: true,
      enableRetries: true,
      timeoutMs: 60000,
      maxConcurrentRequests: 3,
    },
    validation: {
      strictApiValidation: true,
      validateRequestSchemas: true,
      validateResponseSchemas: true,
      recordApiCalls: true,
    },
  },
  
  production: {
    mode: 'production',
    endpoints: {
      meticulous: {
        apiUrl: 'https://api.meticulous.ai',
        websocketUrl: 'wss://ws.meticulous.ai',
        cdnUrl: 'https://cdn.meticulous.ai',
      },
      github: {
        apiUrl: 'https://api.github.com',
        graphqlUrl: 'https://api.github.com/graphql',
      },
    },
    authentication: {
      meticulous: {
        apiToken: process.env.METICULOUS_PRODUCTION_API_TOKEN,
      },
      github: {
        token: process.env.GITHUB_PRODUCTION_TOKEN,
      },
    },
    behavior: {
      useRealNetworkCalls: true,
      useRealGitOperations: false, // Never use real git in automated tests
      enableRateLimiting: true,
      enableRetries: true,
      timeoutMs: 120000,
      maxConcurrentRequests: 2,
    },
    validation: {
      strictApiValidation: true,
      validateRequestSchemas: true,
      validateResponseSchemas: true,
      recordApiCalls: false, // Don't record in production
    },
  },
};

export class TestEnvironmentManager {
  private currentConfig: TestEnvironmentConfig;
  
  constructor(mode: TestEnvironmentMode = 'mock') {
    this.currentConfig = { ...TEST_ENVIRONMENT_CONFIGS[mode] };
  }
  
  getConfig(): TestEnvironmentConfig {
    return { ...this.currentConfig };
  }
  
  updateConfig(updates: Partial<TestEnvironmentConfig>): void {
    this.currentConfig = { ...this.currentConfig, ...updates };
  }
  
  switchMode(mode: TestEnvironmentMode): void {
    this.currentConfig = { ...TEST_ENVIRONMENT_CONFIGS[mode] };
  }
  
  isUsingRealAPIs(): boolean {
    return this.currentConfig.behavior.useRealNetworkCalls;
  }
  
  shouldRecordAPICalls(): boolean {
    return this.currentConfig.validation.recordApiCalls;
  }
  
  getTimeout(): number {
    return this.currentConfig.behavior.timeoutMs;
  }
  
  getMaxConcurrentRequests(): number {
    return this.currentConfig.behavior.maxConcurrentRequests;
  }
  
  validateConfiguration(): void {
    const config = this.currentConfig;
    
    // Validate authentication tokens are present for real API modes
    if (config.behavior.useRealNetworkCalls) {
      if (!config.authentication.meticulous.apiToken) {
        throw new Error(`Meticulous API token is required for ${config.mode} mode`);
      }
      if (!config.authentication.github.token) {
        throw new Error(`GitHub token is required for ${config.mode} mode`);
      }
    }
    
    // Validate endpoints
    if (!config.endpoints.meticulous.apiUrl) {
      throw new Error('Meticulous API URL is required');
    }
    
    // Validate behavior settings
    if (config.behavior.timeoutMs <= 0) {
      throw new Error('Timeout must be positive');
    }
    
    if (config.behavior.maxConcurrentRequests <= 0) {
      throw new Error('Max concurrent requests must be positive');
    }
  }
}

// Utility functions for environment-specific testing
export function getTestEnvironmentFromEnv(): TestEnvironmentMode {
  const envMode = process.env.TEST_ENVIRONMENT_MODE?.toLowerCase();
  
  switch (envMode) {
    case 'sandbox':
      return 'sandbox';
    case 'staging':
      return 'staging';
    case 'production':
      return 'production';
    case 'mock':
    default:
      return 'mock';
  }
}

export function isRunningInCI(): boolean {
  return Boolean(
    process.env.CI ||
    process.env.GITHUB_ACTIONS ||
    process.env.JENKINS_URL ||
    process.env.BUILDKITE ||
    process.env.CIRCLECI
  );
}

export function shouldUseRealAPIs(): boolean {
  // Only use real APIs if explicitly requested and not in CI (unless specifically configured)
  const forceReal = process.env.USE_REAL_APIS === 'true';
  const allowInCI = process.env.ALLOW_REAL_APIS_IN_CI === 'true';
  
  if (forceReal && (allowInCI || !isRunningInCI())) {
    return true;
  }
  
  return false;
}

// Environment-specific test configuration helpers
export function createTestConfig(overrides: Partial<TestEnvironmentConfig> = {}): TestEnvironmentConfig {
  const baseMode = getTestEnvironmentFromEnv();
  const baseConfig = TEST_ENVIRONMENT_CONFIGS[baseMode];
  
  // Override with environment-specific settings
  if (shouldUseRealAPIs()) {
    overrides.behavior = {
      ...overrides.behavior,
      useRealNetworkCalls: true,
    };
  }
  
  return {
    ...baseConfig,
    ...overrides,
  };
}