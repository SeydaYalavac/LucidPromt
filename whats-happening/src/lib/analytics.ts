import posthog from "posthog-js";

const MANAGED_POSTHOG_KEY =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ||
  "phc_Bdp4jGhnxUi3EiJUiWDT3WTYwYmBRDfR8u2wKpkBN2id";
const MANAGED_POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

type ProductEventProperties = {
  "$pageview": { route: string; $current_url: string };
  signup_cta_clicked: { source: "auth_panel" | "global_nav" | "mobile_nav" };
  auth_attempted: { mode: string; provider: string };
  auth_completed: {
    mode: string;
    provider: string;
    success: boolean;
    failure_type?: string;
    requires_email_verification?: boolean;
  };
  user_authenticated: { provider: string };
  developer_chat_message_sent: { trend_slug: string };
  developer_chat_message_failed: { trend_slug: string; status_code: number };
};

let initialized = false;

function withoutQueryOrHash(value: unknown) {
  if (typeof value !== "string") return value;
  if (value.startsWith("$")) return value;
  try {
    const url = new URL(value, window.location.origin);
    return `${url.origin}${url.pathname}`;
  } catch {
    return value.split(/[?#]/, 1)[0];
  }
}

function scrubAutomaticUrlProperties(properties: Record<string, unknown>) {
  for (const key of [
    "$current_url",
    "$initial_current_url",
    "$referrer",
    "$initial_referrer",
    "$session_entry_url",
    "$session_entry_referrer",
  ]) {
    properties[key] = withoutQueryOrHash(properties[key]);
  }

  const initialPersonInfo = properties.$initial_person_info;
  if (initialPersonInfo && typeof initialPersonInfo === "object") {
    const values = initialPersonInfo as Record<string, unknown>;
    values.r = withoutQueryOrHash(values.r);
    values.u = withoutQueryOrHash(values.u);
  }

  const clientSessionProps = properties.$client_session_props;
  if (clientSessionProps && typeof clientSessionProps === "object") {
    const values = clientSessionProps as { props?: Record<string, unknown> };
    if (values.props) {
      values.props.r = withoutQueryOrHash(values.props.r);
      values.props.u = withoutQueryOrHash(values.props.u);
    }
  }
}

export function initProductAnalytics() {
  if (initialized || typeof window === "undefined") return;

  posthog.init(MANAGED_POSTHOG_KEY, {
    api_host: MANAGED_POSTHOG_HOST,
    autocapture: false,
    capture_exceptions: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    person_profiles: "identified_only",
    before_send: (event) => {
      if (!event?.properties) return event;
      scrubAutomaticUrlProperties(event.properties);
      return event;
    },
  });
  initialized = true;
}

export function captureProductEvent<EventName extends keyof ProductEventProperties>(
  event: EventName,
  properties: ProductEventProperties[EventName],
) {
  initProductAnalytics();
  posthog.capture(event, properties);
}

export function identifyProductUser(userId: string) {
  initProductAnalytics();
  posthog.identify(userId);
}

export function resetProductUser() {
  initProductAnalytics();
  posthog.reset();
}

export function stableRouteName(pathname: string) {
  if (/^\/trend\/[^/]+$/.test(pathname)) return "/trend/[slug]";
  if (/^\/category\/[^/]+$/.test(pathname)) return "/category/[category]";
  if (/^\/country\/[^/]+$/.test(pathname)) return "/country/[country]";
  return pathname;
}
