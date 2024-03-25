# report-diffs-action cloud-compute

Action for running Meticulous tests. `@alwaysmeticulous/report-diffs-action/cloud-compute` is similar
to `@alwaysmeticulous/report-diffs-action` but tests are executed in Meticulous' cloud, rather than
within the GitHub Action runner.

This action creates a secure tunnel to the locally hosted application assets (e.g. `localhost:3000`) via the
[Meticulous secure tunnels service](https://github.com/alwaysmeticulous/meticulous-sdk/tree/79e655fd5fcec9617b2a4b31640ede21ab112981/packages/tunnel-client).
