# Development Report — Gather

A summary of how Gather was built: the tools and techniques used, what worked well, what didn't, and the notable decisions made along the way.

---

## Tools & techniques

### Stack
- **Frontend:** React 19, TanStack Start v1 (file-based routing, SSR-capable), Vite 7, TypeScript (strict).
- **Styling:** Tailwind CSS v4 with semantic design tokens defined in `src/styles.css` (oklch color space), shadcn/ui component primitives.
- **Data layer:** TanStack Query for server-state caching, optimistic updates, and invalidation.
- **Backend:** Lovable Cloud (managed Supabase) — Postgres, Row-Level Security, Auth (email + Google OAuth), Edge runtime on Cloudflare Workers.
- **Deployment target:** Cloudflare Workers via TanStack Start's Worker adapter.

### Techniques
- **RLS-first authorization.** Every table has Row-Level Security enabled. A separate `user_roles` table + `has_role()` `SECURITY DEFINER` function avoids recursive policy evaluation and prevents privilege escalation.
- **Database-driven business rules.** Capacity enforcement, FIFO waitlist promotion, and ticket issuance are implemented as PL/pgSQL triggers — not in app code — so the invariants hold under concurrent RSVPs.
- **Server functions (`createServerFn`)** for typed RPC between client and server, with Zod validation at the boundary.
- **QR tickets** generated client-side from a server-issued opaque token; check-in is idempotent and supports undo.
- **CSV exports** are RFC 4180-quoted with a UTF-8 BOM for clean Excel/Sheets opening.
- **Calendar integration** via generated `.ics` files (no third-party API).

---

## What worked

- **Triggers for capacity & waitlist.** Pushing the rules into the database eliminated a whole class of race-condition bugs. The client just calls "RSVP" and trusts the result.
- **Semantic design tokens.** Defining colors, gradients, and shadows once in `src/styles.css` and consuming them through Tailwind classes kept the UI consistent and made dark-mode trivial.
- **TanStack Query + server functions.** The combination gave us optimistic UI for RSVP/check-in flows with very little boilerplate — invalidate on mutate, done.
- **File-based routing.** Adding `/explore`, `/dashboard`, `/check-in`, `/hosts/:id`, etc. was as simple as creating a file. Type-safe `<Link>` caught broken navigation at compile time.
- **Idempotent check-in with undo.** The "already checked in" state and the undo action made door operations forgiving — this turned out to be the most-loved UX detail in testing.

---

## What did not work (or was painful)

- **Image upload / Storage.** The managed Storage service returned `503 DatabaseSchemaMismatch` because the `storage` schema wasn't provisioned on the backend. We could not fix this from migrations (the schema is reserved). **Workaround:** accept direct image URLs (Imgur, GitHub raw, etc.) for cover and avatar fields. Hotlink-protected hosts (e.g. `wikia.nocookie.net`) silently fail — documented in the README.
- **Ambiguous `host_id` in invite acceptance.** A SQL function joined two tables that both exposed `host_id`, causing `column reference "host_id" is ambiguous` when a checker accepted an invite. Fixed by qualifying every column reference inside the function.
- **Checker visibility tied to `host_org_id`.** The `is_event_checker` policy requires `events.host_org_id` to match the checker's org membership, but legacy events were created with only `host_id` set. Checkers ended up with valid invites but an empty check-in page. Fixed with a backfill migration plus a `BEFORE INSERT/UPDATE` trigger that auto-links new events to their host's org.
- **CHECK constraints with `now()`.** An early attempt to validate `expire_at > now()` via a CHECK constraint failed because CHECK expressions must be immutable. Replaced with a `BEFORE INSERT/UPDATE` validation trigger.
- **Initial host profile was too thin.** First version only exposed name + a generic "Community host on Gather" line. Iterated to add logo, bio, contact email, a public `/hosts/:id` page, a self-edit flow from the user menu, and a link from each event page.
- **Missing cover images looked broken.** Events without an uploaded cover originally rendered a generic gradient that read as a styling bug. Replaced with an explicit "No image" placeholder so the empty state is intentional, not accidental.

---

## Notable decisions

1. **Roles in a dedicated table, never on `profiles`.** Storing roles on the user/profile row is a known privilege-escalation footgun. We use `user_roles` + a `SECURITY DEFINER` `has_role()` function, and all policies call that function.
2. **Self-serve host upgrade.** Becoming a host is one click (no admin approval). Lower friction for a demo-grade product; can be tightened later.
3. **Waitlist auto-promotion at the database level.** When a `confirmed` RSVP is canceled, a trigger promotes the oldest waitlisted person and issues their ticket in the same transaction. The client never coordinates this.
4. **Tickets issued only on `confirmed`.** Waitlisted users get no ticket until promoted — keeps `/my/tickets` honest and prevents "ghost" QR codes.
5. **Public vs. unlisted events** instead of full ACLs. `public` shows in `/explore`; `unlisted` is reachable only by direct link. Simpler model, covers 95% of use cases.
6. **CSV exports as a server function**, not a client-side generator. Keeps the source of truth on the server and lets us add row-level filtering later without changing the client.
7. **No custom auth UI beyond sign-in / sign-up.** Email confirmation is required (auto-confirm intentionally OFF), and Google OAuth is enabled by default.
8. **Documentation split.** `README.md` is a usage guide for the four core flows. This `report.md` is the engineering retrospective. Requirements live elsewhere — neither file duplicates them.
