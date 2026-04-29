"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Event } from "@/generated/prisma/client";
import EventForm from "@/components/ui/EventForm";

export default function EditEventPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/events/${params.id}`);
        if (!res.ok) {
          setError(res.status === 404 ? "Event not found" : "Failed to load event");
          return;
        }
        setEvent(await res.json());
      } catch {
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  async function handleUpdate(data: Record<string, unknown>) {
    const res = await fetch(`/api/events/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const detail = body?.error || body?.errors?.join(", ") || `Server error (${res.status})`;
      throw new Error(detail);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-red-600">{error ?? "Event not found"}</p>
        <button
          onClick={() => router.push("/admin/events")}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          Back to events
        </button>
      </div>
    );
  }

  function handleDuplicate() {
    router.push(`/admin/events/new?duplicate=${params.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
        <button
          type="button"
          onClick={handleDuplicate}
          className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Duplicate Event
        </button>
      </div>
      <EventForm initialData={event} onSubmit={handleUpdate} />
    </div>
  );
}
