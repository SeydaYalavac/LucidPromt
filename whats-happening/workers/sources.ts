import { XMLParser } from "fast-xml-parser";
import { sanitizeExcerpt } from "../src/lib/trend-content";
import { explicitSourceLocationAttribution, googleTrendsMarketAttribution } from "../src/lib/country-attribution";
import type { SourceName, SourceSignal } from "../src/types/trends";

export interface SourceAdapter {
  name: SourceName;
  fetchSignals(): Promise<SourceSignal[]>;
}

export const SOURCE_INTAKE_LIMITS = {
  hackerNews: 200,
  github: 100,
} as const;

export const GITHUB_SEARCH_SLICES = [
  { query: "created:>{since}", limit: 70 },
  { query: "AI sports created:>{since}", limit: 15 },
  { query: "machine-learning athlete created:>{since}", limit: 15 },
] as const;

export const DEFAULT_DISCOVERY_QUERY = "latest artificial intelligence developments including sports performance analytics injury prevention officiating broadcasting accessibility and sports science";

export const DEFAULT_GOOGLE_TRENDS_MARKETS = [
  "US", "GB", "CA", "AU", "IN", "SG", "JP", "KR", "DE", "FR", "TR", "BR",
  "MX", "AR", "ZA", "NG", "AE", "SA", "ID", "PH", "TH", "VN", "NZ", "IT",
  "ES", "NL", "PL", "SE",
] as const;

const iso = (value: string | number | undefined) => {
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};
const text = (value: unknown, max = 500) => String(value || "").replace(/\s+/g, " ").trim().slice(0, max);

type GoogleNewsItem = {
  title: string;
  snippet: string | null;
  url: string;
  source: string | null;
};

export function extractGoogleNewsItems(value: unknown): GoogleNewsItem[] {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values.flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object") return [];
    const item = candidate as Record<string, unknown>;
    const title = text(item["ht:news_item_title"] || item.title, 240);
    const url = text(item["ht:news_item_url"] || item.url, 500);
    if (!title || !/^https?:\/\//i.test(url)) return [];
    return [{
      title,
      snippet: sanitizeExcerpt(item["ht:news_item_snippet"] || item.snippet),
      url,
      source: text(item["ht:news_item_source"] || item.source, 120) || null,
    }];
  }).slice(0, 3);
}

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json() as Promise<T>;
}

export const hackerNews: SourceAdapter = {
  name: "hacker_news",
  async fetchSignals() {
    const ids = await json<number[]>("https://hacker-news.firebaseio.com/v0/newstories.json");
    const items = await Promise.all(
      ids.slice(0, SOURCE_INTAKE_LIMITS.hackerNews).map((id) =>
        json<{ id: number; title?: string; text?: string; url?: string; by?: string; score?: number; descendants?: number; time?: number }>(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
        ),
      ),
    );
    return items
      .filter((item) => item.title)
      .map((item) => ({
        source: "hacker_news" as const,
        externalId: String(item.id),
        title: text(item.title, 220),
        excerpt: sanitizeExcerpt(item.text) || undefined,
        sourceUrl: `https://news.ycombinator.com/item?id=${item.id}`,
        authorLabel: text(item.by, 60),
        engagementCount: (item.score || 0) + (item.descendants || 0),
        publishedAt: new Date((item.time || Date.now() / 1000) * 1000).toISOString(),
        metadata: { points: item.score || 0, comments: item.descendants || 0, article_url: item.url || null },
      }));
  },
};

