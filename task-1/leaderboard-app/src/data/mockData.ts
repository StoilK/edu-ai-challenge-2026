import type {
  ActivityItem,
  CategoryIconName,
  CategoryStatGroup,
  LeaderboardUser,
  UserCategoryStat,
} from "../types/leaderboard";

const firstNames = [
  "Avery",
  "Jordan",
  "Riley",
  "Morgan",
  "Casey",
  "Quinn",
  "Reese",
  "Skyler",
  "Cameron",
  "Dakota",
  "Emerson",
  "Finley",
  "Harper",
  "Indigo",
  "Jamie",
  "Kendall",
  "Logan",
  "Parker",
  "Rowan",
  "Sage",
  "Alex",
  "Blake",
  "Drew",
  "Ellis",
  "Jules",
  "Kai",
  "Noel",
  "Peyton",
  "Remi",
  "Sydney",
  "Tatum",
  "Terry",
  "Kerry",
  "Alicia",
  "Brendan",
];

const lastNames = [
  "Iverson",
  "Nguyen",
  "Hughes",
  "Patel",
  "Carter",
  "Diaz",
  "Elliott",
  "Fernandez",
  "Gallagher",
  "Hansen",
  "Inoue",
  "Jensen",
  "Klein",
  "Lopez",
  "Morrison",
  "Nelson",
  "Okafor",
  "Price",
  "Ramos",
  "Sullivan",
  "Torres",
  "Underwood",
  "Vasquez",
  "Walsh",
  "Xu",
  "Yates",
  "Zhang",
  "Bishop",
  "Cole",
  "Dean",
  "Fox",
  "Griffin",
  "Hale",
  "Ibarra",
  "Juarez",
];

const years = ["2025"] as const;
const quarters = ["Q1", "Q2", "Q3", "Q4"] as const;
const categories = ["Education", "Public Speaking", "University Partners"] as const;
const roles = [
  "Senior Software Engineer",
  "Product Manager",
  "UX Designer",
  "Data Analyst",
  "Scrum Master",
  "Engineering Manager",
  "DevOps Engineer",
  "QA Engineer",
  "Technical Writer",
] as const;

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const partnerNames = ["Najot Talim", "Tech Academy", "Open Learning Hub", "Regional University"];

/**
 * Partitions `total` into `n` positive integers that sum to `total`.
 */
function splitPoints(total: number, n: number, rand: () => number): number[] {
  n = Math.max(1, Math.min(n, total));
  if (n === 1) return [total];
  const w = Array.from({ length: n }, () => rand() + 0.01);
  const sumW = w.reduce((a, b) => a + b, 0);
  const parts: number[] = w.map((x) => Math.max(1, Math.floor((x / sumW) * total)));
  let s = parts.reduce((a, b) => a + b, 0);
  let diff = total - s;
  let i = 0;
  while (diff > 0) {
    parts[i % n] += 1;
    diff -= 1;
    i += 1;
  }
  i = 0;
  while (diff < 0) {
    if (parts[i % n] > 1) {
      parts[i % n] -= 1;
      diff += 1;
    }
    i += 1;
  }
  return parts;
}

/**
 * 1–4 activities; points sum to `totalPoints`. Each person is active in a random subset of
 * quarters (not always all four), with at most one row per quarter and dates in the right
 * month band (Q1=Jan–Mar, Q2=Apr–Jun, etc.).
 */
