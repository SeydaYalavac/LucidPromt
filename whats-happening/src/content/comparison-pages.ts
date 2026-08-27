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
  slug: "exploding-topics-vs-google-trends" | "exploding-topics-vs-glimpse" | "trend-analysis-tools";
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
  reviewedOn?: string;
  productionStatus?: {
    label: string;
    title: string;
    body: string;
  };
  deepDive?: Array<{
    eyebrow: string;
    heading: string;
    paragraphs: string[];
  }>;
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

export const trendAnalysisToolsComparison: ComparisonPageData = {
  slug: "trend-analysis-tools",
  title: "Trend analysis tool: Google Trends vs Glimpse",
  description:
    "Compare Google Trends, Glimpse, and What's Happening by data source, measurement, alerts, evidence, geography, access, and research fit.",
  heading: "Which trend analysis tool fits your research?",
  lead:
    "A useful trend analysis tool must match the decision you need to make. Google Trends measures relative search interest. Glimpse adds search volume and monitoring. What's Happening maps source-linked technology signals for evidence-first research.",
  competitor: "Google Trends",
  alternative: "Glimpse",
  competitorSummary:
    "A free Google product for comparing relative search interest, reviewing regional patterns, and finding currently trending searches.",
  alternativeSummary:
    "A search research product that adds absolute volume, growth rates, channel context, alerts, and trajectory analysis to trend discovery.",
  whatsHappeningSummary:
    "A public, AI-focused research product that clusters official Hacker News, GitHub, and Google Trends RSS observations. It links the evidence and explains its 45/35/20 score.",
  quickAnswer:
    "Use Google Trends to validate known search topics. Use Glimpse when search volume, related demand, and alerts guide the decision. Use What's Happening to inspect emerging AI signals across source types. No single tool covers all three jobs well, so the right choice starts with the evidence you need.",
  choiceGuidance: {
    competitor:
      "Choose Google Trends when you already have terms to test. It gives a direct view of normalized Google search interest across time and place. It is also the easiest free starting point.",
    alternative:
      "Choose Glimpse when absolute search demand, growth rates, related queries, and alerts matter. Its research workflow fits teams that turn search behavior into content, market, or product decisions.",
    whatsHappening:
      "Choose What's Happening when the question concerns emerging AI or technology. Use it when source links, cross-source evidence, score components, and careful geography matter more than demand forecasting.",
  },
  axes: [
    {
      axis: "Primary evidence",
      competitor: "Aggregated and anonymized Google search activity.",
      alternative: "Search-demand data with related queries and channel-level context.",
      whatsHappening: "Official Hacker News, GitHub, and Google Trends RSS observations by default.",
    },
    {
      axis: "Starting point",
      competitor: "Enter a known term or topic, or inspect Trending Now.",
      alternative: "Research a keyword, category, or niche and expand into related demand.",
      whatsHappening: "Open a scored AI trend cluster and inspect its linked observations.",
    },
    {
      axis: "Measurement",
      competitor: "Relative interest normalized from 0 to 100 for the selected time and place.",
      alternative: "Absolute search volume, monthly and yearly growth, seasonality, and trajectories.",
      whatsHappening: "A published 0–100 score: velocity 45%, reach 35%, and novelty 20%.",
    },
    {
      axis: "Monitoring",
      competitor: "Saved or repeat checks remain the main workflow for topics you track.",
      alternative: "Keyword tracking and alerts support ongoing search-demand monitoring.",
      whatsHappening: "The public feed updates, but account-based alert workflows are not the core offer.",
    },
    {
      axis: "Evidence trail",
      competitor: "Charts, related topics, related queries, and regional breakdowns support validation.",
      alternative: "Volume, growth, related searches, and channel context support market research.",
      whatsHappening: "Each usable trend retains links to source observations and a short Why Layer.",
    },
    {
      axis: "Best research fit",
      competitor: "Testing known public interest and comparing search language.",
      alternative: "Quantifying search demand and monitoring market or content opportunities.",
      whatsHappening: "Finding and checking early AI signals with inspectable source evidence.",
    },
  ],
  reviewedOn: "27 August 2026",
  productionStatus: {
    label: "Current production limits",
    title: "The public feed is live. Coverage and account access still have boundaries.",
    body:
      "Public trend, category, country, and research pages are available at $0 without an account. The live feed depends on connected official sources. Optional Reddit, X, Tavily, and Exa coverage requires separate credentials. Google sign-in is configured, while other identity providers can remain unavailable until enabled. Check the linked evidence before using any score for a high-stakes decision.",
  },
  deepDive: [
    {
      eyebrow: "Start with the decision",
      heading: "Define what trend analysis must answer.",
      paragraphs: [
        "The phrase trend analysis covers several different jobs. A content team may want rising search demand. A founder may want early technical adoption signals. A brand team may need social conversations and sentiment. An analyst may need to model an owned time series. Those jobs require different data, so a long feature list does not settle the choice.",
        "Write the decision before opening a tool. Ask whether you need discovery, validation, monitoring, or forecasting. Discovery finds candidates you did not know. Validation tests a named topic. Monitoring tracks a topic after selection. Forecasting estimates a future path. Many products support more than one job, but each product still has a strongest starting point.",
        "Then name the unit you need to measure. Google Trends reports relative search interest. Glimpse presents absolute search volume and growth measures. What's Happening scores clusters of linked technology observations. These numbers answer different questions. A score of 80 in one product cannot be compared with 80 in another. Treat each metric as a defined instrument, not a universal measure of importance.",
        "Finally, set the evidence standard. A lightweight content idea may need one demand check. A market claim needs more support. An investment or product decision needs the source trail, contrary evidence, and a clear limit. The best trend analysis tool is the one that makes that standard practical without hiding how the result was produced.",
      ],
    },
    {
      eyebrow: "Evaluation framework",
      heading: "Check six things before you trust the chart.",
      paragraphs: [
        "First, inspect source coverage. Search data shows expressed interest, not all adoption. Social data shows conversation, not always purchase intent. Repository activity shows technical work, but it can miss private development. News coverage shows attention, yet reporting can amplify the same announcement many times. Cross-source coverage helps only when the tool preserves the meaning of each source.",
        "Second, inspect normalization. Google explains that Trends data is sampled, aggregated, and normalized by time and geography. Results use a 0–100 scale. That makes comparison easy, but it is not absolute search volume. Low-volume terms can show zero. Glimpse is a better fit when absolute volume is necessary. You should still check the selected country, period, and wording before acting.",
        "Third, inspect query handling. Google distinguishes a search term from a topic. Terms match selected words. Topics can group the same concept across languages. A careless choice can change the chart. Check close synonyms, spelling variants, and product names separately. Record the exact query so another researcher can repeat the analysis.",
        "Fourth, inspect freshness and history. A real-time spike helps monitoring, but it may contain noise. A long history reveals seasonality, yet it can hide a new shift. Fifth, inspect exports and alerts. These features matter when research becomes a repeat process. Sixth, inspect evidence access. A result is easier to defend when you can open the observations, note their dates, and explain the measurement limit.",
      ],
    },
    {
      eyebrow: "Main tools",
      heading: "Google Trends, Glimpse, and What's Happening serve different workflows.",
      paragraphs: [
        "Google Trends is the cleanest free choice for validating known search interest. Compare several terms, change the region, widen the period, and inspect related queries. Use it to test wording and seasonality. It is especially useful when a team asks whether public search attention is rising. Do not call the 0–100 value search volume. Google states that the value is normalized within the selected comparison.",
        "Glimpse fits a deeper search-demand workflow. Its first-party product page describes absolute search volume, monthly and yearly growth, channel breakdowns, alerts, and trajectory analysis. That combination helps content, consumer research, and market teams quantify a niche. It also reduces manual checks when a team follows many topics. The tradeoff is that its strongest evidence remains search behavior and related demand, not a source-by-source technology briefing.",
        "What's Happening fits early AI and technology research. It combines official Hacker News, GitHub, and Google Trends RSS observations by default. The score gives 45% weight to velocity, 35% to reach, and 20% to novelty. A trend page can show the linked observations and a short explanation. Its country label means the earliest usable country-tagged observation. It does not prove where an idea began or which country caused its growth.",
        "The tools can work together. Start in What's Happening when you need emerging AI candidates. Open the linked sources and remove weak clusters. Move the surviving terms into Google Trends to compare public search interest. Use Glimpse when absolute demand, related questions, or alerts affect the plan. This sequence keeps discovery, evidence checking, and demand validation separate.",
      ],
    },
    {
      eyebrow: "Honest rival fit",
      heading: "Choose another tool when the main question is social, brand, retail, or statistical.",
      paragraphs: [
        "Hootsuite's trend analysis offer is a stronger fit for social and brand teams. Its product pages describe social and web trends, region and industry filters, engagement, sentiment, and momentum. Talkwalker powers its wider listening coverage. Choose that route when the decision depends on audience reaction, campaign context, or brand monitoring. A search chart or repository signal cannot replace direct social listening.",
        "Palowise also focuses on social and web analysis. Its public product material emphasizes media, sentiment, competition, and audience intelligence. Consider it when the team needs to understand who is discussing a topic and how the discussion changes. Pulsar goes further into audience segmentation across search, social, and news. It also offers research and consultancy. That can be a better fit for a complex cultural or audience question.",
        "Trendalytics serves a different buyer. It positions its platform around AI trend forecasting and analytics for consumer brands. Retail, fashion, beauty, and product planning teams may need category-specific demand signals that general trend tools do not provide. Compare its market and category coverage with your actual merchandising cycle before buying. A technology signal feed is not designed to make assortment or inventory decisions.",
        "Use statistical software when the trend lives in your own numbers. Revenue, retention, support volume, inventory, and sensor data are time series. A spreadsheet, notebook, or business intelligence tool can test moving averages, seasonality, anomalies, and confidence intervals. Public trend products do not replace that work. The honest choice depends on the observation unit, the decision cost, and the need for repeatable analysis.",
      ],
    },
    {
      eyebrow: "Evidence-first workflow",
      heading: "Turn a signal into a research record, not a headline.",
      paragraphs: [
        "Begin with a candidate and a decision date. Write why the topic matters and what would change if the signal is real. Then collect at least two independent observations. A repository release and a Hacker News discussion are more useful together than several copies of one announcement. Open the original links. Record publication dates, source types, and any clear commercial interest.",
        "Next, test search demand. Use a topic when you want a broader concept across languages. Use exact terms when wording matters. Compare close alternatives and change the time range. A seven-day spike can disappear in a five-year chart. A stable annual pattern can look like growth in a short window. Save the region and period with the result.",
        "Then challenge the signal. Look for release-driven spikes, duplicated coverage, bot activity, and one large community dominating reach. Ask what evidence would disprove the claim. If the topic is technical, inspect the repository and documentation. If it is commercial, look for buyers, pricing, hiring, or integration activity. Trend attention does not automatically mean market adoption.",
        "End with a bounded decision. State whether to ignore, monitor, investigate, or act. Include the reason, source links, measurement limits, and the next review date. This record matters more than a perfect score. It lets another person reproduce the call and update it when new evidence arrives.",
      ],
    },
  ],
  faq: [
    {
      question: "What is the best trend analysis tool?",
      answer:
        "Google Trends is a strong free choice for known search topics. Glimpse fits deeper search-demand research and alerts. What's Happening fits source-linked AI discovery. Social listening, retail forecasting, and owned time-series analysis need different specialist tools.",
    },
    {
      question: "Is Google Trends a trend analysis tool?",
      answer:
        "Yes. It analyzes relative Google search interest across time and geography. Google normalizes results to a 0–100 scale, so the chart does not show absolute search volume.",
    },
    {
      question: "Can a free trend analysis tool show search volume?",
      answer:
        "Many free tools show relative interest or limited estimates. Google Trends reports normalized interest, not absolute volume. Check the metric definition before comparing values across products.",
    },
    {
      question: "How should an AI founder track emerging trends?",
      answer:
        "Combine source-linked discovery with search validation. Inspect technical sources first, compare search interest second, and record the evidence limit. Monitor only the topics that can change a product or market decision.",
    },
    {
      question: "Does What's Happening predict future demand?",
      answer:
        "No. Its breakout score is a watch signal based on velocity, reach, and novelty. It does not guarantee future growth, demand, adoption, or commercial value.",
    },
  ],
  sources: [
    {
      label: "Google Trends",
      url: "https://trends.google.com/trends/",
      note: "Official Explore and Trending Now product surfaces.",
    },
    {
      label: "Google Trends data FAQ",
      url: "https://support.google.com/trends/answer/4365533?hl=en",
      note: "Official explanation of sampling, aggregation, normalization, and the 0–100 scale.",
    },
    {
      label: "Google Trends terms and topics",
      url: "https://support.google.com/trends/answer/17309543",
      note: "Official guidance on comparing search terms and broader topics.",
    },
    {
      label: "Glimpse product overview",
      url: "https://meetglimpse.com/",
      note: "First-party descriptions of search volume, growth, channels, alerts, and trajectories.",
    },
    {
      label: "Hootsuite trend analysis",
      url: "https://www.hootsuite.com/trend-analysis-tool",
      note: "First-party details for social and web trend research, sentiment, and momentum.",
    },
    {
      label: "Pulsar trend analysis",
      url: "https://www.pulsarplatform.com/solutions/trend-analysis",
      note: "First-party description of search, social, news, audience, and research workflows.",
    },
    {
      label: "Palowise analytics",
      url: "https://palowise.ai/analytics/",
      note: "First-party overview of media, sentiment, competition, and audience analysis.",
    },
    {
      label: "Trendalytics",
      url: "https://trendalytics.co/",
      note: "First-party overview of retail analytics, consumer trend forecasting, and market intelligence.",
    },
    ...sharedSources,
  ],
  sibling: {
    href: "/compare/exploding-topics-vs-google-trends",
    label: "Exploding Topics vs Google Trends",
  },
};

export const comparisonPages = [googleTrendsComparison, glimpseComparison, trendAnalysisToolsComparison];

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
