# Comprehensive Testing Framework

A flexible, production-ready testing framework for the Meticulous Report Diffs Action that supports both mock testing and real API integration testing.

## Features

- **🎭 Dual Mode Testing**: Seamlessly switch between mock services and real Meticulous APIs
- **🏗️ Modular Architecture**: Composable test scenarios and service factories
- **📊 Performance Testing**: Built-in load testing and performance monitoring
- **🔧 Environment Flexibility**: Support for development, sandbox, staging, and production environments
- **🛡️ Resource Management**: Comprehensive resource tracking and cleanup
- **📈 Metrics Collection**: Detailed API call tracking and validation
- **⚡ Parallel Execution**: Configurable concurrent test execution

## Quick Start

### Basic Mock Testing

```bash
# Run basic tests with mock services
./src/testing/scripts/run-comprehensive-tests.sh

# Or with yarn
yarn test:integration
```

### Real API Testing

```bash
# Set up environment variables
export METICULOUS_SANDBOX_API_TOKEN="your-sandbox-token"
export GITHUB_TEST_TOKEN="your-github-token"

# Run against Meticulous sandbox
./src/testing/scripts/run-comprehensive-tests.sh --mode sandbox --real-api

# Run with performance testing
./src/testing/scripts/run-comprehensive-tests.sh --mode sandbox --real-api --performance
```

## Environment Configuration

### Test Modes

| Mode | Purpose | Endpoints | Authentication Required |
|------|---------|-----------|------------------------|
| `mock` | Local development, CI/CD | Mock services | No |
| `sandbox` | Integration testing | Meticulous sandbox | METICULOUS_SANDBOX_API_TOKEN |
| `staging` | Pre-production testing | Meticulous staging | METICULOUS_STAGING_API_TOKEN |
| `production` | Production validation | Meticulous production | METICULOUS_PRODUCTION_API_TOKEN |

### Environment Variables

```bash
# Required for real API testing
METICULOUS_SANDBOX_API_TOKEN="mt_sandbox_..."
GITHUB_TEST_TOKEN="ghp_..."

# Optional configuration
TEST_ENVIRONMENT_MODE="sandbox"           # Override test mode
USE_REAL_APIS="true"                     # Force real API usage
ALLOW_REAL_APIS_IN_CI="true"             # Allow real APIs in CI
VERBOSE="true"                           # Enable verbose logging
```

## Test Architecture

### Service Factory Pattern

The framework uses an adaptive service factory that creates either mock or real service instances based on configuration:

```typescript
// Automatically creates mock or real services
const harness = new ComprehensiveTestHarness({
  environmentConfig: {
    mode: 'sandbox',
    behavior: {
      useRealNetworkCalls: true,
      enableRetries: true,
      timeoutMs: 60000,
    },
  },
});
```

### Composable Scenarios

Build complex test scenarios using the scenario composer:

```typescript
const scenario = harness
  .createScenario('complex-workflow')
  .withPullRequest({ title: 'Feature XYZ' })
  .withSuccessfulTestRun([
    { testCaseId: 'login', hasDiff: false },
    { testCaseId: 'checkout', hasDiff: true, diffUrl: '...' },
  ])
  .withCustomStep('validate-metrics', async (ctx) => {
    // Custom validation logic
  });

await scenario.execute();
```

## Test Categories

### 1. Basic Integration Tests

Tests core functionality with both mock and real APIs:

```bash
yarn test:integration:enhanced
```

### 2. Comprehensive Scenario Tests

Covers edge cases, error scenarios, and complex workflows:

```bash
yarn test:integration:comprehensive
```

### 3. Multi-Action Tests

Tests all three GitHub Actions (main, cloud-compute, upload-assets):

```bash
yarn test:integration:multi-action
```

### 4. Real API Tests

Full integration tests against actual Meticulous endpoints:

```bash
yarn test:integration:real-api
```

### 5. Performance Tests

Load testing and performance benchmarking:

```bash
yarn test:performance
```

## Writing Tests

### Basic Test Structure

```typescript
import { ComprehensiveTestHarness } from '../framework/comprehensive-test-harness';
import { MainAction } from '../../actions/main/main-action';

describe('My Test Suite', () => {
  let harness: ComprehensiveTestHarness;

  beforeEach(async () => {
    harness = new ComprehensiveTestHarness({
      environmentConfig: { mode: 'mock' },
      enablePerformanceTracking: true,
    });
    await harness.setup();
  });

  afterEach(async () => {
    await harness.cleanup();
  });

  it('should execute successfully', async () => {
    // Arrange
    harness.simulatePullRequestEvent({ title: 'Test PR' });
    harness.simulateSuccessfulTestRun();

    // Act
    const action = new MainAction(harness.getDependencies());
    const exitCode = await action.run();

    // Assert
    expect(exitCode).toBe(0);
    harness.assertActionSucceeded();
    harness.assertTestRunExecuted();
  });
});
```

### Performance Testing

