import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../lib/site";

export type ComparisonAxis = {
  axis: string;
  competitor: string;
  alternative: string;
  whatsHappening: string;
};

export type ComparisonSource = {
  label: string;
  url: string;
  note: string;
};

export type ComparisonPageData = {
  slug: "exploding-topics-vs-google-trends" | "exploding-topics-vs-glimpse";
  title: string;
  description: string;
  heading: string;
  lead: string;
  competitor: string;
  alternative: string;
  competitorSummary: string;
  alternativeSummary: string;
  whatsHappeningSummary: string;
  quickAnswer: string;
  choiceGuidance: {
    competitor: string;
    alternative: string;
    whatsHappening: string;
  };
  axes: ComparisonAxis[];
  faq: Array<{ question: string; answer: string }>;
  sources: ComparisonSource[];
  sibling: { href: string; label: string };
};

const sharedSources: ComparisonSource[] = [
  {
    label: "What's Happening methodology",
    url: `${SITE_URL}/how-it-works`,
    note: "Official source adapters, score weights, country attribution, and current availability.",
  },
  {
    label: "What's Happening access",
    url: `${SITE_URL}/pricing`,
    note: "Verified $0 public access and the current account limitation.",
  },
];

export const googleTrendsComparison: ComparisonPageData = {
  slug: "exploding-topics-vs-google-trends",
  title: "Exploding Topics vs Google Trends: an evidence-first comparison",
  description:
    "Compare Exploding Topics and Google Trends by source coverage, discovery workflow, scoring, geography, and evidence access.",
  heading: "Exploding Topics vs Google Trends",
  lead:
    "Google Trends is the direct lens on Google search interest. Exploding Topics packages emerging-topic discovery across a wider set of web signals. The right choice depends on whether you already know the topic you want to test or need help finding candidates.",
  competitor: "Exploding Topics",
  alternative: "Google Trends",
  competitorSummary:
    "A curated trend-discovery product that combines algorithmic detection with analyst review, then adds trend databases, search-volume history, channel context, and forecasting.",
  alternativeSummary:
    "A Google product for exploring relative search interest, comparing terms or topics, checking regional patterns, and seeing what is trending now.",
  whatsHappeningSummary:
    "An early-access, source-linked approach that is designed to cluster official Hacker News, GitHub, and Google Trends RSS observations, expose the source trail, and publish its 45/35/20 scoring method.",
  quickAnswer:
    "Use Google Trends when you want a free, direct read on known search terms. Use Exploding Topics when you want a prepared discovery workflow and forward-looking trend research. Use What's Happening only when source-level evidence and an explicit scoring trail matter more than current production coverage: its live data service is not connected yet.",
  choiceGuidance: {
    competitor:
      "Choose Exploding Topics when you want the product to surface and organize emerging categories before you have a precise query.",
    alternative:
      "Choose Google Trends when you already know the terms to compare and want to inspect relative Google search interest by time and place.",
    whatsHappening:
      "Follow What's Happening if you want individual source observations, country-attributed evidence, and a transparent breakout score in one inspection path. Treat it as an early-access method today, not a working replacement.",
  },
  axes: [
    {
      axis: "Primary evidence",
      competitor: "Searches, conversations, mentions, and other web data described by Exploding Topics.",
      alternative: "Aggregated Google search interest.",
      whatsHappening: "Official Hacker News, GitHub, and Google Trends RSS observations by default.",
    },
    {
      axis: "Starting point",
      competitor: "Browse a prepared trend database or search for a topic.",
      alternative: "Enter a term or topic, or open Trending Now.",
      whatsHappening: "Inspect a scored trend cluster and its attached source trail.",
    },
    {
      axis: "Measurement",
      competitor: "Absolute search volume, growth history, and product-defined trend labels.",
      alternative: "Relative interest normalized on a 0–100 scale.",
      whatsHappening: "A published 0–100 score: velocity 45%, reach 35%, novelty 20%.",
    },
    {
      axis: "Geography",
      competitor: "Market and trend research views described by the product.",
      alternative: "Interest by country, region, and subregion where available.",
      whatsHappening: "Earliest country-tagged observation in a cluster, never a claim of invention or cause.",
    },
    {
      axis: "Evidence trail",
      competitor: "Curated topic views with analysis and related signals.",
      alternative: "Search-interest charts, related topics, and related queries.",
      whatsHappening: "Designed to retain links to the underlying observations and add a concise Why Layer.",
    },
    {
      axis: "Current readiness",
      competitor: "Established product with free and Pro surfaces.",
      alternative: "Working public Google product.",
      whatsHappening: "Public interface is live; production trend data and account access are unavailable.",
    },
  ],
  faq: [
    {
      question: "Is Exploding Topics the same as Google Trends?",
      answer:
        "No. Google Trends visualizes Google search interest. Exploding Topics describes a broader discovery process that scans web sources, applies machine learning, and uses analyst review to organize emerging topics.",
    },
    {
      question: "Which is better for validating a topic I already know?",
      answer:
        "Google Trends is usually the more direct first check because you can compare known terms, time ranges, and regions. Exploding Topics adds a more guided research layer when you need related opportunities or forward-looking discovery.",
    },
    {
      question: "Does What's Happening predict the next trend?",
      answer:
        "No. Its breakout score is a watch signal based on velocity, reach, and novelty. It is not a prediction or a guarantee that a topic will keep growing.",
    },
    {
      question: "Can I use What's Happening as a live alternative today?",
      answer:
        "Not yet. The public pages are available, but the production data service and authentication are not connected. The interface fails closed instead of showing demo records as live data.",
    },
  ],
  sources: [
    {
      label: "Exploding Topics methodology",
      url: "https://explodingtopics.com/about",
      note: "First-party description of its source breadth, algorithmic discovery, and product features.",
    },
    {
      label: "Exploding Topics API",
      url: "https://explodingtopics.com/feature/et-api",
      note: "First-party explanation of its discovery focus, search volume, categorization, and forecasts.",
    },
    {
      label: "Google Trends",
      url: "https://trends.google.com/home",
      note: "Official Explore and Trending Now product surfaces and learning resources.",
    },
    ...sharedSources,
  ],
  sibling: {
    href: "/compare/exploding-topics-vs-glimpse",
    label: "Exploding Topics vs Glimpse",
  },
};

