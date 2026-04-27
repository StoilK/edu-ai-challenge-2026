import { LeaderboardRow } from "./LeaderboardRow";
import type { ProcessedUser } from "../../types/leaderboard";

type Props = { users: ProcessedUser[] };

export function LeaderboardList({ users }: Props) {
  return (
    <div className="list_2943a085">
      {users.map((u) => (
        <LeaderboardRow key={u.id} user={u} tooltipId={`tt-${u.id}`} />
      ))}
    </div>
  );
}
