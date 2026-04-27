import type { ActivityItem, LeaderboardUser } from "../types/leaderboard";

const MONTH: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

/** e.g. `30-Nov-2025` -> Date (local) */
export function parseActivityDateString(dateStr: string): Date | null {
  const parts = dateStr.trim().split("-");
  if (parts.length !== 3) return null;
  const d = parseInt(parts[0], 10);
  const mon = MONTH[parts[1]];
  const y = parseInt(parts[2], 10);
  if (!Number.isFinite(d) || mon == null || !Number.isFinite(y)) return null;
  return new Date(y, mon, d);
}

export function dateMs(d: string): number {
  const t = parseActivityDateString(d);
  return t ? t.getTime() : 0;
}

/** Calendar Q1=Jan–Mar, Q2=Apr–Jun, Q3=Jul–Sep, Q4=Oct–Dec */
function calendarQuarterOfDate(dt: Date): 1 | 2 | 3 | 4 {
  const m = dt.getMonth();
  if (m < 3) return 1;
  if (m < 6) return 2;
  if (m < 9) return 3;
  return 4;
}

export type ActivityQuarter = "Q1" | "Q2" | "Q3" | "Q4";

export function isActivityQuarter(
  s: string
): s is ActivityQuarter {
  return s === "Q1" || s === "Q2" || s === "Q3" || s === "Q4";
}

type Q = ActivityQuarter;

function activityInYear(a: ActivityItem, year: string, allYears: string): boolean {
  if (allYears === year) return true;
  const t = parseActivityDateString(a.date);
  if (!t) return false;
  return String(t.getFullYear()) === year;
}

export function activityInCalendarQuarter(
  a: ActivityItem,
  quarter: Q,
  yearFilter: string,
  allYears: string
): boolean {
  if (!activityInYear(a, yearFilter, allYears)) return false;
  const t = parseActivityDateString(a.date);
  if (!t) return false;
  const cq = calendarQuarterOfDate(t);
  return cq === (quarter === "Q1" ? 1 : quarter === "Q2" ? 2 : quarter === "Q3" ? 3 : 4);
}

export function getLatestActivityMs(u: LeaderboardUser): number {
  let m = 0;
  for (const a of u.activities) {
    const t = parseActivityDateString(a.date);
    if (t) m = Math.max(m, t.getTime());
  }
  return m;
}

export function getLatestInActivitiesMatching(
  u: LeaderboardUser,
  match: (a: ActivityItem) => boolean
): number {
  let m = 0;
  for (const a of u.activities) {
    if (!match(a)) continue;
    const t = parseActivityDateString(a.date);
    if (t) m = Math.max(m, t.getTime());
  }
  return m;
}

/** For ordering when a year is selected: latest activity in that year (ms). */
export function getLatestActivityMsInYear(
  u: LeaderboardUser,
  year: string,
  allYears: string
): number {
  if (allYears === year) return getLatestActivityMs(u);
  return getLatestInActivitiesMatching(u, (a) => {
    const t = parseActivityDateString(a.date);
    return t !== null && String(t.getFullYear()) === year;
  });
}

export function userHasActivityInYear(
  u: LeaderboardUser,
  year: string,
  allYears: string
): boolean {
  if (allYears === year) return true;
  return u.activities.some((a) => {
    const t = parseActivityDateString(a.date);
    return t && String(t.getFullYear()) === year;
  });
}

export function sumActivityPointsInYear(
  u: LeaderboardUser,
  year: string,
  allYears: string
): number {
  if (allYears === year) return u.score;
  return u.activities
    .filter((a) => {
      const t = parseActivityDateString(a.date);
      return t && String(t.getFullYear()) === year;
    })
    .reduce((s, a) => s + a.points, 0);
}

export function userHasActivityInQuarter(
  u: LeaderboardUser,
  quarter: Q,
  yearFilter: string,
  allYears: string
): boolean {
  return u.activities.some((a) => activityInCalendarQuarter(a, quarter, yearFilter, allYears));
}

export function sumActivityPointsInQuarter(
  u: LeaderboardUser,
  quarter: Q,
  yearFilter: string,
  allYears: string
): number {
  return u.activities
    .filter((a) => activityInCalendarQuarter(a, quarter, yearFilter, allYears))
    .reduce((s, a) => s + a.points, 0);
}

export function latestDateMsInQuarter(
  u: LeaderboardUser,
  quarter: Q,
  yearFilter: string,
  allYears: string
): number {
  let m = 0;
  for (const a of u.activities) {
    if (!activityInCalendarQuarter(a, quarter, yearFilter, allYears)) continue;
    const t = parseActivityDateString(a.date);
    if (t) m = Math.max(m, t.getTime());
  }
  return m;
}