export const glimpseComparison: ComparisonPageData = {
  slug: "exploding-topics-vs-glimpse",
  title: "Exploding Topics vs Glimpse: a source-grounded comparison",
  description:
    "Compare Exploding Topics and Glimpse by discovery model, search data, alerts, forecasting, evidence access, and current product fit.",
  heading: "Exploding Topics vs Glimpse",
  lead:
    "Both products help teams find rising topics before they feel obvious. Exploding Topics emphasizes a curated trend database across web signals. Glimpse emphasizes search-driven exploration, absolute volume, related queries, alerts, and trajectory analysis.",
  competitor: "Exploding Topics",
  alternative: "Glimpse",
  competitorSummary:
    "A curated trend-discovery product spanning topics, products, startups, channel breakdowns, meta trends, and an API.",
  alternativeSummary:
    "A search-data-led trend platform with absolute volume, growth metrics, related searches, channel breakdowns, alerts, and forecasting.",
  whatsHappeningSummary:
    "A narrower evidence-inspection product designed around official-source observations, explicit score weights, earliest country-tagged context, and direct source links.",
  quickAnswer:
    "Choose Exploding Topics for a prepared, analyst-reviewed discovery database. Choose Glimpse for deep search-demand exploration and tracking around a topic or niche. What's Happening takes a different route: it is designed to show how a technology trend earned its score, but its production feed is not connected yet.",
  choiceGuidance: {
    competitor:
      "Choose Exploding Topics when broad, curated discovery across topics, products, companies, and channels is the main job.",
    alternative:
      "Choose Glimpse when you need absolute search volume, long-tail queries, seasonality, alerts, and forecast-oriented research around specific markets.",
    whatsHappening:
      "Follow What's Happening when you want a technology-focused source trail and a score you can audit. It is not ready to replace either established product in a live workflow.",
  },
  axes: [
    {
      axis: "Discovery model",
      competitor: "Algorithmic detection plus human analyst review in a curated database.",
      alternative: "Search-driven discovery across categories and user-defined niches.",
      whatsHappening: "Cluster official-source observations into inspectable technology trends.",
    },
    {
      axis: "Primary evidence",
      competitor: "Search engines, social platforms, forums, news, commerce, podcasts, and other web sources described by the product.",
      alternative: "Search-demand data enriched with related queries and channel signals.",
      whatsHappening: "Official Hacker News, GitHub, and Google Trends RSS observations by default.",
    },
    {
      axis: "Trend analysis",
      competitor: "Search-volume history, growth, trend status, channel breakdowns, and forecasts.",
      alternative: "Absolute volume, monthly and yearly growth, seasonality, channel breakdowns, and forecasts.",
      whatsHappening: "A published 45/35/20 score for velocity, reach, and novelty, plus a concise Why Layer when configured.",
    },
    {
      axis: "Monitoring",
      competitor: "Projects, reports, integrations, and API access are described on first-party product pages.",
      alternative: "Keyword tracking and alerts when followed search activity changes.",
      whatsHappening: "No production alerting or working account workflow is available today.",
    },
    {
      axis: "Evidence trail",
      competitor: "Curated topic pages connect trend metrics and related opportunities.",
      alternative: "Search queries, related trends, topic maps, and channel context support exploration.",
      whatsHappening: "Designed to preserve the direct link for each underlying observation and its country tag when present.",
    },
    {
      axis: "Current readiness",
      competitor: "Established product with public and paid surfaces.",
      alternative: "Established product with a public signup path and product surfaces.",
      whatsHappening: "Public interface is live; production trend data and account access are unavailable.",
    },
  ],
  faq: [
    {
      question: "What is the main difference between Exploding Topics and Glimpse?",
      answer:
        "Exploding Topics centers its curated trend database and analyst-reviewed discovery process. Glimpse centers search-demand exploration, related queries, absolute volume, alerts, and trajectory analysis for topics you choose.",
    },
    {
      question: "Which tool is better for niche search research?",
      answer:
        "Glimpse presents itself as the deeper fit for user-defined niches and search-demand detail. Exploding Topics is the more natural starting point when you want a prepared database of emerging topics across categories.",
    },
    {
      question: "How is What's Happening different from both?",
      answer:
        "It is designed for inspecting technology trend evidence rather than forecasting a market. Each trend can retain source links, an explicit breakout score, earliest country-tagged context, and a concise explanation layer.",
    },
    {
      question: "Is What's Happening live today?",
      answer:
        "The public interface is live, but the production data service and authentication are not connected. It reports that limitation directly and does not substitute demo records.",
    },
  ],
  sources: [
    {
      label: "Exploding Topics methodology",
      url: "https://explodingtopics.com/about",
      note: "First-party source coverage, discovery method, and product-feature summary.",
    },
    {
      label: "Exploding Topics product workflow",
      url: "https://explodingtopics.com/blog/keep-up-with-trends",
      note: "First-party detail on its database, search, projects, meta trends, and analyst review.",
    },
    {
      label: "Glimpse product overview",
      url: "https://meetglimpse.com/",
      note: "First-party feature descriptions for volume, growth, channels, alerts, and trajectory forecasting.",
    },
    {
      label: "Glimpse comparison workflow",
      url: "https://meetglimpse.com/software-guides/exploding-topics-discount-code-march-2026/",
      note: "First-party explanation of niche search, related queries, topic maps, seasonality, and tracking.",
    },
    ...sharedSources,
  ],
  sibling: {
    href: "/compare/exploding-topics-vs-google-trends",
    label: "Exploding Topics vs Google Trends",
  },
};

export const comparisonPages = [googleTrendsComparison, glimpseComparison];

export function buildComparisonJsonLd(data: ComparisonPageData) {
  const pageUrl = `${SITE_URL}/compare/${data.slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#software`,
        name: SITE_NAME,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          url: `${SITE_URL}/pricing`,
        },
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}/#faq`,
        url: pageUrl,
        mainEntity: data.faq.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: {
            "@type": "Answer",
            text: answer,
          },
        })),
      },
    ],
  };
}
