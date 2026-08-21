export type SourceName =
  | "hacker_news"
  | "github"
  | "google_trends"
  | "reddit"
  | "x"
  | "tavily"
  | "exa";

export interface Country {
  id: string;
  code: string;
  slug: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

export interface Trend {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string | null;
  country_id: string | null;
  country?: Country | null;
  velocity_score: number;
  reach_score: number;
  novelty_score: number;
  score: number;
  is_global_pulse: boolean;
  source_count: number;
  signal_count: number;
  growth_percent: number | null;
  first_seen_at: string;
  last_seen_at: string;
  why_status: "pending" | "processing" | "complete" | "failed" | "skipped";
  what_happened: string | null;
  why_now: string | null;
  where_started: string | null;
  updated_at?: string;
  summary_source?: TrendSummarySource | null;
  brief?: TrendBrief | null;
}

export interface TrendSummarySource {
  source: SourceName;
  source_url: string;
  source_title: string;
  published_at: string;
  observed_at: string;
}

export interface TrendBriefEvidence {
  provider: SourceName;
  kind: "signal" | "linked_report";
  label: string;
  source_url: string;
  source_title: string;
  published_at: string;
  observed_at: string;
  signal_summary: string;
}

export interface TrendBrief {
  what_it_is: string;
  why_trending: string;
  useful_for: string;
  next_step: string;
  evidence: TrendBriefEvidence[];
  freshest_observed_at: string;
  evidence_source_count: number;
  linked_site_count: number;
  corroboration: "multi_source" | "single_source";
  caution: string;
}

export interface Signal {
  id: string;
  trend_id: string;
  source: SourceName;
  external_id: string;
  title: string;
  excerpt: string | null;
  source_url: string;
  author_label: string | null;
  engagement_count: number;
  audience_count: number | null;
  published_at: string;
  observed_at: string;
  metadata?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  trend_id: string;
  author_id: string;
  author_display_name: string;
  body: string;
  moderation_provider: "openai" | "local";
  moderation_labels: string[];
  status: "visible" | "removed";
  created_at: string;
}

export interface TrendDetailPayload {
  trend: Trend;
  signals: Signal[];
  mode: "live" | "demo";
}

export interface TrendListPayload {
  trends: Trend[];
  mode: "live" | "demo";
}

export interface SourceSignal {
  source: SourceName;
  externalId: string;
  title: string;
  excerpt?: string;
  sourceUrl: string;
  authorLabel?: string;
  engagementCount: number;
  audienceCount?: number;
  publishedAt: string;
  countryCode?: string;
  metadata?: Record<string, unknown>;
}
