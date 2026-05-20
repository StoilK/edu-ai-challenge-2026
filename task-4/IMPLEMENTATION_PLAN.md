# Task 4 — ATC MCP Server — Implementation Plan

An AI-ready Air Traffic Control MCP server: schedule arrivals/departures, manage runways/gates/crew, handle dependencies and disruptions, expose state via MCP tools and resources.

**Status legend:** `[ ]` pending · `[~]` in progress · `[x]` done

---

## Architecture overview

```
task-4/
├── src/
│   ├── index.ts              # MCP server entry + transport
│   ├── config/               # Env-based airport configuration
│   ├── domain/               # Flight, schedule, airport state types
│   ├── scheduling/           # Scheduler, constraints, bottleneck
│   └── mcp/                  # Tool + resource handlers
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

**Tech stack:** TypeScript, `@modelcontextprotocol/sdk`, stdio transport.

---

## Steps

### Step 1 — Project scaffold `[x]`
- [x] Create `task-4/` with `package.json`, `tsconfig.json`, `.gitignore`
- [x] Add MCP SDK dependency and build/dev scripts
- [x] Minimal `src/index.ts` that starts an MCP server on stdio and registers placeholder capabilities
- [x] Verify `npm install` and `npm run build` succeed

**Learning focus:** What MCP is, how a server connects over stdio, and the Server/Capabilities shape.

---

### Step 2 — Airport configuration from environment `[x]`
- [x] Define config schema: runway count, gate count, ground crew, separation buffers, gate turnaround, dependency buffer, max horizon
- [x] Parse and validate env vars at startup; fail fast with clear errors
- [x] Add `.env.example` documenting every variable
- [x] Unit tests for valid/invalid config

**Learning focus:** Why fail-at-startup matters for ops; separating config from scheduling logic.

---

### Step 3 — Domain model and in-memory airport state `[x]`
- [x] Types: `Flight`, `OperationType`, `Priority`, `FlightStatus`, runway requirements
- [x] `AirportState`: flight queue, schedule slots, resource trackers
- [x] Helpers: add flight, cancel flight, list by status

**Learning focus:** Modeling flights vs scheduled operations; explicit status for unscheduled/cancelled.

---

### Step 4 — Submit flight (MCP tool) `[x]`
- [x] Tool: `submit_flight` with validation (flight number, type, priority, optional deps & runway reqs)
- [x] Reject invalid deps (unknown flight, cycles)
- [x] Resource: flight queue (initial version)

**Learning focus:** MCP tools as actions; resources as read-only snapshots.

---

### Step 5 — Scheduling engine (core) `[x]`
- [x] Topological sort / dependency ordering
- [x] Runway assignment with length requirements and separation buffers
- [x] Gate assignment with turnaround time
- [x] Ground crew capacity constraint
- [x] Priority ordering when resources contested
- [x] Deterministic tie-breaking (stable sort by flight number)
- [x] Mark unschedulable flights with reasons (no runway, horizon, deps, etc.)

**Learning focus:** Constraint satisfaction without physics; buffers as time gaps.

---

### Step 6 — Generate schedule (MCP tool) `[x]`
- [x] Tool: `generate_schedule` — replaces current schedule with fresh computation
- [x] Resource: operation timeline (chronological)
- [x] Resource: runway availability/usage

**Learning focus:** Regenerating vs incremental updates; timeline as derived view.

---

### Step 7 — Airport status (MCP tool) `[x]`
- [x] Tool: `get_airport_status` — counts by state/type, capacity usage, blocked flights with reasons, schedule completion time

**Learning focus:** Structured operational snapshot for AI clients.

---

### Step 8 — Cancel flight (MCP tool) `[x]`
- [x] Tool: `cancel_flight` — mark cancelled, invalidate/re-evaluate dependents
- [x] Update queue resource to reflect cancelled and blocked dependents

**Learning focus:** Graph effects of cancellation on dependency chains.

---

### Step 9 — Bottleneck analysis (MCP tool) `[x]`
- [x] Tool: `analyze_bottleneck` — longest active dependency chain in current schedule
- [x] Include ordered flights, elapsed duration (ops + dependency buffers)

**Learning focus:** Critical path on a DAG of flights.

---

### Step 10 — Documentation and validation scenarios `[x]`
- [x] `README.md` with setup, env vars, tool/resource catalog
- [x] Manual or scripted checks for Scenarios 1–3 (Morning Rush, Heavy Hauler, Connecting Flight)
- [x] Additional edge cases: cancel mid-chain, unknown dependency, automated `npm run validate`

**Learning focus:** Using MCP Inspector or a small client to exercise the server end-to-end.

---

## Validation scenarios (acceptance)

| # | Name | Key checks |
|---|------|------------|
| 1 | Morning Rush | Mixed ops scheduled; no overlaps; priority ordering |
| 2 | Heavy Hauler | Oversized runway req → unscheduled with reason |
| 3 | Connecting Flight | Departure after arrival + dependency buffer |

---

## Changelog

| Date | Step | Notes |
|------|------|-------|
| 2026-05-20 | 1 | Project scaffold created |
| 2026-05-20 | 2 | Env-based airport config, tests, fail-fast startup |
| 2026-05-20 | 3 | Domain types, AirportState, unit tests |
| 2026-05-20 | 4 | submit_flight tool, flight-queue resource, MCP module layout |
| 2026-05-20 | 5–6 | Scheduler engine, generate_schedule, timeline + runway resources |
| 2026-05-20 | 7 | get_airport_status tool + status builder tests |
| 2026-05-20 | 8 | cancel_flight tool + cancel/schedule integration tests |
| 2026-05-20 | 9 | analyze_bottleneck tool + longest-chain tests |
| 2026-05-20 | 10 | README, validation guide, `npm run validate` script |
| 2026-05-20 | — | report.md, ATC_RUNWAY_COUNT, cancel auto-regenerate, fuller validate |
