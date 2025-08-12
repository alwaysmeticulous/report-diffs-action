const baseConfig = {
  bundle: true,
  platform: "node",
  target: "node20",
  sourcemap: true,
  treeShaking: true,
  external: [],
  splitting: false,
  logLevel: "info",
};

const targets = [
  {
    ...baseConfig,
    entryPoints: ["src/main.entrypoint.ts"],
    outfile: "dist/main.entrypoint.js",
    format: "esm",
    banner: {
      js: 'import { createRequire as __esmCreateRequire } from "module"; import { fileURLToPath as __esmFileURLToPath } from "url"; import { dirname as __esmDirname } from "path"; const require = __esmCreateRequire(import.meta.url); const __filename = __esmFileURLToPath(import.meta.url); const __dirname = __esmDirname(__filename);',
    },
  },
  {
    ...baseConfig,
    entryPoints: ["src/main.post-step.entrypoint.ts"],
    outfile: "out/main.post-step.entrypoint.js",
    format: "cjs",
  },
  {
    ...baseConfig,
    entryPoints: ["src/cloud-compute.entrypoint.ts"],
    outfile: "out/cloud-compute.entrypoint.js",
    format: "cjs",
  },
  {
    ...baseConfig,
    entryPoints: ["src/cloud-compute.post-step.entrypoint.ts"],
    outfile: "out/cloud-compute.post-step.entrypoint.js",
    format: "cjs",
  },
  {
    ...baseConfig,
    entryPoints: ["src/upload-assets.entrypoint.ts"],
    outfile: "out/upload-assets.entrypoint.js",
    format: "cjs",
  },
  {
    ...baseConfig,
    entryPoints: ["src/upload-assets.post-step.entrypoint.ts"],
    outfile: "out/upload-assets.post-step.entrypoint.js",
    format: "cjs",
  },
];

export { targets, baseConfig };
