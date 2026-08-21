import type { ChatMessage, Country, Signal, Trend } from "@/types/trends";

const now = new Date();
const minutesAgo = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();

export const demoTrends: Trend[] = [
  {
    id: "demo-1",
    slug: "local-first-ai-agents",
    title: "Local-first AI agents move into production",
    category: "Artificial Intelligence",
    summary: "Developer communities are converging on smaller, local agents with auditable tool use.",
    country_id: null,
    country: null,
    velocity_score: 94,
    reach_score: 87,
    novelty_score: 91,
    score: 91,
    is_global_pulse: true,
    source_count: 4,
    signal_count: 126,
    growth_percent: 218,
    first_seen_at: minutesAgo(180),
    last_seen_at: minutesAgo(2),
    why_status: "complete",
    what_happened: "Several open-source agent runtimes shipped reliable local execution and auditable tool traces within the same release window.",
    why_now: "Privacy pressure and falling inference costs made local deployment practical just as teams began demanding clearer control over autonomous software.",
    where_started: "The first concentrated signals appeared in GitHub repositories and Hacker News discussions before spreading to search interest.",
  },
  {
    id: "demo-2",
    slug: "solid-state-battery-pilots",
    title: "Solid-state battery pilots clear a manufacturing hurdle",
    category: "Climate & Energy",
    summary: "New pilot-line results are accelerating discussion across engineering and transport communities.",
    country_id: null,
    country: null,
    velocity_score: 86,
    reach_score: 80,
    novelty_score: 84,
    score: 83,
    is_global_pulse: true,
    source_count: 3,
    signal_count: 74,
    growth_percent: 174,
    first_seen_at: minutesAgo(260),
    last_seen_at: minutesAgo(8),
    why_status: "complete",
    what_happened: "Two pilot manufacturers reported improved yields for solid-state cells.",
    why_now: "The reports arrived as automakers reassessed battery roadmaps for the next vehicle cycle.",
    where_started: "The conversation began in engineering news and search data in Japan and Germany.",
  },
  {
    id: "demo-3",
    slug: "post-quantum-tooling",
    title: "Post-quantum tooling leaves the lab",
    category: "Developer Tools",
    summary: "Implementation guides and migration tools are attracting unusual cross-platform attention.",
    country_id: null,
    country: null,
    velocity_score: 76,
    reach_score: 70,
    novelty_score: 89,
    score: 77,
    is_global_pulse: false,
    source_count: 3,
    signal_count: 41,
    growth_percent: 142,
    first_seen_at: minutesAgo(390),
    last_seen_at: minutesAgo(17),
    why_status: "pending",
    what_happened: null,
    why_now: null,
    where_started: null,
  },
];

export const demoSignals: Signal[] = [
  {
    id: "demo-signal-1",
    trend_id: "demo-1",
    source: "github",
    external_id: "demo-gh-1",
    title: "A local agent runtime crosses 10k stars",
    excerpt: "Repository activity and contributor growth accelerated over the last day.",
    source_url: "https://github.com/trending",
    author_label: "GitHub",
    engagement_count: 10240,
    audience_count: null,
    published_at: minutesAgo(12),
    observed_at: minutesAgo(2),
  },
  {
    id: "demo-signal-2",
    trend_id: "demo-1",
    source: "hacker_news",
    external_id: "demo-hn-1",
    title: "Developers debate auditable local agents",
    excerpt: "The technical thread is growing faster than the normal front-page baseline.",
    source_url: "https://news.ycombinator.com/",
    author_label: "Hacker News",
    engagement_count: 847,
    audience_count: null,
    published_at: minutesAgo(28),
    observed_at: minutesAgo(2),
  },
];

export const demoMapCountries: Country[] = [
  { id: "demo-country-us", code: "US", slug: "united-states", name: "United States", latitude: 37.09, longitude: -95.71 },
  { id: "demo-country-gb", code: "GB", slug: "united-kingdom", name: "United Kingdom", latitude: 55.37, longitude: -3.43 },
];

const attributedDemoMapSignals: Signal[] = demoSignals.map((signal, index) => ({
  ...signal,
  id: `${signal.id}-map`,
  external_id: `interaction-preview-${index + 1}`,
  title: index === 0 ? "Local-first AI agent runtime reaches a contributor milestone" : "Developers debate auditable AI agents",
  country_id: demoMapCountries[index].id,
  country: demoMapCountries[index],
}));

export const demoMapSignals: Signal[] = [
  ...attributedDemoMapSignals,
  {
    ...demoSignals[1],
    id: "demo-signal-3-map",
    external_id: "interaction-preview-3",
    title: "AI agent auditability discussion gains a second market signal",
    country_id: demoMapCountries[0].id,
    country: demoMapCountries[0],
  },
];

export const demoMessages: ChatMessage[] = [];
