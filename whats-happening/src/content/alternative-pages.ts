import { SITE_URL } from "../lib/site";

export type AlternativeSlug =
  | "google-trends"
  | "exploding-topics"
  | "glimpse"
  | "trends-co";

export type AlternativePageData = {
  slug: AlternativeSlug;
  title: string;
  description: string;
  heading: string;
  eyebrow: string;
  lead: string;
  competitor: string;
  competitorSummary: string;
  quickAnswer: string;
  axes: Array<{
    axis: string;
    competitor: string;
    whatsHappening: string;
    decision: string;
  }>;
  bestFit: {
    competitor: string;
    whatsHappening: string;
  };
  faq: Array<{ question: string; answer: string }>;
  sources: Array<{ label: string; url: string; note: string }>;
  related: Array<{ href: string; label: string; note: string }>;
};

const whatsHappeningSources = [
  {
    label: "What's Happening methodology",
    url: `${SITE_URL}/how-it-works`,
    note: "Official source adapters, score weights, country attribution, and current availability.",
  },
  {
    label: "What's Happening access",
    url: `${SITE_URL}/pricing`,
    note: "Current public access and the account limitation are documented here.",
  },
];

export const googleTrendsAlternative: AlternativePageData = {
  slug: "google-trends",
  title: "Google Trends alternatives for source-linked trend research",
  description:
    "Compare Google Trends with What's Happening by evidence, discovery workflow, scoring, geography, and current product readiness.",
  heading: "A Google Trends alternative for inspecting the evidence",
  eyebrow: "Google Trends alternative",
  lead:
    "Google Trends is the direct choice for comparing known search terms. What's Happening is designed for a different job: finding technology signals across official sources and keeping the observations behind each score attached.",
  competitor: "Google Trends",
  competitorSummary:
    "A Google product for exploring relative search interest, comparing terms or topics, checking regional patterns, and seeing what is trending now.",
  quickAnswer:
    "Choose Google Trends when you already know the queries to compare and want a working view of Google search interest. Consider What's Happening when you want source-linked technology clusters and an explicit 45/35/20 scoring method. It is not a working replacement today because its production trend data and account access are unavailable.",
  axes: [
    {
      axis: "Primary evidence",
      competitor: "Aggregated Google search interest.",
      whatsHappening: "Official Hacker News, GitHub, and Google Trends RSS observations by default.",
      decision: "Search demand versus a multi-source technology evidence trail.",
    },
    {
      axis: "Starting point",
      competitor: "Enter a term or topic, or open Trending Now.",
      whatsHappening: "Inspect a scored topic cluster and the observations attached to it.",
      decision: "Known-query validation versus source-led discovery.",
    },
    {
      axis: "Measurement",
      competitor: "Relative interest normalized on a 0 to 100 scale.",
      whatsHappening: "A published score: velocity 45%, reach 35%, novelty 20%.",
      decision: "Relative search popularity versus a disclosed cross-source rank.",
    },
    {
      axis: "Geography",
      competitor: "Interest by country, region, and subregion where available.",
      whatsHappening: "The earliest country-tagged observation in a cluster.",
      decision: "Demand by place versus where usable evidence first appeared in the system.",
    },
    {
      axis: "Evidence trail",
      competitor: "Charts, related topics, and related queries.",
      whatsHappening: "Designed to retain the direct links behind a cluster and add a concise Why Layer.",
      decision: "Pattern exploration versus observation-level inspection.",
    },
    {
      axis: "Current readiness",
      competitor: "Working public Google product.",
      whatsHappening: "Public interface is live; production trend data and accounts are unavailable.",
      decision: "Use Google Trends for live research today.",
    },
  ],
  bestFit: {
    competitor:
      "Use Google Trends to compare known search terms, inspect seasonality, and see where Google search interest is concentrated.",
    whatsHappening:
      "Follow What's Happening if your research depends on a technology-focused source trail and a score you can audit. Treat it as an early-access method, not a live substitute.",
  },
  faq: [
    {
      question: "What is the best Google Trends alternative?",
      answer:
        "It depends on the job. Exploding Topics supports prepared topic discovery, Glimpse adds search-volume and tracking workflows, and What's Happening is designed for source-linked technology evidence. Google Trends remains the practical choice for live Google search-interest comparisons.",
    },
    {
      question: "How is What's Happening different from Google Trends?",
      answer:
        "Google Trends visualizes aggregated Google search interest. What's Happening is designed to cluster observations from Hacker News, GitHub, and Google Trends RSS, then retain the source trail behind an explicit velocity, reach, and novelty score.",
    },
    {
      question: "Does What's Happening show where a trend started?",
      answer:
        "No. It can attach the earliest usable country tag found in its observations. That is not proof of invention, origin, or cause.",
    },
    {
      question: "Can I use What's Happening instead of Google Trends today?",
      answer:
        "Not for a live workflow. The public interface is available, but its production data service and authentication are not connected. It reports that state instead of presenting sample records as live activity.",
    },
  ],
  sources: [
    {
      label: "Google Trends",
      url: "https://trends.google.com/home",
      note: "Official Explore, Trending Now, and learning surfaces.",
    },
    {
      label: "Google Trends Help",
      url: "https://support.google.com/trends/answer/6248105",
      note: "Official guidance for term comparison, geography, related searches, export, and citation.",
    },
    ...whatsHappeningSources,
  ],
  related: [
    { href: "/how-it-works", label: "How the signal engine works", note: "Inspect source coverage and score weights." },
    { href: "/pricing", label: "Current access", note: "Check the public product state." },
    { href: "/explore", label: "Explore", note: "See how an unavailable feed is reported." },
    { href: "/compare/exploding-topics-vs-google-trends", label: "Exploding Topics vs Google Trends", note: "Compare two established research workflows." },
    { href: "/alternatives/exploding-topics", label: "Exploding Topics alternatives", note: "Compare curated discovery with source inspection." },
  ],
};

