import { beforeEach, describe, expect, it, vi } from "vitest";

const analytics = vi.hoisted(() => ({
  captureProductEventOnce: vi.fn(),
  stableRouteName: vi.fn((pathname: string) => pathname),
}));

vi.mock("@/lib/analytics", () => analytics);

import { productDataFetcher } from "./useTrendData";

describe("product data event classification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("window", { location: { pathname: "/trending" } });
  });

  it("returns a healthy response without emitting an error event", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      Response.json({ trends: [], mode: "live" }, { status: 200 }),
    ));

    await expect(productDataFetcher("/api/trends?limit=200")).resolves.toEqual({
      trends: [],
      mode: "live",
    });
    expect(analytics.captureProductEventOnce).not.toHaveBeenCalled();
  });

  it("does not treat an error-shaped body on HTTP 200 as unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      Response.json({ code: "LIVE_DATA_UNAVAILABLE", warning: "stale proxy body" }, { status: 200 }),
    ));

    await expect(productDataFetcher("/api/signals?limit=100")).resolves.toMatchObject({
      code: "LIVE_DATA_UNAVAILABLE",
    });
    expect(analytics.captureProductEventOnce).not.toHaveBeenCalled();
  });

  it("emits unavailable only for an explicit fail-closed response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      Response.json(
        { error: "Live data is not configured yet", code: "LIVE_DATA_UNAVAILABLE" },
        { status: 503 },
      ),
    ));

    await expect(productDataFetcher("/api/countries")).rejects.toThrow(
      "Live data is not configured yet",
    );
    expect(analytics.captureProductEventOnce).toHaveBeenCalledWith(
      "live_data_unavailable:/api/countries",
      "live_data_unavailable",
      { endpoint: "/api/countries", route: "/trending", status_code: 503 },
    );
  });

  it("emits an HTTP API error for an upstream read failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      Response.json(
        { error: "Live data request failed", code: "LIVE_DATA_REQUEST_FAILED" },
        { status: 502 },
      ),
    ));

    await expect(productDataFetcher("/api/trends/example")).rejects.toThrow(
      "Live data request failed",
    );
    expect(analytics.captureProductEventOnce).toHaveBeenCalledWith(
      "api_error:http:/api/trends/[slug]:502",
      "api_error",
      { endpoint: "/api/trends/[slug]", failure_type: "http", status_code: 502 },
    );
  });

  it("emits an HTTP API error for other non-success responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      Response.json({ error: "Trend not found" }, { status: 404 }),
    ));

    await expect(productDataFetcher("/api/trends/missing")).rejects.toThrow(
      "Trend not found",
    );
    expect(analytics.captureProductEventOnce).toHaveBeenCalledWith(
      "api_error:http:/api/trends/[slug]:404",
      "api_error",
      { endpoint: "/api/trends/[slug]", failure_type: "http", status_code: 404 },
    );
  });

  it("emits an invalid-response API error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response("not json", { status: 200 }),
    ));

    await expect(productDataFetcher("/api/signals?limit=8")).rejects.toThrow(
      "Live data returned an invalid response",
    );
    expect(analytics.captureProductEventOnce).toHaveBeenCalledWith(
      "api_error:invalid:/api/signals",
      "api_error",
      { endpoint: "/api/signals", failure_type: "invalid_response", status_code: 200 },
    );
  });

  it("emits a network API error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));

    await expect(productDataFetcher("/api/trends/example/messages")).rejects.toThrow(
      "Live data request failed",
    );
    expect(analytics.captureProductEventOnce).toHaveBeenCalledWith(
      "api_error:network:/api/trends/[slug]/messages",
      "api_error",
      { endpoint: "/api/trends/[slug]/messages", failure_type: "network", status_code: 0 },
    );
  });
});
