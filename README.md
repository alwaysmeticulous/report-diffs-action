# Meticulous Report Diffs Action

A GitHub Action that performs visual regression testing by comparing screenshots between base and head commits in pull requests.

**[Full setup guide and documentation →](https://app.meticulous.ai/docs/github-actions-v2)**

## Available Actions

| Action | Use Case |
|--------|----------|
| `upload-assets` | Upload built static assets for Meticulous to test **(recommended for static sites)** |
| `upload-container` | Upload a built Docker image for Meticulous to host and test **(recommended for server-rendered apps, e.g. Next.js)** |
| `cloud-compute` | Test a locally-served app via a secure tunnel (last resort) |
| `report-diffs-action` | Run tests in GitHub Actions runner (legacy) |

> **Recommendation:** Pick the first approach that fits your app:
> 1. **`upload-assets`** if your app can be served as a folder of static assets (HTML/JS/CSS).
> 2. **`upload-container`** if your app is server-rendered (Next.js, Nuxt, etc.) — build a Docker image and let Meticulous host it.
> 3. **`cloud-compute`** only if neither of the above work — it serves the app from CI and connects via a secure tunnel, which is more brittle.

## Quick Start

### Static Sites (Recommended)

```yaml
- uses: alwaysmeticulous/report-diffs-action/upload-assets@v1
  with:
    api-token: ${{ secrets.METICULOUS_API_TOKEN }}
    app-directory: "dist"  # Your build output directory
```

### Server-Rendered Apps (Recommended)

Build a Docker image of your app and upload it. Meticulous runs the container in its own infrastructure for the duration of the test run, so no server needs to stay alive in CI.

```yaml
- uses: docker/setup-buildx-action@v3

- uses: docker/build-push-action@v6
  with:
    context: .
    tags: my-app:${{ github.sha }}
    push: false

- uses: alwaysmeticulous/report-diffs-action/upload-container@v1
  with:
    api-token: ${{ secrets.METICULOUS_API_TOKEN }}
    image-tag: my-app:${{ github.sha }}
    # Optional: set if your container does not respect the PORT env var
    container-port: 3000
    # Optional: extra env vars passed to the container at run time
    container-env: |
      NODE_ENV=production
```

The container must:
- Be built for `linux/amd64`
- Listen on the `PORT` env var (or set `container-port` to the hard-coded port)
- Respond `2xx` to the health-check endpoint (defaults to `GET /`, override with `container-health-check-endpoint`)

### Last Resort: Tunnel to a Locally-Served App

Only use this if your app can't be uploaded as static assets or as a container image.

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
- [`upload-container/action.yml`](./upload-container/action.yml)
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
