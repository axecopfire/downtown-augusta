"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import EventForm from "@/components/ui/EventForm";
import type { Event } from "@/generated/prisma/client";

function NewEventContent() {
  const searchParams = useSearchParams();
  const businessId = searchParams.get("businessId");
  const duplicateId = searchParams.get("duplicate");

  const [sourceEvent, setSourceEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(!!duplicateId);

  useEffect(() => {
    if (!duplicateId) return;
    async function loadSource() {
      try {
        const res = await fetch(`/api/events/${duplicateId}`);
        if (res.ok) {
          const event = await res.json();
          // Clear dates so the admin enters new ones for the duplicate
          setSourceEvent({
            ...event,
            id: undefined,
            title: `Copy of ${event.title}`,
            startDate: null,
            endDate: null,
            startTime: null,
            endTime: null,
            createdAt: undefined,
            updatedAt: undefined,
          });
        }
      } catch {
        // Proceed without pre-fill if fetch fails
      } finally {
        setLoading(false);
      }
    }
    loadSource();
  }, [duplicateId]);

  async function handleCreate(data: Record<string, unknown>) {
    const payload = { ...data };
    if (businessId) {
      payload.businessId = businessId;
    }

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(
        body?.errors?.join(", ") ?? body?.error ?? "Failed to create event"
      );
    }
  }

  if (loading) {
    return <p className="text-gray-500">Loading event data…</p>;
  }

  return (
    <>
      {businessId && (
        <div className="mb-4 rounded-md bg-teal-50 border border-teal-200 p-3 text-sm text-teal-800">
          This event will be linked to the business automatically.
        </div>
      )}
      {duplicateId && (
        <div className="mb-4 rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
          Duplicating event — venue, description, and polygon copied. Please set new dates.
        </div>
      )}
      <EventForm
        initialData={sourceEvent ?? undefined}
        onSubmit={handleCreate}
      />
    </>
  );
}

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Create New Event
      </h1>
      <Suspense fallback={<p className="text-gray-500">Loading…</p>}>
        <NewEventContent />
      </Suspense>
    </div>
  );
}
