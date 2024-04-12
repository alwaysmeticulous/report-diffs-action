import { resolve4 } from "dns/promises";
import { appendFile } from "fs/promises";
import { METICULOUS_LOGGER_NAME } from "@alwaysmeticulous/common";
import log from "loglevel";
import { DOCKER_BRIDGE_NETWORK_GATEWAY } from "./proxy";

const HOSTS_FILE = "/etc/hosts";

// Adds aliases intended for localhost in `/etc/hosts`, mapped instead
// to either the Docker Network bridge gateway IP address, or 127.0.0.1
// if the alias is the host of the app URL (and hence will be forwarded to
// Docker Network bridge by our nginx proxy).
// Returns whether or not we aliased the app URL to 127.0.0.1, so that we
// know downstream whether we need to open the proxy.
export const addLocalhostAliases = async ({
  appUrl,
  localhostAliases,
}: {
  appUrl: string | null;
  localhostAliases: string | null;
}): Promise<boolean> => {
  const autoDetectedAlias = appUrl
    ? await autoDetectAppURlAlias({ appUrl })
    : null;

  if (!localhostAliases && autoDetectedAlias == null) {
    return false;
  }

  const aliases = localhostAliases
    ? localhostAliases.split(",").map((alias) => alias.trim())
    : [];

  const allAliases = [
    ...aliases,
    ...(autoDetectedAlias ? [autoDetectedAlias] : []),
  ];

  let appUrlAliasedToLocalhost = false;
  const getIp = (alias: string) => {
    if (!appUrl) {
      return DOCKER_BRIDGE_NETWORK_GATEWAY;
    }
    try {
      const url = new URL(appUrl);
      if (url.hostname === alias) {
        appUrlAliasedToLocalhost = true;
        return "127.0.0.1";
      }
    } catch (error) {
      // Do nothing, we'll just use the Docker Network bridge gateway IP
    }
    return DOCKER_BRIDGE_NETWORK_GATEWAY;
  };

  const hostsEntries = allAliases
    .map((alias) => `${getIp(alias)}\t${alias}`)
    .join("\n");

  const logger = log.getLogger(METICULOUS_LOGGER_NAME);
  logger.debug(`Adding aliases to /etc/hosts: ${hostsEntries}`);

  await appendFile(HOSTS_FILE, `\n${hostsEntries}`, { encoding: "utf-8" });
  return appUrlAliasedToLocalhost;
};

// Attempts to detect if `appUrl` is aliased to `localhost`
const autoDetectAppURlAlias = async ({
  appUrl,
}: {
  appUrl: string;
}): Promise<string | null> => {
  if (!appUrl) {
    return null;
  }
  try {
    const url = new URL(appUrl);
    const ipAddresses = await resolve4(url.hostname).catch<string[]>(() => {
      return [];
    });
    if (ipAddresses.every((address) => address !== "127.0.0.1")) {
      return null;
    }
    // Do not alias 'localhost'
    if (url.hostname === "localhost") {
      return null;
    }
    const logger = log.getLogger(METICULOUS_LOGGER_NAME);
    logger.info(`Auto-detected localhost alias: ${url.hostname}`);
    return url.hostname;
  } catch (error) {
    if (error instanceof TypeError) {
      return null;
    }
    throw error;
  }
};
