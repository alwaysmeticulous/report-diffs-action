# Meticulous Report Diffs Action

A GitHub Action that performs visual regression testing by comparing screenshots between base and head commits in pull requests.

**[Full setup guide and documentation →](https://app.meticulous.ai/docs/github-actions-v2)**

## Available Actions

| Action | Use Case |
|--------|----------|
| `upload-assets` | Upload static assets for testing **(recommended for static sites)** |
| `cloud-compute` | Test via secure tunnel to your locally-served app |
| `report-diffs-action` | Run tests in GitHub Actions runner (legacy) |

> **Recommendation:** If your app can be built as static assets (HTML/JS/CSS), use `upload-assets`. It's simpler and more reliable than running a server in CI.

## Quick Start

### Static Sites (Recommended)

```yaml
- uses: alwaysmeticulous/report-diffs-action/upload-assets@v1
  with:
    api-token: ${{ secrets.METICULOUS_API_TOKEN }}
    app-directory: "dist"  # Your build output directory
```

### Apps Requiring a Server

```yaml
- name: Serve app
  run: |
    npm run build && npm run serve &
    sleep 5

- uses: alwaysmeticulous/report-diffs-action/cloud-compute@v1
  with:
    api-token: ${{ secrets.METICULOUS_API_TOKEN }}
    app-url: "http://localhost:3000/"
```

## Configuration Reference

All inputs are documented in the `action.yml` files:

- [`upload-assets/action.yaml`](./upload-assets/action.yaml)
- [`cloud-compute/action.yml`](./cloud-compute/action.yml)
- [`action.yml`](./action.yml) (legacy)

## Required Workflow Setup

```yaml
on:
  push:
    branches: [main]
  pull_request: {}
  workflow_dispatch: {}  # Required for base commit comparison

permissions:
  actions: write
  contents: read
  issues: write
  pull-requests: write
  statuses: read
```

## Documentation

- **[Setup Guide](https://app.meticulous.ai/docs/github-actions-v2)** - Complete CI setup instructions
- **[Troubleshooting](https://app.meticulous.ai/docs/how-to/record-and-replay-on-different-environments)** - Cross-environment issues
- **[FAQ](https://app.meticulous.ai/docs/faq-and-troubleshooting)** - Common questions

## Releases

1. Create PR to merge `main` into `releases/v1` → [Create PR](https://github.com/alwaysmeticulous/report-diffs-action/compare/releases/v1...main)
2. Merge as a **merge commit** (not squash/rebase)
3. [Draft a new release](https://github.com/alwaysmeticulous/report-diffs-action/releases/new) with tag `v1.x.y` targeting `releases/v1`
4. The `@v1` tag auto-updates after build completes

## Support

- [Documentation](https://app.meticulous.ai/docs)
- [GitHub Issues](https://github.com/alwaysmeticulous/report-diffs-action/issues)
