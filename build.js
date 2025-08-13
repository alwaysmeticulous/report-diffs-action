const esbuild = require("esbuild");
const { targets } = require("./esbuild.config.js");

async function build() {
  for (const target of targets) {
    try {
      await esbuild.build(target);
      console.log(`✓ Built ${target.outfile || target.outdir}`);
    } catch (error) {
      console.error(
        `✗ Failed to build ${target.outfile || target.outdir}:`,
        error
      );
      process.exit(1);
    }
  }
  console.log("🎉 All builds completed successfully!");
}

build().catch((error) => {
  console.error("Build failed:", error);
  process.exit(1);
});
