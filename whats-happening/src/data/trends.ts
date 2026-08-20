export interface Trend {
  id: string;
  rank: number;
  title: string;
  category: string;
  growth: number;
  country: string;
  isRising: boolean;
  slug: string;
  sparkline: number[];
  description: string;
}

export const trends: Trend[] = [
  {
    id: "1",
    rank: 1,
    title: "Artificial Intelligence",
    category: "AI",
    growth: 218,
    country: "Worldwide",
    isRising: true,
    slug: "artificial-intelligence",
    sparkline: [12, 18, 25, 40, 55, 80, 110, 218],
    description: "The global conversation around generative AI, AGI prospects, and new foundation models has reached an all-time high.",
  },
  {
    id: "2",
    rank: 2,
    title: "Quantum Computing",
    category: "Technology",
    growth: 145,
    country: "United States",
    isRising: true,
    slug: "quantum-computing",
    sparkline: [10, 15, 20, 25, 30, 45, 85, 145],
    description: "Breakthroughs in qubit stability and error correction are driving massive interest from tech giants and governments.",
  },
  {
    id: "3",
    rank: 3,
    title: "CRISPR-Cas9",
    category: "Science",
    growth: 92,
    country: "Europe",
    isRising: true,
    slug: "crispr-cas9",
    sparkline: [5, 8, 12, 22, 35, 48, 65, 92],
    description: "New clinical trials and regulatory approvals in the EU are sparking discussions about the future of gene editing.",
  },
  {
    id: "4",
    rank: 4,
    title: "Space Tourism",
    category: "Space",
    growth: 68,
    country: "Worldwide",
    isRising: true,
    slug: "space-tourism",
    sparkline: [15, 20, 22, 28, 35, 42, 55, 68],
    description: "Upcoming commercial spaceflights and orbital hotels are dominating mainstream media and science forums.",
  },
  {
    id: "5",
    rank: 5,
    title: "Sustainable Aviation",
    category: "Business",
    growth: -12,
    country: "Asia",
    isRising: false,
    slug: "sustainable-aviation",
    sparkline: [80, 75, 70, 65, 50, 45, 40, 35],
    description: "Despite recent commitments, supply chain issues for sustainable aviation fuels have slightly cooled the immediate hype.",
  }
];

export const nextBigThings = [
  { id: "n1", title: "Neuromorphic Computing", growth: 74, confidence: "High" },
  { id: "n2", title: "Direct Air Capture", growth: 68, confidence: "Medium" },
  { id: "n3", title: "Solid State Batteries", growth: 51, confidence: "High" },
];
