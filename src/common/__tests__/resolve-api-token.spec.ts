import { getInput, getState, saveState, setSecret } from "@actions/core";
import {
  hasCiOidcEnv,
  hasGitHubActionsOidcEnv,
  resolveCiOidcAccessToken,
} from "@alwaysmeticulous/client";
import log from "loglevel";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createActionApiTokenResolver,
  getActionAuthInputs,
  OIDC_ACCESS_TOKEN_EXPIRES_AT_STATE_KEY,
  OIDC_ACCESS_TOKEN_STATE_KEY,
  UPLOAD_MIN_REMAINING_VALIDITY_MS,
} from "../resolve-api-token";

vi.mock("@actions/core", () => ({
  getInput: vi.fn(),
  getState: vi.fn(),
  saveState: vi.fn(),
  setSecret: vi.fn(),
}));

vi.mock("@alwaysmeticulous/client", () => ({
  hasCiOidcEnv: vi.fn(),
  hasGitHubActionsOidcEnv: vi.fn(),
  resolveCiOidcAccessToken: vi.fn(),
}));

const logger = log.getLogger("resolve-api-token.spec");
logger.setLevel("silent");

const GITHUB_OIDC_ENV: NodeJS.ProcessEnv = {
  ACTIONS_ID_TOKEN_REQUEST_URL:
    "https://token.actions.githubusercontent.com/id",
  ACTIONS_ID_TOKEN_REQUEST_TOKEN: "gh-request-token",
};

describe("getActionAuthInputs", () => {
  beforeEach(() => {
    vi.mocked(getInput).mockReset();
  });

  it("reads optional api-token, project, and oidc-audience inputs", () => {
    vi.mocked(getInput).mockImplementation((name) => {
      switch (name) {
        case "api-token":
          return "  my-token  ";
        case "project":
          return " my-org/my-project ";
        case "oidc-audience":
          return " https://custom.example.com ";
        default:
          return "";
      }
    });

    expect(getActionAuthInputs()).toEqual({
      apiToken: "my-token",
      project: "my-org/my-project",
      oidcAudience: "https://custom.example.com",
    });
  });

  it("omits blank inputs", () => {
    vi.mocked(getInput).mockReturnValue("   ");
    expect(getActionAuthInputs()).toEqual({});
  });
});

