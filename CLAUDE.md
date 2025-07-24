# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Meticulous Report Diffs Action - a GitHub Action that performs visual regression testing by comparing screenshots between base and head commits in pull requests. It's a Docker-based action with multiple entrypoints for different functionalities.

## Common Development Commands

```bash
# Install dependencies
yarn install

# Development
yarn dev                    # Run parcel in watch mode
yarn build                  # Build all targets

# Code quality
yarn lint                   # Run ESLint
yarn lint:fix              # Fix linting issues
yarn format                # Format code with Prettier
yarn format:check          # Check formatting

# Testing
yarn test                   # Run Jest tests

# Deployment
yarn sentry:sourcemaps      # Upload sourcemaps to Sentry (requires SENTRY_AUTH_TOKEN)
```

## Architecture

### Multiple Actions & Entrypoints

The project contains three separate GitHub Actions:
1. **Main Action** (`action.yml`) - Primary visual testing action
   - Entry: `src/main.entrypoint.ts` → `dist/main.entrypoint.mjs` (ESModule)
   - Post-step: `src/main.post-step.entrypoint.ts` → `out/post-step.entrypoint.js` (CommonJS)

2. **Cloud Compute Action** (`cloud-compute/action.yml`) - Runs tests in Meticulous cloud
   - Entry: `src/cloud-compute.entrypoint.ts` → `out/cloud-compute.entrypoint.js`

3. **Upload Assets Action** (`upload-assets/action.yml`) - Uploads test assets
   - Entry: `src/upload-assets.entrypoint.ts` → `out/upload-assets.entrypoint.js`

### Build Configuration

- Uses Parcel bundler with different targets:
  - Main action: ESModule format without sourcemaps (due to GitHub Actions limitations)
  - Other actions: CommonJS with sourcemaps for better debugging
- TypeScript with strict configuration
- Sentry integration for error tracking

### Key Directories

- `/src/actions/` - Implementation for each action (main, cloud-compute, upload-assets)
- `/src/common/` - Shared utilities and types
- `/dist/` - Built ESModule output (main action)
- `/out/` - Built CommonJS output (other actions)
- `/tests/` - Test React application for integration testing

### Testing

The project includes multiple test workflows in `.github/workflows/` for different scenarios. When modifying the action logic, ensure tests pass by checking the GitHub Actions tab.

### Important Notes

- The main entrypoint must be ESModule format without sourcemaps due to GitHub Actions requirements
- All other entrypoints use CommonJS with sourcemaps
- The action runs in a Docker container with Chrome installed for visual testing
- Error tracking is configured through Sentry - ensure proper error handling in all code paths