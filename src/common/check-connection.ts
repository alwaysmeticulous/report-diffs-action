import * as retry from "retry";

export const throwIfCannotConnectToOrigin = async (appUrl: string) => {
  // Wait 1s, 2s, 4s, 8s, 16s, 32s, 64s for a total of just over 2 minutes
  const operation = retry.operation({
    retries: 7,
    factor: 2,
    minTimeout: 1_000,
  });
  const url = new URL(appUrl);
  return new Promise<void>((resolve, reject) => {
    operation.attempt(async () => {
      if (await canConnectTo(url)) {
        resolve();
        return;
      }
      const err = new Error(
        `Could not connect to '${appUrl}'. Please check:\n\n` +
          `1. The server running at '${appUrl}' has fully started by the time the Meticulous action starts. You may need to add a 'sleep 30' after starting the server to ensure that this is the case.\n` +
          `2. The server running at '${appUrl}' is using tcp instead of tcp6. You can use 'netstat -tulpen' to see what addresses and ports it is bound to.\n\n`
      );
      if (!operation.retry(err)) {
        reject(operation.mainError());
      }
    });
  });
};

const canConnectTo = async (url: URL) => {
  try {
    const result = await fetchWithTimeout(url);
    return result.status !== 502;
  } catch (error) {
    return false;
  }
};

async function fetchWithTimeout(url: URL) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 5000);

  const response = await fetch(url, {
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
}
