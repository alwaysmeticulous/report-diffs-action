import { throwIfCannotConnectToOrigin } from "../../common/check-connection";
import { spinUpProxyIfNeeded } from "../../actions/main/utils/proxy";
import { NetworkService } from "../types";
import { Logger } from "loglevel";

export class DefaultNetworkService implements NetworkService {
  async checkConnection(url: string): Promise<void> {
    await throwIfCannotConnectToOrigin(url);
  }

  spinUpProxy(options: {
    targetUrl: string;
    additionalPorts?: string;
    aliasedUrl?: string;
    logger: Logger;
  }): void {
    spinUpProxyIfNeeded(
      options.targetUrl,
      options.additionalPorts,
      options.aliasedUrl,
      options.logger
    );
  }
}