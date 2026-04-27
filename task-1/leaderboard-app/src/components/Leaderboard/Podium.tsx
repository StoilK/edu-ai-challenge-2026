import type { CSSProperties } from "react";
import { FabricIcon } from "../FabricIcon";
import { avatarImageUrl } from "../../utils/avatarUrl";
import type { ProcessedUser } from "../../types/leaderboard";

const layout: { place: 1 | 2 | 3; colClass: string; avatar: number; badge: number }[] = [
  { place: 2, colClass: "podiumRank2_2943a085", avatar: 88, badge: 36 },
  { place: 1, colClass: "podiumRank1_2943a085", avatar: 120, badge: 40 },
  { place: 3, colClass: "podiumRank3_2943a085", avatar: 88, badge: 36 },
];

type Props = {
  /** Top 3 in score/rank order (1st, 2nd, 3rd) */
  top: ProcessedUser[];
};

export function Podium({ top }: Props) {
  const p = (place: 1 | 2 | 3) => (place === 1 ? top[0] : place === 2 ? top[1] : top[2]) ?? null;

  return (
    <div className="podium_2943a085">
      {layout.map(({ place, colClass, avatar, badge }) => {
        const u = p(place);
        return (
          <div key={place} className={`podiumColumn_2943a085 ${colClass}`.trim()}>
            <div className="podiumUser_2943a085">
              <div className="podiumAvatarContainer_2943a085">
                {u && (
                  <div
                    className="podiumAvatarFrame_2943a085"
                    style={
                      {
                        width: avatar,
                        height: avatar,
                        ["--podium-avatar-px" as string]: `${avatar}px`,
                        ["--podium-badge-px" as string]: `${badge}px`,
                      } as CSSProperties
                    }
                  >
                    <div
                      className="podiumAvatar_2943a085"
                      style={{
                        backgroundImage: `url("${avatarImageUrl(u)}")`,
                      }}
                    />
                    <div
                      className="podiumRankBadge_2943a085"
                      style={{ width: badge, height: badge }}
                      aria-label={`Rank ${place}`}
                    >
                      <span className="podiumRankBadgeText_2943a085">{place}</span>
                    </div>
                  </div>
                )}
              </div>
              <h3 className="podiumName_2943a085">{u ? u.name : "—"}</h3>
              <p className="podiumRole_2943a085">{u ? u.role : "\u00A0"}</p>
              <div className="podiumScore_2943a085">
                {u && (
                  <>
                    <FabricIcon name="FavoriteStarFill" />
                    <span title={u.viewScoreLabel}>{u.viewScore}</span>
                  </>
                )}
              </div>
            </div>
            <div className="podiumBlock_2943a085">
              <div className="podiumBlockTop_2943a085" aria-hidden={!u}>
                {u && <span className="podiumRankNumber_2943a085">{place}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
