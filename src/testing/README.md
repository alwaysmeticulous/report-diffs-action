# Integration Testing Framework

This directory contains a comprehensive integration testing framework for the Meticulous Report Diffs Action. The framework uses dependency injection to enable fast, reliable testing of complex workflows without requiring actual GitHub Actions or external API calls.

## Architecture

### Dependency Injection

The framework uses dependency injection to replace external dependencies with controllable mocks:

- **GitHub Service**: Mocks GitHub API calls and context
- **Meticulous Service**: Mocks Meticulous API interactions  
- **File System Service**: In-memory file system for tests
- **Network Service**: Controllable network simulation
- **Actions Service**: Captures GitHub Actions core function calls
- **Sentry Service**: Tracks telemetry and error reporting

### Key Components

- `types.ts` - Service interfaces and dependency contracts
- `services/` - Production implementations of services
- `mocks/` - Test doubles for all external dependencies
- `test-harness.ts` - Main test orchestration class
- `utils/` - Test utilities, assertions, and scenario builders

## Usage Examples

### Basic Test Setup

```typescript
import { MainAction } from "../actions/main/main-action";
import { TestHarness } from "./test-harness";
import { createDefaultActionEnvironment } from "./utils";

describe("MainAction Tests", () => {
  let harness: TestHarness;
  let action: MainAction;

  beforeEach(() => {
    harness = new TestHarness();
    action = new MainAction(harness.getDependencies());
    
    // Set up environment variables
    Object.entries(createDefaultActionEnvironment()).forEach(([key, value]) => {
      process.env[key] = value;
    });
  });

  it("should handle successful pull request", async () => {
    // Arrange
    harness.simulatePullRequest();
    harness.simulateSuccessfulTestRun();
    
    // Act
    const exitCode = await action.run();
    
    // Assert
    expect(exitCode).toBe(0);
    harness.assertActionSucceeded();
    harness.assertTestRunExecuted();
  });
});
```

### Using Scenario Builders

```typescript
import { scenarios, createAssertions } from "./utils";

it("should handle pull request with diffs", async () => {
  // Arrange - Use pre-built scenario
  const harness = scenarios.pullRequestWithDiffs().build();
  const action = new MainAction(harness.getDependencies());
  const assert = createAssertions(harness);

  // Act
  const exitCode = await action.run();

  // Assert
  expect(exitCode).toBe(0);
  assert.action.succeeded();
  assert.testRun.wasExecuted();
  assert.github.commentCreated();
});
```

### Custom Scenarios

```typescript
import { createScenario } from "./utils";

it("should handle custom deployment scenario", async () => {
  // Arrange
  const harness = createScenario()
    .withPullRequest({ headSha: "custom-sha" })
    .withSuccessfulTestRun({ testRunId: "custom-run" })
    .withDeploymentUrl({ environmentUrl: "https://custom.example.com" })
    .withCustomConfig({ PARALLEL_TASKS: "8" })
    .build();

  const action = new MainAction(harness.getDependencies());

  // Act & Assert
  const exitCode = await action.run();
  expect(exitCode).toBe(0);
});
```

### Testing Error Conditions

```typescript
it("should handle API errors gracefully", async () => {
  // Arrange
  const harness = scenarios.meticulousApiError().build();
  const action = new MainAction(harness.getDependencies());
  const assert = createAssertions(harness);

  // Act
  const exitCode = await action.run();

  // Assert
  expect(exitCode).toBe(1);
  assert.action.failed("API rate limit exceeded");
  assert.sentry.exceptionCaptured();
});
```

## Test Scenarios

### Pre-built Scenarios

The framework includes several pre-built scenarios in `utils/scenario-builders.ts`:

- `pullRequestWithNoDiffs()` - Standard PR with passing tests
- `pullRequestWithDiffs()` - PR with visual differences 
- `pushToMain()` - Push event to main branch
- `meticulousApiError()` - API error simulation
- `deploymentUrlScenario()` - Deployment URL integration

### Custom Scenario Builder

Use `createScenario()` to build custom test scenarios:

```typescript
const harness = createScenario()
  .withPullRequest({ number: 456, headSha: "abc123" })
  .withTestRunError("Network timeout")
  .withGitHubApiError()
  .build();
```

## Assertions

The framework provides fluent assertion helpers:

```typescript
const assert = createAssertions(harness);

// Action assertions
assert.action.succeeded();
assert.action.failed("Expected error message");
assert.action.setOutput("result", "success");

// Test run assertions  
assert.testRun.wasExecuted();
assert.testRun.hadConfiguration({ appUrl: "http://localhost:3000" });
assert.testRun.hadCommitSha("head-sha");

// GitHub assertions
assert.github.commentCreated("Expected comment content");
assert.github.statusSet("success");

// Sentry assertions
assert.sentry.initialized();
assert.sentry.exceptionCaptured("Expected error");
```

## Environment Management

Use `EnvironmentManager` for clean environment handling:

```typescript
import { EnvironmentManager, createDefaultActionEnvironment } from "./utils";

const envManager = new EnvironmentManager();

beforeEach(() => {
  const snapshot = envManager.snapshot();
  envManager.setTestEnvironment(createDefaultActionEnvironment());
  // Test runs with clean environment
});

afterEach(() => {
  envManager.restore(); // Restores original environment
});
```

## Mock Capabilities

### GitHub Mock

```typescript
// Simulate different GitHub contexts
harness.github.updateContext({
  eventName: "pull_request",
  payload: { /* custom payload */ }
});

// Mock API responses
harness.github.updateOctokit({
  issues: {
    createComment: jest.fn().mockResolvedValue({ data: { id: 123 } })
  }
});
```

### Meticulous Mock

```typescript
// Simulate successful test runs
harness.meticulous.updateOptions({
  executeTestRun: {
    success: true,
    testRunId: "test-123",
    diffs: [{ testCaseId: "test-1", hasDiff: true }]
  }
});

// Simulate API errors
harness.meticulous.updateOptions({
  shouldThrow: true,
  executeTestRun: { success: false, error: "API Error" }
});
```

## Running Tests

```bash
# Run all tests
yarn test

# Run only unit tests
yarn test:unit

# Run only integration tests  
yarn test:integration

# Run tests in watch mode
yarn test --watch

# Run tests with coverage
yarn test --coverage
```

## Benefits

1. **Fast Execution**: No external API calls or file system operations
2. **Deterministic**: Controlled inputs and outputs for reliable testing  
3. **Comprehensive Coverage**: Test error conditions and edge cases easily
4. **Maintainable**: Clear separation between test setup and assertions
5. **Realistic**: Tests actual action code with realistic dependency interactions

## Extending the Framework

To add new mock capabilities:

1. Define interface in `types.ts`
2. Create production implementation in `services/`
3. Create mock implementation in `mocks/`
4. Add mock to `TestHarness`
5. Add assertion helpers in `utils/assertion-helpers.ts`
6. Create scenario builder methods as needed