export const github: SourceAdapter = {
  name: "github",
  async fetchSignals() {
    const since = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
    const headers: HeadersInit = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    type GitHubSearchResult = {
      items: Array<{
        id: number;
        full_name: string;
        html_url: string;
        description: string | null;
        stargazers_count: number;
        forks_count: number;
        owner: { login: string };
        created_at: string;
        language: string | null;
      }>;
    };
    const results = await Promise.all(GITHUB_SEARCH_SLICES.map(({ query, limit }) =>
      json<GitHubSearchResult>(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(query.replace("{since}", since))}&sort=stars&order=desc&per_page=${limit}`,
        { headers },
      ),
    ));
    return results.flatMap((result) => result.items).map((repo) => ({
      source: "github" as const,
      externalId: String(repo.id),
      title: text(repo.full_name, 220),
      excerpt: text(repo.description, 500),
      sourceUrl: repo.html_url,
      authorLabel: repo.owner.login,
      engagementCount: repo.stargazers_count + repo.forks_count,
      publishedAt: iso(repo.created_at),
      metadata: { language: repo.language, stars: repo.stargazers_count, forks: repo.forks_count },
    }));
  },
};

function stableGoogleTrendId(geo: string, title: string) {
  return `${geo}-${encodeURIComponent(title.toLocaleLowerCase()).slice(0, 360)}`;
}

export function googleTrendMarkets(env = process.env) {
  const configured = env.GOOGLE_TRENDS_GEOS || env.GOOGLE_TRENDS_GEO;
  const markets = configured
    ? configured.split(",").map((value) => value.trim().toUpperCase()).filter(Boolean)
    : [...DEFAULT_GOOGLE_TRENDS_MARKETS];
  const allowed = new Set(DEFAULT_GOOGLE_TRENDS_MARKETS);
  return [...new Set(markets)].filter((market) => allowed.has(market as typeof DEFAULT_GOOGLE_TRENDS_MARKETS[number]));
}

export function parseGoogleTrendsRss(xml: string, geo: string): SourceSignal[] {
  const parsed = new XMLParser({ ignoreAttributes: false }).parse(xml) as {
    rss?: { channel?: { item?: Array<Record<string, unknown>> | Record<string, unknown> } };
  };
  const raw = parsed.rss?.channel?.item;
  const items = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return items.flatMap((item) => {
    const title = text(item.title, 220);
    if (!title) return [];
    const newsItems = extractGoogleNewsItems(item["ht:news_item"]);
    const sourceUrl = `https://trends.google.com/trending?geo=${encodeURIComponent(geo)}`;
    const countryAttribution = googleTrendsMarketAttribution(geo, sourceUrl);
    if (!countryAttribution) return [];
    return [{
      source: "google_trends" as const,
      externalId: stableGoogleTrendId(geo, title),
      title,
      excerpt: newsItems[0]?.snippet || newsItems[0]?.title || undefined,
      sourceUrl,
      authorLabel: "Google Trends",
      engagementCount: Number(String(item["ht:approx_traffic"] || "0").replace(/\D/g, "")) || 0,
      publishedAt: iso(item.pubDate as string),
      countryCode: geo,
      countryAttribution,
      metadata: { approximate_traffic: item["ht:approx_traffic"] || null, news_items: newsItems, market: geo, country_attribution: countryAttribution },
    }];
  });
}

async function fetchGoogleTrendMarket(geo: string) {
  const response = await fetch(`https://trends.google.com/trending/rss?geo=${encodeURIComponent(geo)}`);
  if (!response.ok) throw new Error(`Google Trends RSS (${geo}) returned ${response.status}`);
  return parseGoogleTrendsRss(await response.text(), geo);
}

export const googleTrends: SourceAdapter = {
  name: "google_trends",
  async fetchSignals() {
    const markets = googleTrendMarkets();
    if (!markets.length) throw new Error("GOOGLE_TRENDS_GEOS contains no supported markets");
    const results = await Promise.allSettled(markets.map(fetchGoogleTrendMarket));
    const signals = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
    if (!signals.length) {
      const failures = results.flatMap((result) => result.status === "rejected" ? [String(result.reason)] : []);
      throw new Error(`Google Trends RSS failed for every market: ${failures.slice(0, 3).join("; ")}`);
    }
    return signals;
  },
};

export const reddit: SourceAdapter = {
  name: "reddit",
  async fetchSignals() {
    const clientId = process.env.REDDIT_CLIENT_ID;
    const secret = process.env.REDDIT_CLIENT_SECRET;
    if (!clientId || !secret) throw new Error("Reddit credentials are not configured");
    const tokenResponse = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": process.env.REDDIT_USER_AGENT || "whats-happening-trend-worker/1.0",
      },
      body: "grant_type=client_credentials",
    });
    if (!tokenResponse.ok) throw new Error(`Reddit OAuth returned ${tokenResponse.status}`);
    const { access_token } = (await tokenResponse.json()) as { access_token: string };
    const listing = await json<{ data: { children: Array<{ data: Record<string, unknown> }> } }>(
      "https://oauth.reddit.com/r/all/rising?limit=50&raw_json=1",
      { headers: { Authorization: `Bearer ${access_token}`, "User-Agent": process.env.REDDIT_USER_AGENT || "whats-happening-trend-worker/1.0" } },
    );
    return listing.data.children.map(({ data }) => ({
      source: "reddit" as const,
      externalId: text(data.id, 80),
      title: text(data.title, 220),
      excerpt: text(data.selftext, 500),
      sourceUrl: `https://www.reddit.com${text(data.permalink, 300)}`,
      authorLabel: `r/${text(data.subreddit, 60)}`,
      engagementCount: Number(data.score || 0) + Number(data.num_comments || 0),
      publishedAt: new Date(Number(data.created_utc || Date.now() / 1000) * 1000).toISOString(),
      metadata: { subreddit: data.subreddit, comments: data.num_comments || 0 },
    }));
  },
};

