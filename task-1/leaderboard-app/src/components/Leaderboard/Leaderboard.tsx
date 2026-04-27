import { useMemo } from "react";
import { FilterBar } from "./FilterBar";
import { Podium } from "./Podium";
import { LeaderboardList } from "./LeaderboardList";
import { useLeaderboardView } from "../../hooks/useLeaderboardView";
import { buildMockUsers } from "../../data/mockData";

const COPY = {
  title: "Leaderboard",
  description: "Top performers based on contributions and activity",
} as const;

export function Leaderboard() {
  const data = useMemo(() => buildMockUsers(40), []);
  const {
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
  } = useLeaderboardView(data);

  return (
    <div
      data-sp-feature-tag="LeaderboardWebPart web part (Vention EDU - Leaderboard)"
      className="ms-SPLegacyFabricBlock leaderboard-wp--root"
    >
      <section className="leaderboard_2943a085">
        <header className="header_2943a085">
          <div className="headerContent_2943a085">
            <h2>{COPY.title}</h2>
            <p>{COPY.description}</p>
          </div>
        </header>
        <FilterBar
          year={year}
          onYear={setYear}
          yearOptions={yearOptions}
          quarter={quarter}
          onQuarter={setQuarter}
          quarterOptions={quarterOptions}
          category={category}
          onCategory={setCategory}
          categoryOptions={categoryOptions}
          search={search}
          onSearch={setSearch}
        />
        <Podium top={topThree} />
        <LeaderboardList users={rows} />
      </section>
    </div>
  );
}
