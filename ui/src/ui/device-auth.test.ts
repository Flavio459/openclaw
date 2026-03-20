import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadDeviceAuthToken, storeDeviceAuthToken } from "./device-auth.ts";

const STORAGE_KEY = "openclaw.device.auth.v1";

describe("device auth storage hardening", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("stores device auth tokens in sessionStorage instead of localStorage", () => {
    storeDeviceAuthToken({
      deviceId: "device-1",
      role: "operator",
      token: "secret-token",
      scopes: ["operator.admin"],
    });

    expect(sessionStorage.getItem(STORAGE_KEY)).toContain("secret-token");
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("migrates legacy localStorage tokens into sessionStorage on read", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        deviceId: "device-1",
        tokens: {
          operator: {
            token: "legacy-token",
            role: "operator",
            scopes: ["operator.admin"],
            updatedAtMs: 123,
          },
        },
      }),
    );

    const loaded = loadDeviceAuthToken({ deviceId: "device-1", role: "operator" });

    expect(loaded?.token).toBe("legacy-token");
    expect(sessionStorage.getItem(STORAGE_KEY)).toContain("legacy-token");
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
