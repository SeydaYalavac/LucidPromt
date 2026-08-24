export const AI_REFERRER_HOSTS = [
  "chatgpt.com",
  "chat.openai.com",
  "claude.ai",
  "perplexity.ai",
  "gemini.google.com",
  "copilot.microsoft.com",
] as const;

export const DIRECTORY_REFERRER_HOSTS = [
  "sitelike.org",
  "versily.com",
  "tools.launchllama.co",
  "trylaunch.ai",
] as const;

const FIRST_REFERRER_UTM_SOURCES = {
  "chatgpt.com": "ai_assistant",
  "sitelike.org": "directory_or_review_site",
  "versily.com": "directory_or_review_site",
  "tools.launchllama.co": "directory_or_review_site",
  "trylaunch.ai": "directory_or_review_site",
} as const;

export const SIGNUP_SOURCE_OPTIONS = [
  { value: "search_engine", label: "Search engine" },
  { value: "ai_assistant", label: "AI assistant" },
  { value: "friend_or_colleague", label: "Friend or colleague" },
  { value: "social_media", label: "Social media" },
  { value: "directory_or_review_site", label: "Directory or review site" },
  { value: "other", label: "Other" },
] as const;

export type SignupSource = (typeof SIGNUP_SOURCE_OPTIONS)[number]["value"];
export type ReferrerChannel = "ai_assistant" | "directory_or_review_site";

export type SignupSourceEventProperties = {
  source: SignupSource;
  referrer_channel?: ReferrerChannel;
  first_referrer_channel?: ReferrerChannel;
  $set_once: {
    acquisition_source: SignupSource;
    first_referrer_channel?: ReferrerChannel;
  };
};

export function randomizeAiOption(
  randomValue = Math.random(),
): Array<(typeof SIGNUP_SOURCE_OPTIONS)[number]> {
  const aiOption = SIGNUP_SOURCE_OPTIONS.find(({ value }) => value === "ai_assistant");
  const otherOptions = SIGNUP_SOURCE_OPTIONS.filter(({ value }) => value !== "ai_assistant");

  if (!aiOption) return [...SIGNUP_SOURCE_OPTIONS];

  const safeRandomValue = Number.isFinite(randomValue)
    ? Math.min(Math.max(randomValue, 0), 0.9999999999999999)
    : 0;
  const insertionIndex = Math.floor(safeRandomValue * (otherOptions.length + 1));
  const options = [...otherOptions];
  options.splice(insertionIndex, 0, aiOption);
  return options;
}

function normalizeHostname(hostname: string) {
  return hostname.toLowerCase().replace(/^www\./, "");
}

export function isReferrerChannel(value: unknown): value is ReferrerChannel {
  return value === "ai_assistant" || value === "directory_or_review_site";
}

export function preserveFirstReferrerChannel(
  storedChannel: unknown,
  detectedChannel: ReferrerChannel | undefined,
): ReferrerChannel | undefined {
  return isReferrerChannel(storedChannel) ? storedChannel : detectedChannel;
}

export function buildFirstReferrerEventProperties(
  channel: ReferrerChannel | undefined,
): { first_referrer_channel?: ReferrerChannel } {
  return channel ? { first_referrer_channel: channel } : {};
}

export function deriveFirstReferrerChannel(
  referrerUrl: string,
  currentUrl: string,
): ReferrerChannel | undefined {
  try {
    const utmSource = new URL(currentUrl).searchParams.get("utm_source")?.toLowerCase();
    if (utmSource && Object.hasOwn(FIRST_REFERRER_UTM_SOURCES, utmSource)) {
      return FIRST_REFERRER_UTM_SOURCES[
        utmSource as keyof typeof FIRST_REFERRER_UTM_SOURCES
      ];
    }
  } catch {
    // Ignore malformed or unavailable page URLs.
  }

  try {
    const referrerHost = normalizeHostname(new URL(referrerUrl).hostname);
    if ((AI_REFERRER_HOSTS as readonly string[]).includes(referrerHost)) {
      return "ai_assistant";
    }
    if ((DIRECTORY_REFERRER_HOSTS as readonly string[]).includes(referrerHost)) {
      return "directory_or_review_site";
    }
  } catch {
    // Empty and malformed referrers are ordinary direct traffic.
  }

  return undefined;
}

export function buildSignupSourceEventProperties(
  source: SignupSource,
  referrerChannel?: ReferrerChannel,
): SignupSourceEventProperties {
  const properties: SignupSourceEventProperties = {
    source,
    $set_once: { acquisition_source: source },
  };

  if (referrerChannel) {
    properties.referrer_channel = referrerChannel;
    properties.first_referrer_channel = referrerChannel;
    properties.$set_once.first_referrer_channel = referrerChannel;
  }

  return properties;
}