function buildActivitiesForUser(
  i: number,
  totalPoints: number,
  rand: () => number
): ActivityItem[] {
  if (totalPoints <= 0) return [];
  const mentee1 = lastNames[(i * 3 + 1) % lastNames.length];
  const mentee2 = lastNames[(i * 3 + 5) % lastNames.length];
  const partner = partnerNames[i % partnerNames.length];

  const shapeTemplates: {
    title: string;
    category: string;
    categoryIcon: CategoryIconName;
    statGroup: CategoryStatGroup;
  }[] = [
    {
      title: `[REG] Mentoring of ${mentee1}`,
      category: "Education",
      categoryIcon: "Education",
      statGroup: "Education",
    },
    {
      title: `[UNI] Lecture for guest from ${partner}`,
      category: "University Partnership",
      categoryIcon: "People",
      statGroup: "Engagement",
    },
    {
      title: `[PRES] External talk — ${mentee2}`,
      category: "Public Speaking",
      categoryIcon: "Presentation",
      statGroup: "Presentation",
    },
    {
      title: `[IDEA] Innovation sprint — ${mentee1}`,
      category: "Innovation",
      categoryIcon: "Lightbulb",
      statGroup: "Engagement",
    },
    {
      title: `[CODE] Open-source contribution — ${mentee2}`,
      category: "Open Source",
      categoryIcon: "Code",
      statGroup: "Engagement",
    },
  ];

  /** Q1=Jan–Mar, Q2=…, one representative date per quarter (same year as mock) */
  const quarterSlotDates = [
    "10-Feb-2025",
    "18-May-2025",
    "22-Aug-2025",
    "12-Nov-2025",
  ] as const;

  const maxN = Math.min(4, totalPoints);
  // How many quarters this person is active: 1…maxN (not everyone spans all four)
  const n = 1 + Math.floor(rand() * maxN);
  const allQuarterIndices: number[] = [0, 1, 2, 3];
  for (let s = allQuarterIndices.length - 1; s > 0; s -= 1) {
    const j = Math.floor(rand() * (s + 1));
    [allQuarterIndices[s], allQuarterIndices[j]] = [
      allQuarterIndices[j]!,
      allQuarterIndices[s]!,
    ];
  }
  const whichQuarters = allQuarterIndices
    .slice(0, n)
    .sort((a, b) => a - b);

  const partPoints = splitPoints(totalPoints, n, rand);

  return partPoints.map((points, k) => {
    const qIdx = whichQuarters[k] ?? 0;
    const shape = shapeTemplates[(i + k) % shapeTemplates.length];
    return {
      title: shape.title,
      category: shape.category,
      date: quarterSlotDates[qIdx]!,
      points,
      categoryIcon: shape.categoryIcon,
      statGroup: shape.statGroup,
    };
  });
}

const statGroupOrder: CategoryStatGroup[] = ["Education", "Presentation", "Engagement"];

function buildCategoryStatsFromActivities(activities: ActivityItem[]): UserCategoryStat[] {
  const m = new Map<CategoryStatGroup, { category: string; count: number }>();
  for (const a of activities) {
    const key = a.statGroup;
    const cur = m.get(key);
    if (cur) cur.count += 1;
    else m.set(key, { category: a.category, count: 1 });
  }
  return Array.from(m.entries())
    .map(([statGroup, { category, count }]) => ({ statGroup, category, count }))
    .sort(
      (a, b) =>
        b.count - a.count ||
        statGroupOrder.indexOf(a.statGroup) - statGroupOrder.indexOf(b.statGroup)
    );
}

/**
 * 35 fake participants — no real people or PII.
 */
export function buildMockUsers(count = 35): LeaderboardUser[] {
  const rand = mulberry32(0x4c0ffee);
  const users: LeaderboardUser[] = [];
  for (let i = 0; i < count; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 7) % lastNames.length];
    const name = `${fn} ${ln}`;
    const score = 40 + Math.floor(rand() * 60) + (i % 4);
    const activities = buildActivitiesForUser(i, score, rand);
    users.push({
      id: `u-${i + 1}`,
      name,
      role: roles[Math.floor(rand() * roles.length)],
      year: years[Math.floor(rand() * years.length)],
      quarter: quarters[Math.floor(rand() * quarters.length)],
      category: categories[Math.floor(rand() * categories.length)],
      score,
      categoryStats: buildCategoryStatsFromActivities(activities),
      totalLabel: "TOTAL",
      avatarSeed: `seed-${i}-${name}`.replace(/\s/g, ""),
      activities,
    });
  }
  return users;
}
