import { METICULOUS_LOGGER_NAME } from "@alwaysmeticulous/common";
import log from "loglevel";
import prefix from "loglevel-plugin-prefix";

export const getPrefixedLogger = (logPrefix: string) => {
  const prefixedLogger = log.getLogger(
    `${METICULOUS_LOGGER_NAME}/${logPrefix}`
  );
  prefixedLogger.setLevel(
    +(process.env["RUNNER_DEBUG"] ?? "0") ? log.levels.TRACE : log.levels.INFO
  );
  prefix.reg(log);
  prefix.apply(prefixedLogger, {
    template: `[${logPrefix}] %l:`,
  });
  return prefixedLogger;
};

export const initLogger: () => void = () => {
  const logger = log.getLogger(METICULOUS_LOGGER_NAME);
  logger.setDefaultLevel(log.levels.INFO);
};

export const setLogLevel: (logLevel: string | undefined) => void = (
  logLevel
) => {
  const logger = log.getLogger(METICULOUS_LOGGER_NAME);
  switch ((logLevel || "").toLocaleLowerCase()) {
    case "trace":
      logger.setLevel(log.levels.TRACE, false);
      break;
    case "debug":
      logger.setLevel(log.levels.DEBUG, false);
      break;
    case "info":
      logger.setLevel(log.levels.INFO, false);
      break;
    case "warn":
      logger.setLevel(log.levels.WARN, false);
      break;
    case "error":
      logger.setLevel(log.levels.ERROR, false);
      break;
    case "silent":
      logger.setLevel(log.levels.SILENT, false);
      break;
    default:
      break;
  }
};

export const shortSha = (sha: string) => sha.slice(0, 7);
