import type { ActivityItem, LeaderboardUser } from "../types/leaderboard";
import {
  activityInCalendarQuarter,
  dateMs,
  getLatestActivityMs,
  getLatestActivityMsInYear,
  getLatestInActivitiesMatching,
  isActivityQuarter,
  latestDateMsInQuarter,
  parseActivityDateString,
  sumActivityPointsInQuarter,
  sumActivityPointsInYear,
  type ActivityQuarter,
} from "./activityDates";

/**
 * Sums `points` on activities that belong to the given leaderboard category filter
 * (aligned with the three dropdowns in `useLeaderboardView`).
 */
export function activityMatchesCategoryFilter(
  a: ActivityItem,
  filter: string
): boolean {
  if (filter === "Education") return a.statGroup === "Education";
  if (filter === "Public Speaking") return a.statGroup === "Presentation";
  if (filter === "University Partners" || filter === "University Partners...")
    return a.category === "University Partnership";
  return false;
}

function categoryFilterLabel(
  filter: string,
  allCategoriesLabel: string
): string | null {
  if (filter === allCategoriesLabel) return null;
  if (filter === "University Partners") return "UNIVERSITY PARTNERS";
  if (filter === "Public Speaking") return "PUBLIC SPEAKING";
  if (filter === "Education") return "EDUCATION";
  return filter.toUpperCase();
}

function sumInQuarterAndCategory(
  u: LeaderboardUser,
  filter: string,
  _allCategoriesLabel: string,
  q: ActivityQuarter,
  year: string,
  allYears: string
): number {
  return u.activities
    .filter(
      (a) =>
        activityMatchesCategoryFilter(a, filter) &&
        activityInCalendarQuarter(a, q, year, allYears)
    )
    .reduce((s, a) => s + a.points, 0);
}

function yearMatchesActivity(
  a: ActivityItem,
  year: string,
  allYears: string
): boolean {
  if (allYears === year) return true;
  const t = parseActivityDateString(a.date);
  return t !== null && String(t.getFullYear()) === year;
}

/** Latest activity time among rows matching the category filter (and year if selected). */
function latestInCategoryRespectingYear(
  u: LeaderboardUser,
  filter: string,
  allCategoriesLabel: string,
  year: string,
  allYears: string
): number {
  if (filter === allCategoriesLabel) return 0;
  return getLatestInActivitiesMatching(u, (a) => {
    if (!activityMatchesCategoryFilter(a, filter)) return false;
    return yearMatchesActivity(a, year, allYears);
  });
}

export function sumActivityPointsForFilter(
  u: LeaderboardUser,
  filter: string,
  allCategoriesLabel: string
): number {
  if (filter === allCategoriesLabel) return u.score;
  return u.activities
    .filter((a) => activityMatchesCategoryFilter(a, filter))
    .reduce((s, a) => s + a.points, 0);
}

/** Sums points for category filter limited to a calendar year (when a year is selected). */
function sumActivityPointsForFilterInYear(
  u: LeaderboardUser,
  filter: string,
  allCategoriesLabel: string,
  year: string,
  allYears: string
): number {
  if (filter === allCategoriesLabel) {
    if (allYears === year) return u.score;
    return u.activities
      .filter((a) => yearMatchesActivity(a, year, allYears))
      .reduce((s, a) => s + a.points, 0);
  }
  return u.activities
    .filter(
      (a) =>
        activityMatchesCategoryFilter(a, filter) &&
        yearMatchesActivity(a, year, allYears)
    )
    .reduce((s, a) => s + a.points, 0);
}

/**
 * Activities shown in the expanded "Recent activity" table: same scope as the score
 * (year / quarter / category), most recent first.
 */
export function activitiesForListView(
  u: LeaderboardUser,
  category: string,
  allCat: string,
  quarter: string,
  allQ: string,
  year: string,
  allY: string
): ActivityItem[] {
  const out = u.activities.filter((a) => {
    if (!yearMatchesActivity(a, year, allY)) return false;
    if (quarter !== allQ) {
      if (!isActivityQuarter(quarter)) return false;
      if (!activityInCalendarQuarter(a, quarter, year, allY)) return false;
    }
    if (category !== allCat) {
      if (!activityMatchesCategoryFilter(a, category)) return false;
    }
    return true;
  });
  return out.sort((a, b) => dateMs(b.date) - dateMs(a.date));
}

export function viewScoreForUser(
  u: LeaderboardUser,
  category: string,
  allCat: string,
  quarter: string,
  allQ: string,
  year: string,
  allY: string
): number {
  if (quarter === allQ && category === allCat) {
    if (allY === year) return u.score;
    return sumActivityPointsInYear(u, year, allY);
  }
  if (quarter === allQ && category !== allCat) {
    if (allY === year) return sumActivityPointsForFilter(u, category, allCat);
    return sumActivityPointsForFilterInYear(u, category, allCat, year, allY);
  }
  if (!isActivityQuarter(quarter)) return u.score;
  const q = quarter;
  if (quarter !== allQ && category === allCat) {
    return sumActivityPointsInQuarter(u, q, year, allY);
  }
  return sumInQuarterAndCategory(u, category, allCat, q, year, allY);
}

