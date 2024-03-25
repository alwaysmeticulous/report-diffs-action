import { execSync } from "child_process";
import { mkdirSync, writeFileSync } from "fs";
import * as Sentry from "@sentry/node";
import { Logger } from "loglevel";

export const DOCKER_BRIDGE_NETWORK_GATEWAY = "172.17.0.1";

// We are running in a docker container and need to proxy to localhost.
// We previously just rewrote the app URL to point to the host IP, but
// this breaks some sites that behave specially on localhost (e.g.
// allowing auth to go ahead with HTTPS).
export const spinUpProxyIfNeeded = (appUrl: string, logger: Logger): void => {
  try {
    const url = new URL(appUrl);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      const defaultPortForProtocol = url.protocol === "https:" ? 443 : 80;
      const port = url.port || defaultPortForProtocol;
      const nginxConfig = `
        events {}
        http {
            server {
                listen ${port};
                server_name localhost;
                location / {
                    proxy_pass http://${DOCKER_BRIDGE_NETWORK_GATEWAY}:${port};
                }
            }
        }
      `;
      mkdirSync("/etc/nginx", { recursive: true });
      writeFileSync("/etc/nginx/nginx.conf", nginxConfig);
      execSync("service nginx restart");
      logger.info(
        `Successfully set up a proxy to host machine on port ${port}`
      );
    }
  } catch (error) {
    Sentry.captureException(error);
    logger.error("Error while spinning up proxy", error);
  }
};