export const explodingTopicsAlternative: AlternativePageData = {
  slug: "exploding-topics",
  title: "Exploding Topics alternatives for inspectable trend evidence",
  description:
    "Compare Exploding Topics with What's Happening by discovery model, source evidence, scoring, monitoring, and current readiness.",
  heading: "An Exploding Topics alternative built around the source trail",
  eyebrow: "Exploding Topics alternative",
  lead:
    "Exploding Topics packages emerging-topic discovery into a curated database with product research tools. What's Happening takes a narrower approach for technology signals: make the observations and score logic inspectable.",
  competitor: "Exploding Topics",
  competitorSummary:
    "A trend-discovery product that combines algorithmic detection with analyst review, then organizes topics, search history, related signals, projects, reports, and API access.",
  quickAnswer:
    "Choose Exploding Topics when you need a working, prepared discovery database and ongoing research workflow. Consider What's Happening when direct source links and published score weights matter more than breadth. Its live data and account journeys are not connected, so it is not a production replacement today.",
  axes: [
    {
      axis: "Discovery model",
      competitor: "Algorithmic detection plus human analyst review in a curated database.",
      whatsHappening: "Cluster official-source observations into inspectable technology trends.",
      decision: "Prepared research universe versus a narrower evidence-first system.",
    },
    {
      axis: "Primary evidence",
      competitor: "Searches, conversations, mentions, and other web data described by the product.",
      whatsHappening: "Official Hacker News, GitHub, and Google Trends RSS observations by default.",
      decision: "Broad web discovery versus named source adapters.",
    },
    {
      axis: "Trend analysis",
      competitor: "Search volume, growth history, status, related topics, and other product-defined signals.",
      whatsHappening: "A disclosed 45/35/20 score for velocity, reach, and novelty.",
      decision: "A broad research toolkit versus one inspectable ranking method.",
    },
    {
      axis: "Monitoring",
      competitor: "Projects, alerts, reports, integrations, and API access are described by the product.",
      whatsHappening: "No production alerts or working account workflow today.",
      decision: "Use Exploding Topics for an active monitoring workflow.",
    },
    {
      axis: "Evidence trail",
      competitor: "Curated topic views connect metrics, related trends, and analysis.",
      whatsHappening: "Designed to preserve direct observation links, country tags, and a concise Why Layer.",
      decision: "Curated interpretation versus source-by-source inspection.",
    },
    {
      axis: "Current readiness",
      competitor: "Established product with public and paid surfaces.",
      whatsHappening: "Public interface is live; production trend data and accounts are unavailable.",
      decision: "Use Exploding Topics for live research today.",
    },
  ],
  bestFit: {
    competitor:
      "Use Exploding Topics when you want the product to surface and organize emerging categories before you have a precise query.",
    whatsHappening:
      "Follow What's Happening when you want the individual observations, country-tagged context, and score weights in one inspection path. It is early access, not a live replacement.",
  },
  faq: [
    {
      question: "What is a good alternative to Exploding Topics?",
      answer:
        "Google Trends is useful for validating known search demand, while Glimpse adds search-volume and tracking workflows. What's Happening is designed for a narrower need: inspecting the source observations and score behind technology trends.",
    },
    {
      question: "How is What's Happening different from Exploding Topics?",
      answer:
        "Exploding Topics describes a broad discovery system with algorithmic detection, analyst review, a trend database, reports, projects, alerts, and API access. What's Happening publishes a narrower source set and explicit velocity, reach, and novelty weights.",
    },
    {
      question: "Does What's Happening predict which trends will grow?",
      answer:
        "No. Its breakout score is a watch signal based on observed velocity, reach, and novelty. It is not a forecast or a guarantee.",
    },
    {
      question: "Can What's Happening replace Exploding Topics today?",
      answer:
        "No. The public interface is available, but production trend data and authentication are not connected. Use an established product for a live research workflow today.",
    },
  ],
  sources: [
    {
      label: "Exploding Topics methodology",
      url: "https://explodingtopics.com/about",
      note: "First-party description of source breadth, algorithmic discovery, and analyst review.",
    },
    {
      label: "Exploding Topics research workflow",
      url: "https://explodingtopics.com/blog/trend-research-group",
      note: "First-party detail on the database, search, meta trends, projects, alerts, reports, and API.",
    },
    ...whatsHappeningSources,
  ],
  related: [
    { href: "/how-it-works", label: "How the signal engine works", note: "Inspect source coverage and score weights." },
    { href: "/pricing", label: "Current access", note: "Check the public product state." },
    { href: "/explore", label: "Explore", note: "See how an unavailable feed is reported." },
    { href: "/compare/exploding-topics-vs-google-trends", label: "Exploding Topics vs Google Trends", note: "Choose between discovery and known-query validation." },
    { href: "/compare/exploding-topics-vs-glimpse", label: "Exploding Topics vs Glimpse", note: "Compare curated discovery and search-depth workflows." },
  ],
};