describe("createActionApiTokenResolver", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-27T12:00:00.000Z"));

    vi.mocked(getState).mockReset().mockReturnValue("");
    vi.mocked(saveState).mockReset();
    vi.mocked(setSecret).mockReset();
    vi.mocked(hasCiOidcEnv).mockReset().mockReturnValue(true);
    vi.mocked(hasGitHubActionsOidcEnv).mockReset().mockReturnValue(true);
    vi.mocked(resolveCiOidcAccessToken).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns explicit apiToken without invoking OIDC or state", async () => {
    const resolver = createActionApiTokenResolver({
      apiToken: "  explicit-api-token  ",
      env: GITHUB_OIDC_ENV,
      logger,
    });

    await expect(resolver.getApiToken()).resolves.toBe("explicit-api-token");
    expect(resolveCiOidcAccessToken).not.toHaveBeenCalled();
    expect(saveState).not.toHaveBeenCalled();
    expect(setSecret).not.toHaveBeenCalled();
  });

  it("falls back to METICULOUS_API_TOKEN env var before OIDC", async () => {
    const resolver = createActionApiTokenResolver({
      env: {
        ...GITHUB_OIDC_ENV,
        METICULOUS_API_TOKEN: "env-api-token",
      },
      logger,
    });

    await expect(resolver.getApiToken()).resolves.toBe("env-api-token");
    expect(resolveCiOidcAccessToken).not.toHaveBeenCalled();
  });

  it("exchanges GitHub Actions OIDC, masks the token, saves state, and caches in memory", async () => {
    const expiresAt = new Date(Date.now() + 45 * 60_000).toISOString();
    vi.mocked(resolveCiOidcAccessToken).mockResolvedValueOnce({
      accessToken: "wfat-first-token",
      expiresAt,
    });

    const resolver = createActionApiTokenResolver({
      project: "my-org/my-project",
      oidcAudience: "https://custom.example.com",
      env: GITHUB_OIDC_ENV,
      logger,
    });

    const first = await resolver.getApiToken();
    const second = await resolver.getApiToken();

    expect(first).toBe("wfat-first-token");
    expect(second).toBe("wfat-first-token");
    expect(resolveCiOidcAccessToken).toHaveBeenCalledTimes(1);
    expect(resolveCiOidcAccessToken).toHaveBeenCalledWith({
      project: "my-org/my-project",
      audience: "https://custom.example.com",
      env: GITHUB_OIDC_ENV,
    });
    expect(setSecret).toHaveBeenCalledWith("wfat-first-token");
    expect(saveState).toHaveBeenCalledWith(
      OIDC_ACCESS_TOKEN_STATE_KEY,
      "wfat-first-token"
    );
    expect(saveState).toHaveBeenCalledWith(
      OIDC_ACCESS_TOKEN_EXPIRES_AT_STATE_KEY,
      expiresAt
    );
  });

  it("skips saveState when persistState is false", async () => {
    const expiresAt = new Date(Date.now() + 45 * 60_000).toISOString();
    vi.mocked(resolveCiOidcAccessToken).mockResolvedValueOnce({
      accessToken: "wfat-no-state",
      expiresAt,
    });

    const resolver = createActionApiTokenResolver({
      persistState: false,
      env: GITHUB_OIDC_ENV,
      logger,
    });

    await expect(resolver.getApiToken()).resolves.toBe("wfat-no-state");
    expect(setSecret).toHaveBeenCalledWith("wfat-no-state");
    expect(saveState).not.toHaveBeenCalled();
  });

  it("refreshes before a long upload when remaining validity is below threshold", async () => {
    vi.mocked(resolveCiOidcAccessToken)
      .mockResolvedValueOnce({
        accessToken: "wfat-initial",
        expiresAt: new Date(Date.now() + 45 * 60_000).toISOString(),
      })
      .mockResolvedValueOnce({
        accessToken: "wfat-refreshed",
        expiresAt: new Date(Date.now() + 80 * 60_000).toISOString(),
      });

    const resolver = createActionApiTokenResolver({
      env: GITHUB_OIDC_ENV,
      logger,
    });

    expect(await resolver.getApiToken()).toBe("wfat-initial");

    // 35 minutes later, only 10 minutes remain (< 15 minute upload threshold).
    vi.advanceTimersByTime(35 * 60_000);

    expect(
      await resolver.getApiToken({
        minRemainingValidityMs: UPLOAD_MIN_REMAINING_VALIDITY_MS,
      })
    ).toBe("wfat-refreshed");
    expect(resolveCiOidcAccessToken).toHaveBeenCalledTimes(2);
    expect(setSecret).toHaveBeenCalledWith("wfat-refreshed");
    expect(saveState).toHaveBeenLastCalledWith(
      OIDC_ACCESS_TOKEN_EXPIRES_AT_STATE_KEY,
      expect.any(String)
    );
  });

  it("keeps still-valid cached token if proactive refresh fails", async () => {
    vi.mocked(resolveCiOidcAccessToken)
      .mockResolvedValueOnce({
        accessToken: "wfat-initial",
        expiresAt: new Date(Date.now() + 45 * 60_000).toISOString(),
      })
      .mockRejectedValueOnce(new Error("transient OIDC outage"));

    const resolver = createActionApiTokenResolver({
      env: GITHUB_OIDC_ENV,
      logger,
    });

    expect(await resolver.getApiToken()).toBe("wfat-initial");

    vi.advanceTimersByTime(35 * 60_000);

    expect(
      await resolver.getApiToken({
        minRemainingValidityMs: UPLOAD_MIN_REMAINING_VALIDITY_MS,
      })
    ).toBe("wfat-initial");
    expect(resolveCiOidcAccessToken).toHaveBeenCalledTimes(2);
  });

  it("reuses valid saved state in post-step without re-exchanging OIDC", async () => {
    const savedExpiresAt = new Date(Date.now() + 20 * 60_000).toISOString();
    vi.mocked(getState).mockImplementation((key) => {
      if (key === OIDC_ACCESS_TOKEN_STATE_KEY) {
        return "wfat-from-main-step";
      }
      if (key === OIDC_ACCESS_TOKEN_EXPIRES_AT_STATE_KEY) {
        return savedExpiresAt;
      }
      return "";
    });

    const resolver = createActionApiTokenResolver({
      allowSavedState: true,
      persistState: false,
      env: GITHUB_OIDC_ENV,
      logger,
    });

    await expect(resolver.getApiToken()).resolves.toBe("wfat-from-main-step");
    expect(setSecret).toHaveBeenCalledWith("wfat-from-main-step");
    expect(resolveCiOidcAccessToken).not.toHaveBeenCalled();
  });

  it("exchanges a fresh OIDC token in post-step when saved token is expired", async () => {
    const expiredAt = new Date(Date.now() - 5_000).toISOString();
    vi.mocked(getState).mockImplementation((key) => {
      if (key === OIDC_ACCESS_TOKEN_STATE_KEY) {
        return "wfat-expired";
      }
      if (key === OIDC_ACCESS_TOKEN_EXPIRES_AT_STATE_KEY) {
        return expiredAt;
      }
      return "";
    });
    vi.mocked(resolveCiOidcAccessToken).mockResolvedValueOnce({
      accessToken: "wfat-fresh-post",
      expiresAt: new Date(Date.now() + 45 * 60_000).toISOString(),
    });

    const resolver = createActionApiTokenResolver({
      allowSavedState: true,
      persistState: false,
      env: GITHUB_OIDC_ENV,
      logger,
    });

    await expect(resolver.getApiToken()).resolves.toBe("wfat-fresh-post");
    expect(resolveCiOidcAccessToken).toHaveBeenCalledTimes(1);
    expect(setSecret).toHaveBeenCalledWith("wfat-fresh-post");
  });

  it("does not attempt to refresh a single-use METICULOUS_OIDC_TOKEN while still valid", async () => {
    vi.mocked(hasGitHubActionsOidcEnv).mockReturnValue(false);
    vi.mocked(resolveCiOidcAccessToken).mockResolvedValueOnce({
      accessToken: "wfat-single-use",
      expiresAt: new Date(Date.now() + 45 * 60_000).toISOString(),
    });

    const resolver = createActionApiTokenResolver({
      env: { METICULOUS_OIDC_TOKEN: "single-use-jwt" },
      logger,
    });

    expect(await resolver.getApiToken()).toBe("wfat-single-use");

    vi.advanceTimersByTime(35 * 60_000);

    // Still 10 minutes left; must NOT re-submit the single-use JWT even with a 15-min upload threshold.
    expect(
      await resolver.getApiToken({
        minRemainingValidityMs: UPLOAD_MIN_REMAINING_VALIDITY_MS,
      })
    ).toBe("wfat-single-use");
    expect(resolveCiOidcAccessToken).toHaveBeenCalledTimes(1);
  });

  it("deduplicates concurrent OIDC exchanges", async () => {
    let resolveExchange!: (value: {
      accessToken: string;
      expiresAt: string;
    }) => void;
    vi.mocked(resolveCiOidcAccessToken).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveExchange = resolve;
        })
    );

    const resolver = createActionApiTokenResolver({
      env: GITHUB_OIDC_ENV,
      logger,
    });

    const p1 = resolver.getApiToken();
    const p2 = resolver.getApiToken();

    resolveExchange({
      accessToken: "wfat-concurrent",
      expiresAt: new Date(Date.now() + 45 * 60_000).toISOString(),
    });

    await expect(Promise.all([p1, p2])).resolves.toEqual([
      "wfat-concurrent",
      "wfat-concurrent",
    ]);
    expect(resolveCiOidcAccessToken).toHaveBeenCalledTimes(1);
  });

  it("throws an actionable error when neither api-token nor OIDC env is present", async () => {
    vi.mocked(hasCiOidcEnv).mockReturnValue(false);
    vi.mocked(hasGitHubActionsOidcEnv).mockReturnValue(false);

    const resolver = createActionApiTokenResolver({
      env: {},
      logger,
    });

    await expect(resolver.getApiToken()).rejects.toThrow(
      /permissions: id-token: write/
    );
    expect(resolveCiOidcAccessToken).not.toHaveBeenCalled();
  });
});
