import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

// Shared TypeScript configuration
const typescriptConfig = {
  outputToFilesystem: false,
  compilerOptions: {
    outDir: undefined,
    declarationDir: undefined,
    declaration: false,
    declarationMap: false,
    composite: false,
  },
};

// Shared plugins
const plugins = [
  typescript(typescriptConfig),
  nodeResolve({ preferBuiltins: true }),
  commonjs(),
  json(),
  terser(),
];

// Base output configurations
const baseOutput = {
  inlineDynamicImports: true,
  compact: true,
};

const esOutput = {
  ...baseOutput,
  format: "es",
};

const cjsOutput = {
  ...baseOutput,
  format: "cjs",
  sourcemap: true,
};

// Build targets configuration
const targets = [
  {
    input: "src/main.entrypoint.ts",
    output: { ...esOutput, file: "dist/main.entrypoint.mjs" },
  },
  {
    input: "src/main.post-step.entrypoint.ts",
    output: { ...cjsOutput, file: "out/main.post-step.entrypoint.js" },
  },
  {
    input: "src/cloud-compute.entrypoint.ts",
    output: { ...cjsOutput, file: "out/cloud-compute.entrypoint.js" },
  },
  {
    input: "src/cloud-compute.post-step.entrypoint.ts",
    output: { ...cjsOutput, file: "out/cloud-compute.post-step.entrypoint.js" },
  },
  {
    input: "src/upload-assets.entrypoint.ts",
    output: { ...cjsOutput, file: "out/upload-assets.entrypoint.js" },
  },
  {
    input: "src/upload-assets.post-step.entrypoint.ts",
    output: { ...cjsOutput, file: "out/upload-assets.post-step.entrypoint.js" },
  },
];

// Generate configurations
const configs = targets.map(({ input, output }) => ({
  input,
  output,
  plugins,
  external: [], // Include all node_modules
}));

export default configs;
