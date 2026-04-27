import { useMemo, useState } from "react";
import type { LeaderboardUser, ProcessedUser } from "../types/leaderboard";
import { isActivityQuarter, userHasActivityInQuarter, userHasActivityInYear } from "../utils/activityDates";
import {
  activitiesForListView,
  compareForLeaderboard,
  scoreLabelForView,
  viewScoreForUser,
} from "../utils/leaderboardCategorySort";

export const ALL_YEARS = "All Years" as const;
export const ALL_QUARTERS = "All Quarters" as const;
export const ALL_CATEGORIES = "All Categories" as const;

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"] as const;
const CATEGORY_CHOICES = [
  "Education",
  "Public Speaking",
  "University Partners",
] as const;

export function useLeaderboardView(initialUsers: LeaderboardUser[]) {
  const [year, setYear] = useState<string>(ALL_YEARS);
  const [quarter, setQuarter] = useState<string>(ALL_QUARTERS);
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);
  const [search, setSearch] = useState("");

  const yearOptions = useMemo(() => {
    const fromData = [...new Set(initialUsers.map((u) => u.year))].sort(
      (a, b) => b.localeCompare(a, undefined, { numeric: true })
    );
    return [ALL_YEARS, ...fromData];
  }, [initialUsers]);

  const quarterOptions = useMemo(
    () => [ALL_QUARTERS, ...QUARTERS] as string[],
    []
  );

  const categoryOptions = useMemo(
    () => [ALL_CATEGORIES, ...CATEGORY_CHOICES] as string[],
    []
  );

  const { rows, topThree } = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = initialUsers.filter((u) => {
      if (year !== ALL_YEARS && !userHasActivityInYear(u, year, ALL_YEARS)) {
        return false;
      }
      if (quarter !== ALL_QUARTERS) {
        if (!isActivityQuarter(quarter)) return false;
        if (!userHasActivityInQuarter(u, quarter, year, ALL_YEARS)) return false;
      }
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.year.toLowerCase().includes(q) ||
        u.quarter.toLowerCase().includes(q) ||
        u.category.toLowerCase().includes(q)
      );
    });
    const sorted = [...filtered].sort((a, b) =>
      compareForLeaderboard(
        a,
        b,
        category,
        ALL_CATEGORIES,
        quarter,
        ALL_QUARTERS,
        year,
        ALL_YEARS
      )
    );
    const ranked: ProcessedUser[] = sorted.map((u, i) => ({
      ...u,
      rank: i + 1,
      viewScore: viewScoreForUser(
        u,
        category,
        ALL_CATEGORIES,
        quarter,
        ALL_QUARTERS,
        year,
        ALL_YEARS
      ),
      viewScoreLabel: scoreLabelForView(
        category,
        ALL_CATEGORIES,
        u.totalLabel,
        quarter,
        ALL_QUARTERS,
        year,
        ALL_YEARS
      ),
      viewActivities: activitiesForListView(
        u,
        category,
        ALL_CATEGORIES,
        quarter,
        ALL_QUARTERS,
        year,
        ALL_YEARS
      ),
    }));
    return { rows: ranked, topThree: ranked.slice(0, 3) };
  }, [initialUsers, year, quarter, category, search]);

  return {
    year,
    setYear,
    quarter,
    setQuarter,
    category,
    setCategory,
    search,
    setSearch,
    yearOptions,
    quarterOptions,
    categoryOptions,
    rows,
    topThree,
  };
}
