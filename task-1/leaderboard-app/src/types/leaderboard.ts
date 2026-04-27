/** Category stat icon names used in the original SharePoint template */
export type CategoryIconName =
  | "Presentation"
  | "Education"
  | "Lightbulb"
  | "People"
  | "Code";

/**
 * Row-level stats: one group per *visual* icon. `Engagement` maps to the single
 * Emoji2 glyph used for Lightbulb / People / Code in `FabricIcon` (no duplicate emojis).
 */
export type CategoryStatGroup = "Education" | "Presentation" | "Engagement";

export function categoryStatGroupIcon(g: CategoryStatGroup): CategoryIconName {
  switch (g) {
    case "Education":
      return "Education";
    case "Presentation":
      return "Presentation";
    case "Engagement":
      return "People";
  }
}

export interface ActivityItem {
  title: string;
  /** Table column label in the details grid */
  category: string;
  date: string;
  points: number;
  /** Icon in the table category pill */
  categoryIcon: CategoryIconName;
  /**
   * Merge key for the list row stats: same `statGroup` → one icon + total count.
   * `Engagement` = shared emoji slot (Lightbulb/People/Code in the table; one stat on the row).
   */
  statGroup: CategoryStatGroup;
}

export interface UserCategoryStat {
  statGroup: CategoryStatGroup;
  /** Representative label (first row in the group) for the tooltip */
  category: string;
  count: number;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  role: string;
  /** e.g. "2025" — first filter: all years or a year */
  year: string;
  /** "Q1" … "Q4" — second filter */
  quarter: string;
  /** e.g. Education, Public Speaking, University Partners — third filter */
  category: string;
  score: number;
  /** Merged from `activities` by `statGroup` (one row stat per visual: Education, Presentation, Engagement) */
  categoryStats: UserCategoryStat[];
  /** Shown next to the score (e.g. “Total”) */
  totalLabel: string;
  /** Used for the row/column avatar background */
  avatarSeed: string;
  activities: ActivityItem[];
}

export interface ProcessedUser extends LeaderboardUser {
  rank: number;
  /** Shown in podium and list: category points when a category filter is active, else `score` */
  viewScore: number;
  /**
   * Label next to the star (e.g. "TOTAL" or the selected filter name); matches `viewScore`
   */
  viewScoreLabel: string;
  /**
   * Subset of `activities` for the "Recent activity" list: matches year / quarter / category
   * filters, newest first
   */
  viewActivities: ActivityItem[];
}
