import { beforeEach, describe, expect, it, vi } from "vitest";

const posthog = vi.hoisted(() => ({
  capture: vi.fn(),
  get_property: vi.fn(),
  identify: vi.fn(),
  init: vi.fn(),
  register_once: vi.fn(),
  reset: vi.fn(),
  startSessionRecording: vi.fn(),
  stopSessionRecording: vi.fn(),
}));

vi.mock("posthog-js", () => ({ default: posthog }));

class MemorySessionStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

function installBrowser(href: string, sessionStorage = new MemorySessionStorage()) {
  vi.stubGlobal("window", { location: { href }, sessionStorage });
  vi.stubGlobal("document", { referrer: "" });
  return sessionStorage;
}

describe("analytics runtime test exclusion", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("does not initialize, capture, identify, or reset PostHog for a marked session", async () => {
    installBrowser("https://www.whatshappeninginai.com/?tin_test=1");
    const analytics = await import("./analytics");

    expect(analytics.initProductAnalytics()).toBe(false);
    analytics.captureProductEvent("$pageview", {
      route: "/",
      $current_url: "https://www.whatshappeninginai.com/",
    });
    analytics.captureProductEventOnce("signup", "signup_cta_clicked", {
      source: "global_nav",
    });
    analytics.identifyProductUser("test-user");
    analytics.captureSignupSource("ai_assistant");
    analytics.resetProductUser();

    expect(posthog.init).not.toHaveBeenCalled();
    expect(posthog.capture).not.toHaveBeenCalled();
    expect(posthog.identify).not.toHaveBeenCalled();
    expect(posthog.reset).not.toHaveBeenCalled();
    expect(posthog.startSessionRecording).not.toHaveBeenCalled();
  });

  it("preserves privacy-bounded analytics for an unmarked session", async () => {
    installBrowser("https://www.whatshappeninginai.com/");
    const analytics = await import("./analytics");

    expect(analytics.initProductAnalytics()).toBe(true);
    analytics.captureProductEvent("$pageview", {
      route: "/",
      $current_url: "https://www.whatshappeninginai.com/",
    });

    expect(posthog.init).toHaveBeenCalledOnce();
    expect(posthog.init.mock.calls[0][1]).toMatchObject({
      capture_exceptions: false,
      capture_pageleave: false,
      capture_pageview: false,
      mask_all_element_attributes: true,
      mask_all_text: true,
    });
    expect(posthog.startSessionRecording).toHaveBeenCalledWith(true);
    expect(posthog.capture).toHaveBeenCalledWith("$pageview", {
      route: "/",
      $current_url: "https://www.whatshappeninginai.com/",
    });
  });

  it("drops later SDK sends and stops recording if the session becomes marked", async () => {
    const sessionStorage = installBrowser("https://www.whatshappeninginai.com/");
    const analytics = await import("./analytics");
    expect(analytics.initProductAnalytics()).toBe(true);

    window.location.href = "https://www.whatshappeninginai.com/trending?tin_test=1";
    analytics.captureProductEvent("$pageview", {
      route: "/trending",
      $current_url: "https://www.whatshappeninginai.com/trending",
    });

    expect(posthog.capture).not.toHaveBeenCalled();
    expect(posthog.stopSessionRecording).toHaveBeenCalledOnce();
    expect(sessionStorage.getItem("tin_test_session")).toBe("1");

    const config = posthog.init.mock.calls[0][1];
    expect(config.before_send({ event: "$rageclick", properties: {} })).toBeNull();
  });
});