export const xRecent: SourceAdapter = {
  name: "x",
  async fetchSignals() {
    const token = process.env.X_BEARER_TOKEN;
    const queries = process.env.X_WATCH_QUERIES?.split(",").map((item) => item.trim()).filter(Boolean);
    if (!token || !queries?.length) throw new Error("X bearer token or watch queries are not configured");
    const batches = await Promise.all(
      queries.slice(0, 10).map((query) =>
        json<{
          data?: Array<{ id: string; text: string; author_id?: string; created_at?: string; public_metrics?: Record<string, number>; geo?: { place_id?: string } }>;
          includes?: { places?: Array<{ id: string; country_code?: string; full_name?: string; place_type?: string }> };
        }>(
          `https://api.x.com/2/tweets/search/recent?query=${encodeURIComponent(`${query} -is:retweet`)}&max_results=100&tweet.fields=created_at,public_metrics,geo&expansions=geo.place_id&place.fields=country_code,full_name,place_type`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      ),
    );
    return batches.flatMap((batch) =>
      (batch.data || []).map((tweet) => {
        const sourceUrl = `https://x.com/i/web/status/${tweet.id}`;
        const place = batch.includes?.places?.find((candidate) => candidate.id === tweet.geo?.place_id);
        const countryAttribution = place?.country_code && place.full_name
          ? explicitSourceLocationAttribution({
            countryCode: place.country_code,
            source: "x",
            sourceUrl,
            locationLabel: place.full_name,
          })
          : null;
        return {
          source: "x" as const,
          externalId: tweet.id,
          title: text(tweet.text, 220),
          excerpt: text(tweet.text, 280),
          sourceUrl,
          authorLabel: tweet.author_id,
          engagementCount: Object.values(tweet.public_metrics || {}).reduce((sum, value) => sum + value, 0),
          publishedAt: iso(tweet.created_at),
          countryCode: countryAttribution?.country_code,
          countryAttribution: countryAttribution || undefined,
          metadata: { ...(tweet.public_metrics || {}), ...(place ? { source_place: place } : {}), ...(countryAttribution ? { country_attribution: countryAttribution } : {}) },
        };
      }),
    );
  },
};

function searchProvider(name: "tavily" | "exa"): SourceAdapter {
  return {
    name,
    async fetchSignals() {
      const query = process.env.DISCOVERY_QUERY || DEFAULT_DISCOVERY_QUERY;
      if (name === "tavily") {
        if (!process.env.TAVILY_API_KEY) throw new Error("Tavily API key is not configured");
        const result = await json<{ results: Array<{ url: string; title: string; content?: string; score?: number; published_date?: string }> }>(
          "https://api.tavily.com/search",
          { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ api_key: process.env.TAVILY_API_KEY, query, topic: "news", max_results: 20 }) },
        );
        return result.results.map((item) => ({ source: name, externalId: item.url, title: text(item.title, 220), excerpt: text(item.content, 500), sourceUrl: item.url, engagementCount: Math.round((item.score || 0) * 100), publishedAt: iso(item.published_date) }));
      }
      if (!process.env.EXA_API_KEY) throw new Error("Exa API key is not configured");
      const result = await json<{ results: Array<{ id: string; url: string; title: string; publishedDate?: string; text?: string }> }>(
        "https://api.exa.ai/search",
        { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": process.env.EXA_API_KEY }, body: JSON.stringify({ query, type: "auto", category: "news", numResults: 20, contents: { text: { maxCharacters: 500 } } }) },
      );
      return result.results.map((item) => ({ source: name, externalId: item.id, title: text(item.title, 220), excerpt: text(item.text, 500), sourceUrl: item.url, engagementCount: 1, publishedAt: iso(item.publishedDate) }));
    },
  };
}

export const adapters: Record<SourceName, SourceAdapter> = {
  hacker_news: hackerNews,
  github,
  google_trends: googleTrends,
  reddit,
  x: xRecent,
  tavily: searchProvider("tavily"),
  exa: searchProvider("exa"),
};
