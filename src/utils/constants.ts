export const EXPECTED_PERMISSIONS_BLOCK = [
  "  permissions:",
  "    actions: write",
  "    checks: write",
  "    contents: read",
  "    discussions: write",
  "    pull-requests: write",
  "    statuses: write",
  "    deployments: read",
  "",
].join("\n");

// The version of the environment in which a replay is executed. This should be bumped whenever
// the environment changes in a way that would cause a replay to behave differently, e.g. upgrading to a newer
// replay-orchestrator-launcher version, or changing the version of puppeteer.
export const LOGICAL_ENVIRONMENT_VERSION = 2;
