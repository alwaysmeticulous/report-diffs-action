import process from "process";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { sentryRollupPlugin } from "@sentry/rollup-plugin";
import { nodeExternals } from "rollup-plugin-node-externals";

function optionalDependencies(optionalDeps = []) {
  return {
    name: "optional-dependencies",
    resolveId(id) {
      if (optionalDeps.includes(id)) {
        return { id, external: false, moduleSideEffects: false };
      }
      return null;
    },
    load(id) {
      if (optionalDeps.includes(id)) {
        return `
let optionalModule = null;
try {
  optionalModule = require('${id}');
} catch (e) {
  // Optional dependency '${id}' is not available
}
export default optionalModule;
`;
      }
      return null;
    },
  };
}

const entrypoints = [
  {
    input: "src/main.entrypoint.ts",
    output: "dist/main.entrypoint.cjs",
    format: "cjs",
  },
  {
    input: "src/main.post-step.entrypoint.ts",
    output: "out/main.post-step.entrypoint.cjs",
    format: "cjs",
  },
  {
    input: "src/cloud-compute.entrypoint.ts",
    output: "out/cloud-compute.entrypoint.cjs",
    format: "cjs",
  },
  {
    input: "src/cloud-compute.post-step.entrypoint.ts",
    output: "out/cloud-compute.post-step.entrypoint.cjs",
    format: "cjs",
  },
  {
    input: "src/upload-assets.entrypoint.ts",
    output: "out/upload-assets.entrypoint.cjs",
    format: "cjs",
  },
  {
    input: "src/upload-assets.post-step.entrypoint.ts",
    output: "out/upload-assets.post-step.entrypoint.cjs",
    format: "cjs",
  },
];

export default entrypoints.map(({ input, output, format }) => ({
  input,
  output: {
    file: output,
    format: format,
    sourcemap: false,
    inlineDynamicImports: true,
    generatedCode: {
      constBindings: true,
    },
  },
  plugins: [
    nodeExternals({
      builtins: true,
      deps: true,
      devDeps: false,
      peerDeps: true,
      optDeps: true,
    }),
    optionalDependencies([
      "osx-temperature-sensor",
      "bufferutil",
      "utf-8-validate",
    ]),
    nodeResolve({
      preferBuiltins: true,
      exportConditions: ["node"],
    }),
    commonjs({
      ignoreTryCatch: false,
      ignoreDynamicRequires: true,
      strictRequires: true,
    }),
    json(),
    typescript({
      tsconfig: "tsconfig.json",
      sourceMap: false,
      inlineSources: false,
      declaration: false,
      outDir: undefined,
    }),
    process.env.SENTRY_AUTH_TOKEN &&
      sentryRollupPlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: process.env.SENTRY_ORG || "alwaysmeticulous",
        project: process.env.SENTRY_PROJECT || "report-diffs-action",
        release: {
          name: process.env.SENTRY_RELEASE || "report-diffs-action@latest",
          create: true,
        },
        telemetry: false,
        silent: false,
      }),
  ].filter(Boolean),
  external: [
    "./getMachineId-darwin",
    "./getMachineId-linux",
    "./getMachineId-win32",
  ],
}));
