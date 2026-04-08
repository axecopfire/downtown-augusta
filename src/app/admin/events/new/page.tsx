"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import EventForm from "@/components/ui/EventForm";

function NewEventContent() {
  const searchParams = useSearchParams();
  const businessId = searchParams.get("businessId");

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

  return (
    <>
      {businessId && (
        <div className="mb-4 rounded-md bg-teal-50 border border-teal-200 p-3 text-sm text-teal-800">
          This event will be linked to the business automatically.
        </div>
      )}
      <EventForm onSubmit={handleCreate} />
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
