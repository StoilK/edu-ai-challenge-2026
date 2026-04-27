# Vention EDU — Leaderboard (React + TypeScript)

Dynamic version of the SharePoint **LeaderboardWebPart** template: top-three podium, year / quarter / category filters, search, and a scrollable list. Class names follow the static export (e.g. `leaderboard_2943a085`).

## 1. Component breakdown

| Component | Role |
| --- | --- |
| `Leaderboard` | Root: web-part wrapper, header, composes `FilterBar`, `Podium`, and `LeaderboardList`. |
| `FilterBar` | Three `DropdownField` + search (`Search employee...`). |
| `DropdownField` | `ms-Dropdown` shell with native `<select>` and chevrons. |
| `Podium` | **2nd–1st–3rd** column order, avatars, names, roles, star scores, rank on blocks. |
| `LeaderboardList` | `list_2943a085` container. |
| `LeaderboardRow` | Card row: rank, avatar, name, role, **aggregated category stats** (by `CategoryStatGroup`), total score, **expand** → “Recent activity” table (points sum to user total). |
| `FabricIcon` | `data-icon-name` + SVGs (Search, chevrons, star, MDL2 + Emoji2 for some categories). |
| `useLeaderboardView` | `All` filters, search, sort by **score** descending, `rank` 1…*n*. |
| `buildMockUsers` | Mock data; `activities` drive stats and the details table. |

Styles: `src/styles/sharepoint-themplate.css` (see `../reference/themplate_css.txt`). Web part: `src/leaderboard.css`.

## 2. Data model (mock)

`src/types/leaderboard.ts` · `src/data/mockData.ts`

- `LeaderboardUser`: `year`, `quarter`, `category` (for filters), `score`, `activities[]`, `categoryStats[]` (derived), `avatarSeed`, `totalLabel`, etc.
- **`ActivityItem`:** `category`, `categoryIcon`, **`statGroup`** (`Education` \| `Presentation` \| `Engagement`). Row stats merge by `statGroup` (Engagement = single emoji bucket for Lightbulb / People / Code visuals).
- **`ProcessedUser`:** `rank` after filter/search in the current result set.

## 3. Behavior (filters, search, sort)

- **Filters** — all years / quarter / “All Categories”, or a specific value where mock data has matches.
- **Search** — substrings in name, role, year, quarter, category.
- **Sort** — by **score** descending; podium = top 3 in the current filtered + searched set.

## 4. Run locally

From the repo root:

```bash
cd task-1/leaderboard-app
npm install
npm run dev
```

**Production build & preview**

```bash
npm run build
npm run preview
```

**Optional theme scripts:** `npm run build:theme`, `npm run build:fluent9` (expects paste input; committed `fluent9-tokens.css` is enough for a normal run).

## 5. GitHub Pages

1. `base` in `vite.config.ts` reads `VITE_BASE` (default `/`). For `https://<user>.github.io/<repo>/`, set `VITE_BASE=/<repo>/` before `npm run build`.
2. Deploy `dist/`. A `404.html` copy of `index.html` is created at build time for SPA routes.

## Reference

Static HTML / page CSS (not bundled with the part): `task-1/reference/themplate.txt`, `task-1/reference/themplate_css.txt`.
