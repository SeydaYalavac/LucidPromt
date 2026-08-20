export type HomepageFaq = {
  question: string;
  answer: string;
};

export const homepageFaqs: HomepageFaq[] = [
  {
    question: "What is What's Happening in AI?",
    answer:
      "What's Happening is a live trend-intelligence product for developers, founders, analysts, and researchers. It turns scattered technology and internet signals into scored trends, source evidence, country context, and a plain-language explanation of why attention is moving.",
  },
  {
    question: "How do live AI signals work?",
    answer:
      "The system reads official or permissioned sources such as Hacker News, GitHub, and Google Trends, then groups related signals into trends. Each trend score combines velocity, reach, and novelty, while source links stay attached so you can inspect the evidence behind it.",
  },
  {
    question: "How do you track where a trend started?",
    answer:
      "Country context is based on the earliest attributed signals and location metadata available for a trend. It shows where the evidence first appeared in the system, not a claim that any single country definitively invented or caused the topic.",
  },
  {
    question: "What are predicted breakout topics?",
    answer:
      "Predicted breakout topics are early trend candidates with strong novelty and rising attention that have not yet crossed the Global Pulse threshold. They are evidence-based watch signals, not guarantees about what will become popular next.",
  },
  {
    question: "How fresh is the trend data?",
    answer:
      "When the live data service is configured, source ingestion is designed to run every 10 minutes and the homepage refreshes active trends every 15 to 30 seconds. If live data is unavailable, the product says so instead of presenting demo fixtures as current activity.",
  },
  {
    question: "How much does What's Happening cost?",
    answer:
      "What's Happening is free during early access at $0. There is no trial countdown or published usage cap today; live trend availability still depends on the production data service being connected.",
  },
];
