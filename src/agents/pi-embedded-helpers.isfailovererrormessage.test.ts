import { describe, expect, it } from "vitest";
import { isFailoverErrorMessage } from "./pi-embedded-helpers.js";

describe("isFailoverErrorMessage", () => {
  it("matches auth/rate/billing/timeout", () => {
    const samples = [
      "invalid api key",
      "429 rate limit exceeded",
      "Your credit balance is too low",
      "Insufficient balance",
      "insufficient_balance",
      "out of credits",
      "request timed out",
      "invalid request format",
    ];
    for (const sample of samples) {
      expect(isFailoverErrorMessage(sample)).toBe(true);
    }
  });

  it("does not match normal messages", () => {
    expect(isFailoverErrorMessage("Hello, how are you?")).toBe(false);
    expect(isFailoverErrorMessage("")).toBe(false);
    expect(isFailoverErrorMessage("The task is complete")).toBe(false);
  });
});
