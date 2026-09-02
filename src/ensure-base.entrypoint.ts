import "source-map-support/register";
import { setFailed } from "@actions/core";
import * as Sentry from "@sentry/node";
import { runMeticulousEnsureBaseAction } from "./actions/ensure-base/ensure-base";
import { setMeticulousClientUserAgentSuffix } from "./common/user-agent";

setMeticulousClientUserAgentSuffix("ensure-base");

runMeticulousEnsureBaseAction().catch(async (error) => {
  Sentry.captureException(error);

  const message = error instanceof Error ? error.message : `${error}`;
  setFailed(message);

  await Sentry.flush(5_000);
  process.exit(1);
});
