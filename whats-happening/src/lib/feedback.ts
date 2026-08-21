export const demandFeedbackCategories = [
  { id: "ai", label: "AI" },
  { id: "technology", label: "Technology" },
  { id: "science", label: "Science" },
  { id: "business", label: "Business" },
  { id: "sports", label: "Sports" },
  { id: "entertainment", label: "Entertainment" },
] as const;

export type DemandFeedbackCategory =
  (typeof demandFeedbackCategories)[number]["id"];
