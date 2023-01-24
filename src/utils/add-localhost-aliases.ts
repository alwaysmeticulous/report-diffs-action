import { resolve4 } from "dns/promises";
import { appendFile } from "fs/promises";
import { METICULOUS_LOGGER_NAME } from "@alwaysmeticulous/common";
import log from "loglevel";
import { DOCKER_BRIDGE_NETWORK_GATEWAY } from "./get-inputs";

const HOSTS_FILE = "/etc/hosts";

// Adds aliases intended for localhost in `/etc/hosts`, mapped instead
// to the Docker Network bridge gateway IP address.
export const addLocalhostAliases = async ({
  appUrl,
  localhostAliases,
}: {
  appUrl: string;
  localhostAliases: string | null;
}): Promise<void> => {
  const autoDetectedAlias = await autoDetectAppURlAlias({ appUrl });

  if (!localhostAliases && autoDetectedAlias == null) {
    return;
  }

  const aliases = localhostAliases
    ? localhostAliases.split(",").map((alias) => alias.trim())
    : [];

  const allAliases = [
    ...aliases,
    ...(autoDetectedAlias ? [autoDetectedAlias] : []),
  ];

  const hostsEntries = allAliases
    .map((alias) => `${DOCKER_BRIDGE_NETWORK_GATEWAY}\t${alias}`)
    .join("\n");

  await appendFile(HOSTS_FILE, `\n${hostsEntries}`, { encoding: "utf-8" });
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
