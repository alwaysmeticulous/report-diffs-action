import { ActionDependencies } from "../types";
import { DefaultGitHubService } from "./github.service";
import { DefaultMeticulousService } from "./meticulous.service";
import { DefaultFileSystemService } from "./filesystem.service";
import { DefaultNetworkService } from "./network.service";
import { DefaultActionsService } from "./actions.service";
import { DefaultSentryService } from "./sentry.service";
import { initLogger } from "../../common/logger.utils";

export function createDefaultDependencies(): ActionDependencies {
  return {
    github: new DefaultGitHubService(),
    meticulous: new DefaultMeticulousService(),
    fileSystem: new DefaultFileSystemService(),
    network: new DefaultNetworkService(),
    actions: new DefaultActionsService(),
    sentry: new DefaultSentryService(),
    logger: initLogger(),
  };
}

export * from "./github.service";
export * from "./meticulous.service";
export * from "./filesystem.service";
export * from "./network.service";
export * from "./actions.service";
export * from "./sentry.service";