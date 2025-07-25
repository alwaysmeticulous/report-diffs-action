// Jest setup for integration tests
import 'jest';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Global test setup
beforeAll(() => {
  // Suppress console output during tests unless running in verbose mode
  if (!process.env.VERBOSE && !process.env.CI) {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  }
  
  // Set test environment
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  // Restore console methods
  jest.restoreAllMocks();
});