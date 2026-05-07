import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { useAuth } from "@/features/auth/AuthProvider";
import { createEvent } from "@/features/events/eventsService";
import { getBrowserTimeZone, listTimeZones, localInputToISO } from "@/lib/datetime";

export const Route = createFileRoute("/events/new")({
  component: CreateEventPage,
});

function CreateEventPage() {
  const { user, isHost, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const tzList = listTimeZones();
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    starts_at: "",
    ends_at: "",
    time_zone: getBrowserTimeZone(),
    capacity: 50,
    visibility: "public" as "public" | "unlisted",
    status: "draft" as "draft" | "published",
  });

  if (loading) return <LoadingState />;
  if (!user || !isHost)
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        Only hosts can create events.
      </div>
    );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const event = await createEvent({
        host_id: user.id,
        title: form.title,
        description: form.description,
        location: form.location,
        starts_at: localInputToISO(form.starts_at, form.time_zone),
        ends_at: localInputToISO(form.ends_at, form.time_zone),
        time_zone: form.time_zone,
        capacity: form.capacity,
        visibility: form.visibility,
        status: form.status,
      });
      toast.success("Event created");
      navigate({ to: "/events/$eventId", params: { eventId: event.id } });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <PageHeader title="Create event" description="Publish a free community event." />
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="starts_at">Starts at</Label>
            <Input
              id="starts_at"
              type="datetime-local"
              required
              value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="ends_at">Ends at</Label>
            <Input
              id="ends_at"
              type="datetime-local"
              required
              value={form.ends_at}
              onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="time_zone">Time zone</Label>
          <Select
            value={form.time_zone}
            onValueChange={(v) => setForm({ ...form, time_zone: v })}
          >
            <SelectTrigger id="time_zone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {tzList.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-muted-foreground">
            Times above are entered in this zone. Attendees see times in their own zone.
          </p>
        </div>
        <div>
          <Label>Pricing</Label>
          <TooltipProvider>
            <RadioGroup value="free" className="mt-2 grid grid-cols-2 gap-3">
              <Label
                htmlFor="price-free"
                className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background p-3 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
              >
                <RadioGroupItem id="price-free" value="free" />
                <span className="font-medium">Free</span>
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label
                    htmlFor="price-paid"
                    className="flex cursor-not-allowed items-center gap-2 rounded-md border border-border bg-muted/40 p-3 opacity-60"
                  >
                    <RadioGroupItem id="price-paid" value="paid" disabled />
                    <span className="font-medium">Paid</span>
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  Paid tickets are coming soon. For now, all events on Gather are free.
                </TooltipContent>
              </Tooltip>
            </RadioGroup>
          </TooltipProvider>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Visibility</Label>
            <Select
              value={form.visibility}
              onValueChange={(v) => setForm({ ...form, visibility: v as typeof form.visibility })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="submit" disabled={submitting} size="lg">
          {submitting ? "Saving…" : "Create event"}
        </Button>
      </form>
    </div>
  );
}