export const glimpseAlternative: AlternativePageData = {
  slug: "glimpse",
  title: "Glimpse alternatives for source-linked technology trends",
  description:
    "Compare Glimpse with What's Happening by search data, discovery model, alerts, evidence access, scoring, and current readiness.",
  heading: "A Glimpse alternative for auditing technology signals",
  eyebrow: "Glimpse alternative",
  lead:
    "Glimpse adds search-volume, growth, related-query, tracking, and trajectory workflows. What's Happening is designed around a different unit of value: the technology observations attached to a transparent score.",
  competitor: "Glimpse",
  competitorSummary:
    "A search-data-led trend platform with absolute volume, monthly and yearly growth, related searches, channel breakdowns, alerts, seasonality, and trajectory analysis.",
  quickAnswer:
    "Choose Glimpse when you need a working search-demand workflow with volume, related queries, tracking, and trajectory analysis. Consider What's Happening when technology-specific source evidence and explicit score weights are the priority. Its production feed and accounts are unavailable today.",
  axes: [
    {
      axis: "Discovery model",
      competitor: "Search-driven discovery across categories and user-defined niches.",
      whatsHappening: "Cluster official-source observations into inspectable technology trends.",
      decision: "Search-market exploration versus source-led technology discovery.",
    },
    {
      axis: "Primary evidence",
      competitor: "Search-demand data enriched with related queries and channel signals.",
      whatsHappening: "Official Hacker News, GitHub, and Google Trends RSS observations by default.",
      decision: "Search depth versus a multi-source observation trail.",
    },
    {
      axis: "Measurement",
      competitor: "Absolute search volume, growth, seasonality, channel context, and trajectory analysis.",
      whatsHappening: "A published 45/35/20 score for velocity, reach, and novelty.",
      decision: "Demand analysis versus one disclosed breakout score.",
    },
    {
      axis: "Monitoring",
      competitor: "Topic tracking and alerts when followed search activity changes.",
      whatsHappening: "No production alerting or working account workflow today.",
      decision: "Use Glimpse when recurring tracking is required now.",
    },
    {
      axis: "Evidence trail",
      competitor: "Related searches, topic maps, and channel context support exploration.",
      whatsHappening: "Designed to preserve direct observation links and the earliest usable country tag.",
      decision: "Query expansion versus inspecting the observations behind a cluster.",
    },
    {
      axis: "Current readiness",
      competitor: "Established product with a public signup path and live product surfaces.",
      whatsHappening: "Public interface is live; production trend data and accounts are unavailable.",
      decision: "Use Glimpse for live search research today.",
    },
  ],
  bestFit: {
    competitor:
      "Use Glimpse when you need volume, growth, seasonality, related queries, and alerts around topics or niches you choose.",
    whatsHappening:
      "Follow What's Happening when source-linked technology evidence and an auditable score matter more than search-depth features. It is not a working substitute today.",
  },
  faq: [
    {
      question: "What is a good alternative to Glimpse?",
      answer:
        "Google Trends is the direct public option for relative search interest, and Exploding Topics offers a prepared discovery database. What's Happening is designed for source-level technology evidence rather than deep search-volume analysis.",
    },
    {
      question: "How is What's Happening different from Glimpse?",
      answer:
        "Glimpse centers search volume, growth, related queries, channels, tracking, and trajectory analysis. What's Happening centers technology observations from named official sources and a published velocity, reach, and novelty score.",
    },
    {
      question: "Does What's Happening forecast trends?",
      answer:
        "No. It explains why a topic earned a breakout-watch score from observed signals. That score should not be read as a prediction.",
    },
    {
      question: "Is What's Happening available as a live Glimpse alternative?",
      answer:
        "Not yet. Its public interface is live, but production data and authentication are not connected. It does not replace the missing services with demo activity.",
    },
  ],
  sources: [
    {
      label: "Glimpse product overview",
      url: "https://meetglimpse.com/",
      note: "First-party descriptions of volume, growth, channels, alerts, and trajectory analysis.",
    },
    {
      label: "Glimpse for Google Trends",
      url: "https://meetglimpse.com/google-trends-supercharged/",
      note: "First-party detail on related searches, seasonality, topic maps, and spreadsheet export.",
    },
    ...whatsHappeningSources,
  ],
  related: [
    { href: "/how-it-works", label: "How the signal engine works", note: "Inspect source coverage and score weights." },
    { href: "/pricing", label: "Current access", note: "Check the public product state." },
    { href: "/explore", label: "Explore", note: "See how an unavailable feed is reported." },
    { href: "/compare/exploding-topics-vs-glimpse", label: "Exploding Topics vs Glimpse", note: "Compare curated discovery with search-depth research." },
    { href: "/alternatives/google-trends", label: "Google Trends alternatives", note: "Compare direct search interest with source inspection." },
  ],
};

