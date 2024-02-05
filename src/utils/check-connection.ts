import { Socket } from "net";

export const throwIfCannotConnectToOrigin = async (url: string) => {
  const { hostname, port, protocol, origin } = new URL(url);
  const defaultPortForProtocol = protocol === "https:" ? 443 : 80;
  const portNumber =
    port != null && port != "" ? Number(port) : defaultPortForProtocol;
  const connectionAccepted = await canConnectTo(hostname, portNumber);
  if (!connectionAccepted) {
    throw new Error(
      `Could not connect to '${hostname}:${portNumber}'. Please check:\n\n` +
        `1. The server running at '${origin}' has fully started by the time the Meticulous action starts. You may need to add a 'sleep 30' after starting the server to ensure that this is the case.\n` +
        `2. The server running at '${origin}' is using tcp instead of tcp6. You can use 'netstat -tulpen' to see what addresses and ports it is bound to.\n\n`
    );
  }
};

const canConnectTo = async (host: string, port: number, timeout = 5000) => {
  return new Promise((resolve) => {
    const socket = new Socket();
    const onError = () => {
      socket.destroy();
      resolve(false);
    };

    socket.setTimeout(timeout, onError);
    socket.on("error", onError);
    socket.connect(port, host, () => {
      socket.end();
      resolve(true);
    });
  });
};