function latestInCategoryPlusQuarterTie(
  u: LeaderboardUser,
  filter: string,
  _allCat: string,
  q: ActivityQuarter,
  year: string,
  allY: string
): number {
  return getLatestInActivitiesMatching(
    u,
    (a) =>
      activityMatchesCategoryFilter(a, filter) &&
      activityInCalendarQuarter(a, q, year, allY)
  );
}

export function scoreLabelForView(
  filter: string,
  allCategoriesLabel: string,
  userTotalLabel: string,
  quarter: string,
  allQuartersLabel: string,
  year: string,
  allYearsLabel: string
): string {
  const c = categoryFilterLabel(filter, allCategoriesLabel);
  const hasQ = quarter !== allQuartersLabel;
  const hasY = year !== allYearsLabel;

  if (!c && !hasQ) {
    if (hasY) return year;
    return userTotalLabel;
  }
  if (!c && hasQ) {
    if (hasY) return `${quarter} ${year}`.toUpperCase();
    return quarter.toUpperCase();
  }
  if (c && !hasQ) {
    if (hasY) return `${c} · ${year}`;
    return c;
  }
  if (c && hasQ) {
    if (hasY) return `${c} · ${quarter} ${year}`;
    return `${c} · ${quarter}`;
  }
  return userTotalLabel;
}

function sortByTotalScore(a: LeaderboardUser, b: LeaderboardUser): number {
  const s = b.score - a.score;
  if (s !== 0) return s;
  return a.id.localeCompare(b.id);
}

/**
 * Order rows by the active filters. “All Quarters + All Categories” uses latest activity
 * date (optionally within the selected year), then points, then `id`.
 */
export function compareForLeaderboard(
  a: LeaderboardUser,
  b: LeaderboardUser,
  category: string,
  allCategoriesLabel: string,
  quarter: string,
  allQuartersLabel: string,
  year: string,
  allYearsLabel: string
): number {
  const allCat = category === allCategoriesLabel;
  const allQ = quarter === allQuartersLabel;
  const ySel = year !== allYearsLabel;

  const latestForAllQuarters = (u: LeaderboardUser) =>
    ySel
      ? getLatestActivityMsInYear(u, year, allYearsLabel)
      : getLatestActivityMs(u);

  if (allQ && allCat) {
    const t = latestForAllQuarters(b) - latestForAllQuarters(a);
    if (t !== 0) return t;
    if (ySel) {
      const sy = sumActivityPointsInYear(b, year, allYearsLabel) - sumActivityPointsInYear(
        a,
        year,
        allYearsLabel
      );
      if (sy !== 0) return sy;
    } else {
      return sortByTotalScore(a, b);
    }
    return a.id.localeCompare(b.id);
  }

  if (allQ && !allCat) {
    const pa = sumActivityPointsForFilterInYear(
      a,
      category,
      allCategoriesLabel,
      year,
      allYearsLabel
    );
    const pb = sumActivityPointsForFilterInYear(
      b,
      category,
      allCategoriesLabel,
      year,
      allYearsLabel
    );
    if (pb !== pa) return pb - pa;
    const la = latestInCategoryRespectingYear(
      a,
      category,
      allCategoriesLabel,
      year,
      allYearsLabel
    );
    const lb = latestInCategoryRespectingYear(
      b,
      category,
      allCategoriesLabel,
      year,
      allYearsLabel
    );
    if (lb !== la) return lb - la;
    return sortByTotalScore(a, b);
  }

  if (!allQ && allCat) {
    if (!isActivityQuarter(quarter)) return sortByTotalScore(a, b);
    const q = quarter;
    const s =
      sumActivityPointsInQuarter(b, q, year, allYearsLabel) -
      sumActivityPointsInQuarter(a, q, year, allYearsLabel);
    if (s !== 0) return s;
    const t =
      latestDateMsInQuarter(b, q, year, allYearsLabel) -
      latestDateMsInQuarter(a, q, year, allYearsLabel);
    if (t !== 0) return t;
    return a.id.localeCompare(b.id);
  }

  if (!isActivityQuarter(quarter)) return sortByTotalScore(a, b);
  const q2 = quarter;
  const s2 =
    sumInQuarterAndCategory(b, category, allCategoriesLabel, q2, year, allYearsLabel) -
    sumInQuarterAndCategory(a, category, allCategoriesLabel, q2, year, allYearsLabel);
  if (s2 !== 0) return s2;
  const t2 =
    latestInCategoryPlusQuarterTie(b, category, allCategoriesLabel, q2, year, allYearsLabel) -
    latestInCategoryPlusQuarterTie(a, category, allCategoriesLabel, q2, year, allYearsLabel);
  if (t2 !== 0) return t2;
  return a.id.localeCompare(b.id);
}
