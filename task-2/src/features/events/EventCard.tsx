import { Link } from "@tanstack/react-router";
import { Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

export function EventCard({ event }: { event: EventRow }) {
  const ended = new Date(event.ends_at) < new Date();
  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: event.id }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
    >
      {event.cover_image_url ? (
        <div
          className="aspect-[16/9] w-full bg-muted"
          style={{ backgroundImage: `url(${event.cover_image_url})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
      ) : (
        <div className="flex aspect-[16/9] w-full items-center justify-center bg-muted text-xs uppercase tracking-wide text-muted-foreground">
          No image
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          {ended ? (
            <Badge variant="secondary">Ended</Badge>
          ) : event.status === "draft" ? (
            <Badge variant="outline">Draft</Badge>
          ) : (
            <Badge>Upcoming</Badge>
          )}
          {event.visibility === "unlisted" && <Badge variant="outline">Unlisted</Badge>}
          {event.is_paid && <Badge variant="outline">Paid · soon</Badge>}
        </div>
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug group-hover:text-primary">
          {event.title}
        </h3>
        <div className="mt-auto space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(event.starts_at).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" /> {event.location}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5" /> Capacity {event.capacity}
          </div>
        </div>
      </div>
    </Link>
  );
}
