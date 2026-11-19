import { setFailed } from "@actions/core";

// The secure tunnel this action relied on has been shut down. The action is kept as a stub so
// workflows pinned to `cloud-compute@v1` fail with a migration message rather than a missing action.
setFailed(
  "The tunnel is no longer supported. Please migrate to `upload-assets` or `upload-container`: " +
    "https://app.meticulous.ai/docs/github-actions-v2"
);
