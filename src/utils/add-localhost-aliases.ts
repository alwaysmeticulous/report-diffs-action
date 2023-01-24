import { appendFile } from "fs/promises";
import { DOCKER_BRIDGE_NETWORK_GATEWAY } from "./get-inputs";

const HOSTS_FILE = "/etc/hosts";

// Adds aliases intended for localhost in `/etc/hosts`, mapped instead
// to the Docker Network bridge gateway IP address.
export const addLocalhostAliases = async ({
  localhostAliases,
}: {
  localhostAliases: string | null;
}): Promise<void> => {
  if (!localhostAliases) {
    return;
  }

  const aliases = localhostAliases.split(",").map((alias) => alias.trim());
  const hostsEntries = aliases
    .map((alias) => `${DOCKER_BRIDGE_NETWORK_GATEWAY}\t${alias}`)
    .join("\n");

  await appendFile(HOSTS_FILE, `\n${hostsEntries}`, { encoding: "utf-8" });
};