```typescript
it('should handle load efficiently', async () => {
  const { result, metrics } = await harness.runPerformanceTest(
    'load-test',
    async () => {
      const action = new MainAction(harness.getDependencies());
      return await action.run();
    }
  );

  expect(result).toBe(0);
  expect(metrics.executionTime).toBeLessThan(10000);
  expect(metrics.memoryUsage.peak.heapUsed).toBeLessThan(512 * 1024 * 1024);
});
```

### Real API Testing

```typescript
it('should work with real Meticulous API', async () => {
  // This test will automatically use real APIs if configured
  const harness = new ComprehensiveTestHarness({
    environmentConfig: {
      mode: 'sandbox',
      behavior: { useRealNetworkCalls: true },
    },
  });

  await harness.setup();
  
  // Test logic remains the same
  harness.simulatePullRequestEvent();
  const action = new MainAction(harness.getDependencies());
  const exitCode = await action.run();
  
  expect(exitCode).toBe(0);
  
  // Validate real API responses
  const metrics = harness.getMetrics();
  expect(metrics.summary.totalApiCalls).toBeGreaterThan(0);
});
```

## Configuration Examples

### Development Testing

```bash
# Quick mock tests for development
./run-comprehensive-tests.sh --mode mock --env development
```

### CI/CD Pipeline

```bash
# Comprehensive CI testing
./run-comprehensive-tests.sh --mode mock --env ci --parallel --coverage

# With real API validation (if tokens available)
./run-comprehensive-tests.sh --mode sandbox --real-api --env ci
```

### Load Testing

```bash
# Stress testing with performance monitoring
./run-comprehensive-tests.sh --mode mock --env stress --performance --parallel
```

### Production Validation

```bash
# Careful production testing (with real APIs)
export METICULOUS_PRODUCTION_API_TOKEN="..."
./run-comprehensive-tests.sh --mode production --real-api --verbose
```

## Switching to Real APIs

The framework is designed to make switching from mock to real APIs straightforward:

### 1. Environment Variables

```bash
# Set your API tokens
export METICULOUS_SANDBOX_API_TOKEN="mt_sandbox_your_token_here"
export GITHUB_TEST_TOKEN="ghp_your_github_token_here"

# Enable real API usage
export USE_REAL_APIS="true"
```

### 2. Test Configuration

```typescript
// In your test files, the harness will automatically detect and use real APIs
const harness = new ComprehensiveTestHarness({
  environmentConfig: {
    mode: 'sandbox', // or 'staging', 'production'
  },
});
```

### 3. Script Usage

```bash
# Simple switch to real APIs
./run-comprehensive-tests.sh --mode sandbox --real-api
```

## Performance Monitoring

The framework includes comprehensive performance monitoring:

- **Execution Time**: Per-test and overall execution timing
- **Memory Usage**: Peak and average memory consumption
- **Resource Leaks**: Timer, promise, and handle tracking
- **API Metrics**: Call counts, response times, error rates
- **Network Performance**: Request/response timing and payload sizes

## Best Practices

### 1. Test Isolation

- Each test runs in a completely isolated environment
- Temporary directories are created and cleaned up automatically
- Environment variables are restored after each test

### 2. Resource Management

- All timers, promises, and network resources are tracked
- Automatic cleanup prevents resource leaks
- Tests fail if resources are not properly cleaned up

### 3. Error Handling

- Comprehensive error simulation for both network and API failures
- Retry logic testing with configurable failure rates
- Graceful degradation testing

### 4. Real API Safety

- Git operations are always mocked (even in real API mode)
- Rate limiting is respected in real API tests
- Separate environments (sandbox/staging) prevent production impact

## Troubleshooting

### Common Issues

1. **Tests hanging**: Usually indicates resource leaks
   ```bash
   # Run with resource tracking
   VERBOSE=true yarn test:integration
   ```

2. **Real API failures**: Check token configuration
   ```bash
   # Verify tokens are set
   echo $METICULOUS_SANDBOX_API_TOKEN
   echo $GITHUB_TEST_TOKEN
   ```

3. **Performance issues**: Use performance profiling
   ```bash
   # Run with performance monitoring
   ./run-comprehensive-tests.sh --performance --verbose
   ```

### Debug Mode

```bash
# Enable verbose logging
VERBOSE=true ./run-comprehensive-tests.sh --mode sandbox --real-api

# Or set in test configuration
const harness = new ComprehensiveTestHarness({
  environmentConfig: {
    validation: {
      recordApiCalls: true,
      validateRequestSchemas: true,
      validateResponseSchemas: true,
    },
  },
});
```

## Contributing

When adding new tests:

1. Use the `ComprehensiveTestHarness` for consistency
2. Include both mock and real API test coverage
3. Add performance benchmarks for critical paths
4. Ensure proper resource cleanup
5. Document any new environment variables or configuration options

## Migration Guide

### From Legacy Test Harness

```typescript
// Old way
import { TestHarness } from './test-harness';
const harness = new TestHarness();

// New way
import { ComprehensiveTestHarness } from './framework/comprehensive-test-harness';
const harness = new ComprehensiveTestHarness({
  environmentConfig: { mode: 'mock' },
});
```

### Adding Real API Support

1. Set up environment variables for your target environment
2. Update test configuration to use real APIs
3. Add validation for real API responses
4. Include performance benchmarks for real API calls