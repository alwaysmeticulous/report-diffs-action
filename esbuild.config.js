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
    format: "cjs",
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
  {
    ...baseConfig,
    entryPoints: [
      "node_modules/@alwaysmeticulous/tunnels-client/dist/lib/tunnel-worker.entrypoint.js",
    ],
    outfile: "out/tunnel-worker.entrypoint.js",
    format: "cjs",
  },
];

export { targets, baseConfig };
