import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import { sentryRollupPlugin } from '@sentry/rollup-plugin';

// Define the entrypoints that should be built with Rollup
const entrypoints = [
  // Main entrypoint - ESModule format for GitHub Actions
  {
    input: 'src/main.entrypoint.ts',
    output: 'dist/main.entrypoint.mjs',
    format: 'es',
    banner: false // No shebang for ESModule
  },
  // All other entrypoints - CommonJS format
  {
    input: 'src/main.post-step.entrypoint.ts',
    output: 'out/main.post-step.entrypoint.cjs',
    format: 'cjs',
    banner: true
  },
  {
    input: 'src/cloud-compute.entrypoint.ts', 
    output: 'out/cloud-compute.entrypoint.cjs',
    format: 'cjs',
    banner: true
  },
  {
    input: 'src/cloud-compute.post-step.entrypoint.ts',
    output: 'out/cloud-compute.post-step.entrypoint.cjs',
    format: 'cjs',
    banner: true
  },
  {
    input: 'src/upload-assets.entrypoint.ts',
    output: 'out/upload-assets.entrypoint.cjs',
    format: 'cjs',
    banner: true
  },
  {
    input: 'src/upload-assets.post-step.entrypoint.ts',
    output: 'out/upload-assets.post-step.entrypoint.cjs',
    format: 'cjs',
    banner: true
  }
];

// Create Rollup configuration for each entrypoint
export default entrypoints.map(({ input, output, format, banner }) => ({
  input,
  output: {
    file: output,
    format: format,
    sourcemap: false, // No sourcemaps in final build
    banner: banner ? '#!/usr/bin/env node' : undefined,
    inlineDynamicImports: true // Ensure single file output
  },
  plugins: [
    // Resolve node modules
    nodeResolve({
      preferBuiltins: true,
      exportConditions: ['node']
    }),
    // Convert CommonJS modules to ES6
    commonjs({
      ignoreTryCatch: false
    }),
    // Handle JSON imports
    json(),
    // Compile TypeScript
    typescript({
      tsconfig: 'tsconfig.json',
      sourceMap: false, // No sourcemaps in final build
      inlineSources: false,
      declaration: false,
      outDir: undefined
    }),
    // Create Sentry release (only when SENTRY_AUTH_TOKEN is provided)
    // Set SENTRY_ORG, SENTRY_PROJECT, and SENTRY_RELEASE environment variables to customize
    process.env.SENTRY_AUTH_TOKEN && sentryRollupPlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: process.env.SENTRY_ORG || 'alwaysmeticulous',
      project: process.env.SENTRY_PROJECT || 'report-diffs-action',
      release: {
        name: process.env.SENTRY_RELEASE || 'report-diffs-action@latest',
        create: true
      },
      telemetry: false,
      silent: false
    })
  ].filter(Boolean),
  // Don't bundle Node.js built-ins and native modules  
  external: [
    // Node.js built-ins
    'fs', 'path', 'os', 'crypto', 'events', 'stream', 'util', 'buffer',
    'child_process', 'net', 'tls', 'http', 'https', 'url', 'dns', 'zlib',
    'perf_hooks', 'worker_threads', 'diagnostics_channel', 'tty', 'module',
    'assert', 'node:util', 'node:child_process', 'node:fs', 'node:os',
    // Native modules and optional dependencies that may not be available
    'osx-temperature-sensor',
    './getMachineId-darwin',
    './getMachineId-linux',  
    './getMachineId-win32'
  ]
}));