import { afterEach, describe, expect, it, vi } from "vitest";
import { dataReadFailure } from "./api";
import { LiveDataConfigurationError } from "./live-data-error";

describe("live data error responses", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports missing live configuration as unavailable", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = dataReadFailure(
      new LiveDataConfigurationError("SUPABASE_SECRET_KEY is not configured"),
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "Live data is not configured yet",
      code: "LIVE_DATA_UNAVAILABLE",
    });
  });

  it("reports an upstream read failure as an API error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = dataReadFailure(new Error("database timeout"));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: "Live data request failed",
      code: "LIVE_DATA_REQUEST_FAILED",
    });
  });
});
