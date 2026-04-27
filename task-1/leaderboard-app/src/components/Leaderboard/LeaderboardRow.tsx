import { useState } from "react";
import { FabricIcon } from "../FabricIcon";
import { avatarImageUrl } from "../../utils/avatarUrl";
import { categoryStatGroupIcon, type ProcessedUser } from "../../types/leaderboard";

type Props = { user: ProcessedUser; tooltipId: string };

export function LeaderboardRow({ user, tooltipId }: Props) {
  const [expanded, setExpanded] = useState(false);
  const regionId = `row-activity-${user.id}`;

  return (
    <div className="userRowContainer_2943a085">
      <div className="row_2943a085">
        <div className="rowMain_2943a085">
          <div className="rowLeft_2943a085">
            <span className="rank_2943a085">{user.rank}</span>
            <div
              className="avatar_2943a085"
              style={{ backgroundImage: `url("${avatarImageUrl(user)}")` }}
            />
            <div className="info_2943a085">
              <h3 className="name_2943a085">{user.name}</h3>
              <span className="role_2943a085">{user.role}</span>
            </div>
          </div>
          <div className="rowRight_2943a085">
            <div className="categoryStats_2943a085">
              <div className="ms-TooltipHost root-207 categoryStatsHost_2943a085" role="none">
                {user.categoryStats.map((c) => (
                  <div
                    key={c.statGroup}
                    className="categoryStat_2943a085"
                    title={c.category}
                  >
                    <FabricIcon name={categoryStatGroupIcon(c.statGroup)} isCategory />
                    <span className="categoryStatCount_2943a085">{c.count}</span>
                  </div>
                ))}
                <div
                  hidden
                  id={tooltipId}
                  style={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    margin: -1,
                    padding: 0,
                    border: 0,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                />
              </div>
            </div>
            <span className="rowRightSeparator_2943a085" aria-hidden="true" />
            <div className="totalSection_2943a085">
              <span className="totalLabel_2943a085">{user.viewScoreLabel}</span>
              <div className="score_2943a085">
                <FabricIcon name="FavoriteStarFill" />
                <span className="totalScore_2943a085">{user.viewScore}</span>
              </div>
            </div>
            <button
              type="button"
              className="expandButton_2943a085"
              aria-label={expanded ? "Collapse recent activity" : "Expand recent activity"}
              aria-expanded={expanded}
              aria-controls={regionId}
              onClick={() => setExpanded((e) => !e)}
            >
              <FabricIcon name={expanded ? "ChevronUp" : "ChevronDown"} />
            </button>
          </div>
        </div>
      </div>
      {expanded && (
        <div
          className="details_2943a085"
          id={regionId}
          role="region"
          aria-label="Recent activity"
        >
          <h2 className="detailsTitle_2943a085">Recent activity</h2>
          {user.viewActivities.length === 0 ? (
            <p className="activityEmpty_2943a085">No recent activity.</p>
          ) : (
            <div className="activityTableWrap_2943a085">
              <table className="activityTable_2943a085">
                <thead>
                  <tr>
                    <th scope="col">Activity</th>
                    <th scope="col">Category</th>
                    <th scope="col">Date</th>
                    <th scope="col" className="activityTableHeadPoints_2943a085">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {user.viewActivities.map((a, idx) => (
                    <tr key={`${a.title}-${a.date}-${idx}`}>
                      <td className="activityCellTitle_2943a085">{a.title}</td>
                      <td>
                        <span className="activityCategoryPill_2943a085">
                          <FabricIcon
                            name={a.categoryIcon}
                            isCategory
                            className="activityCategoryPillIcon_2943a085"
                          />
                          {a.category}
                        </span>
                      </td>
                      <td className="activityCellDate_2943a085">{a.date}</td>
                      <td className="activityCellPoints_2943a085">
                        {a.points > 0 ? `+${a.points}` : String(a.points)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
