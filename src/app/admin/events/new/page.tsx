"use client";

import EventForm from "@/components/ui/EventForm";

export default function NewEventPage() {
  async function handleCreate(data: Record<string, unknown>) {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(
        body?.errors?.join(", ") ?? body?.error ?? "Failed to create event"
      );
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Create New Event
      </h1>
      <EventForm onSubmit={handleCreate} />
    </div>
  );
}
