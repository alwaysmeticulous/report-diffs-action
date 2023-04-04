import { connect } from "tls";
import { DOCKER_BRIDGE_NETWORK_GATEWAY } from "./get-inputs";

export const throwIfCannotConnectToOrigin = async (url: string) => {
  const { hostname, port, protocol, origin } = new URL(url);
  const defaultPortForProtocol = protocol === "https:" ? 443 : 80;
  const portNumber =
    port != null && port != "" ? Number(port) : defaultPortForProtocol;
  const connectionAccepted = await canConnectTo(hostname, Number(port));
  if (!connectionAccepted) {
    const rewrittenHostname = hostname.replace(
      DOCKER_BRIDGE_NETWORK_GATEWAY,
      "127.0.0.1"
    );
    const rewrittenOrigin = origin.replace(
      DOCKER_BRIDGE_NETWORK_GATEWAY,
      "127.0.0.1"
    );
    throw new Error(
      `Could not connect to '${rewrittenHostname}:${portNumber}'. Please check:\n\n` +
        `1. The server running at '${rewrittenOrigin}' has fully started by the time the Meticulous action starts. You may need to add a 'sleep 30' after starting the server to ensure that this is the case.\n` +
        `2. The server running at '${rewrittenOrigin}' is using tcp instead of tcp6 and is bound to 0.0.0.0 rather than a specific IP address. You can use 'netstat -tulpen' to see what addresses and ports it is bound to.\n\n`
    );
  }
};

const canConnectTo = async (host: string, port: number, timeout = 5000) => {
  return new Promise((resolve) => {
    const socket = connect(port, host, {}, () => {
      socket.end();
      resolve(true);
    });
    const onError = () => {
      socket.destroy();
      resolve(false);
    };

    socket.setTimeout(timeout, onError);
    socket.on("error", onError);
  });
};
