/**
 * Stamps this action's identity (sub-action path + the pinned git ref) into the
 * User-Agent of every Meticulous API request made by the process. The SDK
 * (`@alwaysmeticulous/client`) reads `METICULOUS_CLIENT_USER_AGENT_SUFFIX` and
 * appends it to its User-Agent, so backend logs (queryable in Datadog as
 * `@userAgent`) show which `report-diffs-action` version a customer pins, e.g.
 * `@alwaysmeticulous/client/2.289.0 report-diffs-action/cloud-compute@v1`.
 *
 * Using the env var rather than the `appInfo` client option is deliberate: the
 * bundled `remote-replay-launcher` builds its own client from just the API
 * token, so an option passed to the action's own `createClient` calls would not
 * reach it. The env var reaches every client in the process.
 *
 * Must be called before any client is created (i.e. at the start of an
 * entrypoint). `subAction` is the path under `report-diffs-action/` that the
 * step is invoked as (e.g. `"cloud-compute"`); omit it for the root action.
 */
export const setMeticulousClientUserAgentSuffix = (
  subAction?: string
): void => {
  const name = subAction
    ? `report-diffs-action/${subAction}`
    : "report-diffs-action";
  // Git refs only contain a restricted character set, but sanitize defensively
  // so an unexpected value can never produce an invalid header (undici rejects
  // control characters) — characters outside word/`.`/`-`/`/` are dropped.
  const ref = process.env["GITHUB_ACTION_REF"]?.replace(/[^\w.\-/]/g, "");
  process.env["METICULOUS_CLIENT_USER_AGENT_SUFFIX"] = ref
    ? `${name}@${ref}`
    : name;
};
