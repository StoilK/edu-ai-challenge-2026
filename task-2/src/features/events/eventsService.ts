import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toCSV } from "@/lib/csv";

export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type EventInsert = Database["public"]["Tables"]["events"]["Insert"];

export async function listPublicEvents(): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .eq("visibility", "public")
    .order("starts_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getEvent(eventId: string): Promise<EventRow | null> {
  const { data, error } = await supabase.from("events").select("*").eq("id", eventId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function listMyHostedEvents(userId: string): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("host_id", userId)
    .order("starts_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createEvent(input: EventInsert): Promise<EventRow> {
  const { data, error } = await supabase.from("events").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function setEventStatus(
  eventId: string,
  status: "draft" | "published",
): Promise<void> {
  const { error } = await supabase.from("events").update({ status }).eq("id", eventId);
  if (error) throw error;
}

export async function duplicateEvent(eventId: string, userId: string): Promise<EventRow> {
  const src = await getEvent(eventId);
  if (!src) throw new Error("Event not found");
  return createEvent({
    host_id: userId,
    title: `${src.title} (copy)`,
    description: src.description,
    location: src.location,
    starts_at: src.starts_at,
    ends_at: src.ends_at,
    capacity: src.capacity,
    visibility: src.visibility,
    cover_image_url: src.cover_image_url,
    status: "draft",
  });
}

export async function getEventStats(eventId: string) {
  const [confirmed, waitlisted, checkedIn] = await Promise.all([
    supabase
      .from("rsvps")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .in("status", ["confirmed", "going"]),
    supabase
      .from("rsvps")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("status", "waitlisted"),
    supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .not("checked_in_at", "is", null),
  ]);
  return {
    going: confirmed.count ?? 0,
    waitlist: waitlisted.count ?? 0,
    checkedIn: checkedIn.count ?? 0,
  };
}

async function fetchProfiles(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, { display_name: string | null; email: string | null }>();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, email")
    .in("id", userIds);
  if (error) throw error;
  return new Map((data ?? []).map((p) => [p.id, { display_name: p.display_name, email: p.email }]));
}

export async function exportRsvpsCSV(eventId: string): Promise<string> {
  const { data, error } = await supabase
    .from("rsvps")
    .select("user_id, status, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const rsvps = data ?? [];
  const profiles = await fetchProfiles(rsvps.map((r) => r.user_id));
  const rows = rsvps.map((r) => {
    const p = profiles.get(r.user_id);
    return [p?.display_name ?? "", p?.email ?? "", r.status, new Date(r.created_at).toISOString()];
  });
  return toCSV(["Name", "Email", "RSVP status", "RSVP at"], rows);
}

export async function exportAttendanceCSV(eventId: string): Promise<string> {
  const { data, error } = await supabase
    .from("tickets")
    .select("user_id, checked_in_at, rsvp:rsvps!tickets_rsvp_id_fkey(status)")
    .eq("event_id", eventId);
  if (error) throw error;
  const tickets = (data ?? []) as Array<{
    user_id: string;
    checked_in_at: string | null;
    rsvp: { status: string } | null;
  }>;
  const profiles = await fetchProfiles(tickets.map((t) => t.user_id));
  const rows = tickets.map((t) => {
    const p = profiles.get(t.user_id);
    return [
      p?.display_name ?? "",
      p?.email ?? "",
      t.rsvp?.status ?? "",
      t.checked_in_at ? new Date(t.checked_in_at).toISOString() : "",
    ];
  });
  return toCSV(["Name", "Email", "RSVP status", "Check-in time"], rows);
}

