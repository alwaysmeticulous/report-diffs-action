import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setMeticulousClientUserAgentSuffix } from "../user-agent";

const ENV_VAR = "METICULOUS_CLIENT_USER_AGENT_SUFFIX";

const restore = (key: string, value: string | undefined): void => {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
};

describe("setMeticulousClientUserAgentSuffix", () => {
  let originalRef: string | undefined;
  let originalSuffix: string | undefined;

  beforeEach(() => {
    originalRef = process.env["GITHUB_ACTION_REF"];
    originalSuffix = process.env[ENV_VAR];
    delete process.env["GITHUB_ACTION_REF"];
    delete process.env[ENV_VAR];
  });

  afterEach(() => {
    restore("GITHUB_ACTION_REF", originalRef);
    restore(ENV_VAR, originalSuffix);
  });

  it("includes the sub-action and the pinned ref", () => {
    process.env["GITHUB_ACTION_REF"] = "v1";
    setMeticulousClientUserAgentSuffix("cloud-compute");
    expect(process.env[ENV_VAR]).toBe("report-diffs-action/cloud-compute@v1");
  });

  it("uses the root action name when no sub-action is given", () => {
    process.env["GITHUB_ACTION_REF"] = "abc123";
    setMeticulousClientUserAgentSuffix();
    expect(process.env[ENV_VAR]).toBe("report-diffs-action@abc123");
  });

  it("omits the ref when GITHUB_ACTION_REF is not set", () => {
    setMeticulousClientUserAgentSuffix("upload-assets");
    expect(process.env[ENV_VAR]).toBe("report-diffs-action/upload-assets");
  });

  it("strips characters that would be invalid in a header value", () => {
    process.env["GITHUB_ACTION_REF"] = "v1\r\n evil";
    setMeticulousClientUserAgentSuffix("cloud-compute");
    expect(process.env[ENV_VAR]).toBe("report-diffs-action/cloud-compute@v1evil");
  });
});
