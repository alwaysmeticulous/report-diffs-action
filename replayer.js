"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.replayEvents = void 0;
const common_1 = require("@alwaysmeticulous/common");
const loglevel_1 = __importDefault(require("loglevel"));
const luxon_1 = require("luxon");
const puppeteer_1 = require("puppeteer");
const output_utils_1 = require("./output.utils");
const replay_utils_1 = require("./replay.utils");
const screenshot_utils_1 = require("./screenshot.utils");
const collector_1 = require("./timeline/collector");
const replayEvents = async (options) => {
  const logger = loglevel_1.default.getLogger(common_1.METICULOUS_LOGGER_NAME);
  const logLevel = logger.getLevel();
  logger.debug(options);
  const {
    appUrl,
    browser: browser_,
    outputDir,
    session,
    sessionData,
    replayExecutionOptions,
    dependencies,
    screenshottingOptions,
    generatedBy,
  } = options;
  // Extract replay metadata
  const {
    headless,
    devTools,
    shiftTime,
    networkStubbing,
    skipPauses,
    padTime,
    maxDurationMs,
    maxEventCount,
    disableRemoteFonts,
    bypassCSP,
    moveBeforeClick,
  } = replayExecutionOptions;
  const metadata = {
    session,
    options: {
      appUrl,
      outputDir,
      dependencies,
      ...replayExecutionOptions,
    },
    generatedBy,
  };
  const defaultViewport = (0, replay_utils_1.getStartingViewport)(sessionData);
  const windowWidth = defaultViewport.width + 20;
  const windowHeight = defaultViewport.height + 200;
  const browser =
    browser_ ||
    (await (0, puppeteer_1.launch)({
      defaultViewport: defaultViewport,
      args: [
        `--window-size=${windowWidth},${windowHeight}`,
        // This disables cross-origin security. We need this in order to disable CORS for replayed network requests,
        // including the respective Preflgiht CORS requests which are not handled by the network stubbing layer.
        "--disable-web-security",
        ...common_1.COMMON_CHROMIUM_FLAGS,
        ...(disableRemoteFonts ? ["--disable-remote-fonts"] : []),
        "--no-sandbox",
      ],
      headless: headless,
      devtools: devTools,
    }));
  const context = await browser.createIncognitoBrowserContext();
  (await browser.defaultBrowserContext().pages()).forEach((page) =>
    page.close().catch((error) => {
      logger.error(error);
    })
  );
  const timelineCollector = new collector_1.ReplayTimelineCollector();
  const onTimelineEvent = (entry) => timelineCollector.addEntry(entry);
  const virtualTime = skipPauses ? { enabled: true } : { enabled: false };
  const page = await (0, replay_utils_1.createReplayPage)({
    context,
    defaultViewport,
    sessionData,
    shiftTime,
    dependencies,
    onTimelineEvent,
    bypassCSP,
    virtualTime,
  });
  // Calculate start URL based on the one that the session originated on/from.
  const originalSessionStartUrl = (0,
  replay_utils_1.getOriginalSessionStartUrl)({
    session,
    sessionData,
  });
  const startUrl = (0, replay_utils_1.getStartUrl)({
    originalSessionStartUrl,
    appUrl,
  });
  const replayData = await (0, replay_utils_1.initializeReplayData)({
    page,
    startUrl,
  });
  // Set-up network stubbing if required
  if (networkStubbing) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const networkStubbingExports = require(dependencies.nodeNetworkStubbing
      .location);
    const setupReplayNetworkStubbing =
      networkStubbingExports.setupReplayNetworkStubbing;
    await setupReplayNetworkStubbing({
      page,
      logLevel,
      sessionData,
      startUrl,
      originalSessionStartUrl: originalSessionStartUrl.toString(),
      onTimelineEvent,
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const browserContextSeedingExports = require(dependencies.nodeBrowserContext
    .location);
  const setupBrowserContextSeeding =
    browserContextSeedingExports.setupBrowserContextSeeding;
  await setupBrowserContextSeeding({
    page,
    sessionData,
    startUrl,
  });
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const replayUserInteractionsExports = require(dependencies
    .nodeUserInteractions.location);
  const replayUserInteractions =
    replayUserInteractionsExports.replayUserInteractions;
  // Navigate to the start URL.
  logger.debug(`Navigating to ${startUrl}`);
  const res = await page.goto(startUrl, {
    waitUntil: "domcontentloaded",
  });
  const status = res && res.status();
  if (status !== 200) {
    throw new Error(
      `Expected a 200 status when going to the initial URL of the site (${startUrl}). Got a ${status} instead.`
    );
  }
  logger.debug(`Navigated to ${startUrl}`);
  // Start simulating user interaction events
  logger.info("Starting simulation...");
  const startTime = luxon_1.DateTime.utc();
  const screenshotsDir = await (0, output_utils_1.prepareScreenshotsDir)(
    outputDir
  );
  const storyboard =
    screenshottingOptions.enabled &&
    screenshottingOptions.storyboardOptions.enabled
      ? { enabled: true, screenshotsDir }
      : { enabled: false };
  const sessionDuration = (0, replay_utils_1.getSessionDuration)(sessionData);
  try {
    const replayResult = await replayUserInteractions({
      page,
      logLevel,
      sessionData,
      moveBeforeClick,
      virtualTime,
      storyboard,
      onTimelineEvent,
      ...(sessionDuration != null
        ? {
            sessionDurationMs:
              sessionDuration === null || sessionDuration === void 0
                ? void 0
                : sessionDuration.milliseconds,
          }
        : {}),
      ...(maxDurationMs != null ? { maxDurationMs } : {}),
      ...(maxEventCount != null ? { maxEventCount } : {}),
    });
    logger.debug(`Replay result: ${JSON.stringify(replayResult)}`);
    // Pad replay time according to session duration recorded with rrweb
    if (
      padTime &&
      !skipPauses &&
      replayResult.length === "full" &&
      sessionDuration != null
    ) {
      const now = luxon_1.DateTime.utc();
      const timeToPad = startTime.plus(sessionDuration).diff(now).toMillis();
      logger.debug(`Padtime: ${timeToPad} ${sessionDuration.toISOTime()}`);
      if (timeToPad > 0) {
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, timeToPad);
        });
      }
    }
  } catch (error) {
    logger.error("Error thrown during replay", error);
    onTimelineEvent({
      kind: "fatalError",
      start: new Date().getTime(),
      end: new Date().getTime(),
      data: serializeError(error),
    });
  }
  logger.debug("Collecting coverage data...");
  const coverageData = await page.coverage.stopJSCoverage();
  logger.debug("Collected coverage data");
  logger.info("Simulation done!");
  if (screenshottingOptions.enabled) {
    await (0, screenshot_utils_1.takeScreenshot)({
      page,
      outputDir,
      screenshotSelector: screenshottingOptions.screenshotSelector,
    });
  }
  logger.debug("Writing output");
  logger.debug(`Output dir: ${outputDir}`);
  await (0, output_utils_1.writeOutput)({
    outputDir,
    metadata,
    sessionData,
    replayData,
    coverageData,
    timelineData: timelineCollector.getEntries(),
  });
  if (shouldHoldBrowserOpen()) {
    await new Promise(() => {
      /* never resolve / wait forever */
    });
  }
  logger.debug("Closing browser");
  await browser.close();
};
exports.replayEvents = replayEvents;
const shouldHoldBrowserOpen = () => {
  var _a;
  return (
    ((_a = process.env["METICULOUS_HOLD_BROWSER_OPEN"]) !== null &&
    _a !== void 0
      ? _a
      : ""
    ).toLowerCase() === "true"
  );
};
const serializeError = (error) => {
  var _a;
  if (error == null) {
    return { message: null, stack: null };
  }
  const message =
    (_a = toStringOrNull(error.message)) !== null && _a !== void 0
      ? _a
      : toStringOrNull(error);
  const stack = toStringOrNull(error.stack);
  return { message, stack };
};
const toStringOrNull = (value) => (value != null ? `${value}` : null);
