const DEFAULT_REDIRECT = "/";

export function getSafeRedirect(value: string | null | undefined, fallback = DEFAULT_REDIRECT) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }

  try {
    const parsed = new URL(value, "https://whatshappeninginai.com");
    if (parsed.origin !== "https://whatshappeninginai.com") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

