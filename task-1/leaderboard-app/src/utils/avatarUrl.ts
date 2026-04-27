import type { LeaderboardUser } from "../types/leaderboard";

/**
 * Placeholder avatars (no real photos) — public DiceBear service.
 */
export function avatarImageUrl(u: Pick<LeaderboardUser, "name" | "avatarSeed">): string {
  const s = encodeURIComponent(u.avatarSeed || u.name);
  return `https://api.dicebear.com/9.x/initials/svg?backgroundType=gradientLinear&fontFamily=Tahoma&seed=${s}`;
}
