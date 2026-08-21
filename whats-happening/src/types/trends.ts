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
  evidence_status?: "single_source" | "multi_source";
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
  country_id?: string | null;
  country?: Country | null;
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
  reply_to_id: string | null;
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
  coverage: {
    target: number;
    qualified_today: number;
    active_qualified: number;
    returned: number;
    status: "target_met" | "under_supply";
    utc_day: string;
    as_of: string;
    active_window_hours: number;
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
    has_more: boolean;
  };
}

export interface MapEvidenceLink {
  id: string;
  provider: SourceName;
  provider_label: string;
  source_url: string;
  source_title: string;
  published_at: string;
  observed_at: string;
  signal_summary: string;
}

export interface MapTrendActivity {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string | null;
  score: number;
  velocity_score: number;
  last_seen_at: string;
  evidence_count: number;
  source_count: number;
  latest_observed_at: string;
  evidence: MapEvidenceLink[];
}

export interface CountryActivity {
  country: Country;
  trend_count: number;
  evidence_count: number;
  source_count: number;
  latest_observed_at: string;
  rising_topics: MapTrendActivity[];
}

export interface MapActivityPayload {
  activities: CountryActivity[];
  mode: "live" | "demo";
  coverage: {
    countries_with_evidence: number;
    countries_available: number;
    attributed_evidence_count: number;
    active_window_hours: number;
    as_of: string;
  };
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