export const trendsCoAlternative: AlternativePageData = {
  slug: "trends-co",
  title: "Trends.co alternatives for technology trend research",
  description:
    "Compare the current Trends.co destination with What's Happening by research format, evidence access, discovery workflow, scoring, and readiness.",
  heading: "A Trends.co alternative for inspecting technology signals",
  eyebrow: "Trends.co alternative",
  lead:
    "Trends.co now resolves to HubSpot's Trends by The Hustle editorial collection, with business ideas, research, guides, and reports. What's Happening is designed as an inspectable technology-signal product, not an editorial publication.",
  competitor: "Trends by The Hustle",
  competitorSummary:
    "A HubSpot editorial collection of data-backed business trends, research insights, industry analysis, business ideas, operator guides, reports, and media.",
  quickAnswer:
    "Choose Trends by The Hustle when you want readable business research, ideas, and operator guidance. Consider What's Happening when you want to inspect technology observations and a disclosed scoring model. Its production feed and account journeys are unavailable, so it is not a live research replacement today.",
  axes: [
    {
      axis: "Product format",
      competitor: "An editorial archive and resource collection on HubSpot.",
      whatsHappening: "A product interface for scored technology-signal clusters.",
      decision: "Published analysis versus an interactive evidence workflow.",
    },
    {
      axis: "Starting point",
      competitor: "Browse articles, business ideas, guides, reports, and other media.",
      whatsHappening: "Inspect a scored topic cluster and its attached observations.",
      decision: "Editor-selected reading versus signal-led exploration.",
    },
    {
      axis: "Primary evidence",
      competitor: "Data-backed research and analysis presented in published content.",
      whatsHappening: "Official Hacker News, GitHub, and Google Trends RSS observations by default.",
      decision: "Narrative synthesis versus a named source trail.",
    },
    {
      axis: "Measurement",
      competitor: "Varies by the research or article being published.",
      whatsHappening: "A disclosed 45/35/20 score for velocity, reach, and novelty.",
      decision: "Editorial context versus a consistent ranking formula.",
    },
    {
      axis: "Evidence trail",
      competitor: "Sources and data appear within the context of each published piece.",
      whatsHappening: "Designed to attach direct observation links, country tags, and a Why Layer to each cluster.",
      decision: "Read a completed analysis versus audit the observations behind a score.",
    },
    {
      axis: "Current readiness",
      competitor: "Current HubSpot editorial pages are publicly readable.",
      whatsHappening: "Public interface is live; production trend data and accounts are unavailable.",
      decision: "Use the editorial collection for current business research today.",
    },
  ],
  bestFit: {
    competitor:
      "Use Trends by The Hustle when you want editors to turn business data and market observations into ideas, guides, and readable reports.",
    whatsHappening:
      "Follow What's Happening when you want technology observations, country-tagged context, and score weights in one inspection path. Treat it as an early-access method today.",
  },
  faq: [
    {
      question: "What happened to Trends.co?",
      answer:
        "The trends.co domain currently resolves to HubSpot's Trends by The Hustle collection. That public destination presents business trends, research insights, industry analysis, ideas, guides, reports, and media.",
    },
    {
      question: "What is a good Trends.co alternative?",
      answer:
        "For editorial business research, the current Trends by The Hustle collection is the direct continuation to inspect. For search-interest validation, use Google Trends. What's Happening is designed for source-linked technology evidence, but its live data service is not connected today.",
    },
    {
      question: "How is What's Happening different from Trends by The Hustle?",
      answer:
        "Trends by The Hustle is an editorial research surface. What's Happening is designed as an interactive product where a technology cluster retains source observations and an explicit score.",
    },
    {
      question: "Can I use What's Happening as a live replacement now?",
      answer:
        "No. The public interface is available, but production trend data and authentication are not connected. It reports that limitation instead of showing sample records as live activity.",
    },
  ],
  sources: [
    {
      label: "Trends by The Hustle",
      url: "https://blog.hubspot.com/trends",
      note: "The current official destination reached from trends.co and its published research categories.",
    },
    {
      label: "The Hustle",
      url: "https://thehustle.co/",
      note: "Official HubSpot-owned publication surface connected to the current Trends collection.",
    },
    ...whatsHappeningSources,
  ],
  related: [
    { href: "/how-it-works", label: "How the signal engine works", note: "Inspect source coverage and score weights." },
    { href: "/pricing", label: "Current access", note: "Check the public product state." },
    { href: "/explore", label: "Explore", note: "See how an unavailable feed is reported." },
    { href: "/alternatives/google-trends", label: "Google Trends alternatives", note: "Compare known-query validation with source inspection." },
    { href: "/alternatives/exploding-topics", label: "Exploding Topics alternatives", note: "Compare curated discovery with source inspection." },
  ],
};

export const alternativePages: AlternativePageData[] = [
  googleTrendsAlternative,
  explodingTopicsAlternative,
  glimpseAlternative,
  trendsCoAlternative,
];

export function getAlternativePage(slug: string) {
  return alternativePages.find((page) => page.slug === slug);
}

export function buildAlternativeJsonLd(data: AlternativePageData) {
  const pageUrl = `${SITE_URL}/alternatives/${data.slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "What's Happening",
        url: SITE_URL,
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#software`,
        name: "What's Happening",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        description:
          "Source-linked trend intelligence for inspecting scored technology signals, country-attributed evidence, and source trails.",
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
