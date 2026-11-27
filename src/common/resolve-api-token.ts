import { getInput, getState, saveState, setSecret } from "@actions/core";
import {
  hasCiOidcEnv,
  hasGitHubActionsOidcEnv,
  resolveCiOidcAccessToken,
} from "@alwaysmeticulous/client";
import log from "loglevel";

export const OIDC_ACCESS_TOKEN_STATE_KEY = "meticulous_oidc_access_token";
export const OIDC_ACCESS_TOKEN_EXPIRES_AT_STATE_KEY =
  "meticulous_oidc_access_token_expires_at";

const DEFAULT_MIN_REMAINING_VALIDITY_MS = 60_000;
/**
 * Minimum remaining token lifetime before starting an asset or container upload.
 * A base-build wait can consume up to 30 minutes of a 45-minute CI OIDC token,
 * so refreshing ahead of the upload prevents mid-upload expiry.
 */
export const UPLOAD_MIN_REMAINING_VALIDITY_MS = 15 * 60_000;
const FALLBACK_TOKEN_TTL_MS = 30 * 60_000;

export interface ActionAuthInputs {
  apiToken?: string | undefined;
  project?: string | undefined;
  oidcAudience?: string | undefined;
}

export interface CreateActionApiTokenResolverOptions extends ActionAuthInputs {
  /**
   * Read an OIDC token saved by the main step via `@actions/core` `saveState`.
   * Enable in `post` steps to reuse the main step's token without an extra OIDC round-trip.
   */
  allowSavedState?: boolean | undefined;
  /**
   * Persist exchanged OIDC tokens via `@actions/core` `saveState` so the step's
   * `post` hook can reuse them.
   */
  persistState?: boolean | undefined;
  logger?: log.Logger | undefined;
  env?: NodeJS.ProcessEnv | undefined;
}

export interface ActionApiTokenResolver {
  getApiToken: (options?: {
    minRemainingValidityMs?: number;
  }) => Promise<string>;
}

interface CachedToken {
  accessToken: string;
  expiresAtMs: number;
  refreshable: boolean;
}

export const getActionAuthInputs = (): ActionAuthInputs => {
  const apiToken =
    getInput("api-token", { required: false }).trim() || undefined;
  const project = getInput("project", { required: false }).trim() || undefined;
  const oidcAudience =
    getInput("oidc-audience", { required: false }).trim() || undefined;

  return {
    ...(apiToken ? { apiToken } : {}),
    ...(project ? { project } : {}),
    ...(oidcAudience ? { oidcAudience } : {}),
  };
};

export const createActionApiTokenResolver = ({
  apiToken,
  project,
  oidcAudience,
  allowSavedState = false,
  persistState = true,
  logger,
  env = process.env,
}: CreateActionApiTokenResolverOptions): ActionApiTokenResolver => {
  const explicitToken =
    apiToken?.trim() || env["METICULOUS_API_TOKEN"]?.trim() || undefined;

  let cachedToken: CachedToken | null = null;
  let inFlightExchange: Promise<CachedToken> | null = null;
  let checkedSavedState = false;

  const isRefreshable = () =>
    !env["METICULOUS_OIDC_TOKEN"]?.trim() && hasGitHubActionsOidcEnv(env);

  const readSavedStateOnce = (): CachedToken | null => {
    if (!allowSavedState || checkedSavedState) {
      return null;
    }
    checkedSavedState = true;

    const savedToken = getState(OIDC_ACCESS_TOKEN_STATE_KEY).trim();
    const savedExpiresAt = getState(
      OIDC_ACCESS_TOKEN_EXPIRES_AT_STATE_KEY
    ).trim();
    if (!savedToken || !savedExpiresAt) {
      return null;
    }

    const parsedExpiry = Date.parse(savedExpiresAt);
    if (!Number.isFinite(parsedExpiry)) {
      return null;
    }

    setSecret(savedToken);
    return {
      accessToken: savedToken,
      expiresAtMs: parsedExpiry,
      refreshable: isRefreshable(),
    };
  };

  const getApiToken = async (
    options: { minRemainingValidityMs?: number } = {}
  ): Promise<string> => {
    if (explicitToken) {
      return explicitToken;
    }

    const minRemainingValidityMs =
      options.minRemainingValidityMs ?? DEFAULT_MIN_REMAINING_VALIDITY_MS;

    if (cachedToken == null) {
      cachedToken = readSavedStateOnce();
    }

    const now = Date.now();
    const stillValidCached =
      cachedToken != null && cachedToken.expiresAtMs > now ? cachedToken : null;

    if (
      stillValidCached != null &&
      stillValidCached.expiresAtMs - now >
        (stillValidCached.refreshable ? minRemainingValidityMs : 0)
    ) {
      return stillValidCached.accessToken;
    }

    if (!hasCiOidcEnv(env)) {
      if (stillValidCached != null) {
        return stillValidCached.accessToken;
      }
      throw new Error(
        "No Meticulous API token found. Either pass the 'api-token' input " +
          "(or set METICULOUS_API_TOKEN), or authenticate with GitHub Actions OIDC " +
          "by granting 'permissions: id-token: write' and adding a CI trust policy " +
          "in your Meticulous project settings."
      );
    }

    let pending = inFlightExchange;
    if (pending == null) {
      const refreshable = isRefreshable();
      const exchangePromise = resolveCiOidcAccessToken({
        project,
        audience: oidcAudience,
        env,
      }).then((result) => {
        setSecret(result.accessToken);

        const parsedExpiry = Date.parse(result.expiresAt);
        const expiresAtMs = Number.isFinite(parsedExpiry)
          ? parsedExpiry
          : Date.now() + FALLBACK_TOKEN_TTL_MS;

        if (persistState) {
          saveState(OIDC_ACCESS_TOKEN_STATE_KEY, result.accessToken);
          saveState(
            OIDC_ACCESS_TOKEN_EXPIRES_AT_STATE_KEY,
            new Date(expiresAtMs).toISOString()
          );
        }

        const entry: CachedToken = {
          accessToken: result.accessToken,
          expiresAtMs,
          refreshable,
        };
        cachedToken = entry;
        logger?.info("Authenticated with Meticulous via CI OIDC.");
        return entry;
      });

      inFlightExchange = exchangePromise;
      pending = exchangePromise;
    }

    try {
      const resolved = await pending;
      return resolved.accessToken;
    } catch (error) {
      if (
        stillValidCached != null &&
        stillValidCached.expiresAtMs > Date.now()
      ) {
        logger?.warn(
          `CI OIDC token refresh failed (${
            error instanceof Error ? error.message : String(error)
          }); continuing with cached token until expiry.`
        );
        return stillValidCached.accessToken;
      }
      throw error;
    } finally {
      if (inFlightExchange === pending) {
        inFlightExchange = null;
      }
    }
  };

  return { getApiToken };
};
