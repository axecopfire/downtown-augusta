"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Plus,
  LinkIcon,
  Unlink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { Event } from "@/generated/prisma/client";

const IMPACT_BADGE: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
};

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface EventsTabProps {
  businessId: string;
}

export default function EventsTab({ businessId }: EventsTabProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [unlinkedEvents, setUnlinkedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkDropdownOpen, setLinkDropdownOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`/api/businesses/${businessId}/events`);
      if (!res.ok) throw new Error("Failed to load events");
      setEvents(await res.json());
    } catch {
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  const fetchUnlinkedEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      if (!res.ok) return;
      const all: Event[] = await res.json();
      setUnlinkedEvents(all.filter((e) => !e.businessId));
    } catch {
      // silently fail for unlinked events
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchUnlinkedEvents();
  }, [fetchEvents, fetchUnlinkedEvents]);

  async function unlinkEvent(eventId: string) {
    setActionLoading(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: null }),
      });
      if (!res.ok) throw new Error("Failed to unlink event");
      await fetchEvents();
      await fetchUnlinkedEvents();
    } catch {
      setError("Failed to unlink event");
    } finally {
      setActionLoading(null);
    }
  }

  async function linkEvent(eventId: string) {
    setActionLoading(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      });
      if (!res.ok) throw new Error("Failed to link event");
      setLinkDropdownOpen(false);
      await fetchEvents();
      await fetchUnlinkedEvents();
    } catch {
      setError("Failed to link event");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading events…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href={`/admin/events/new?businessId=${businessId}`}
          className="inline-flex items-center gap-1.5 rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Link>
        <div className="relative">
          <button
            onClick={() => setLinkDropdownOpen(!linkDropdownOpen)}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <LinkIcon className="h-4 w-4" />
            Link Existing Event
          </button>
          {linkDropdownOpen && (
            <div className="absolute left-0 top-full mt-1 z-10 w-72 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {unlinkedEvents.length === 0 ? (
                <p className="p-3 text-sm text-gray-500">
                  No unlinked events available
                </p>
              ) : (
                unlinkedEvents.map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => linkEvent(evt.id)}
                    disabled={actionLoading === evt.id}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-teal-50 border-b border-gray-100 last:border-b-0 disabled:opacity-50 flex items-center justify-between"
                  >
                    <span>
                      <span className="font-medium">{evt.title}</span>
                      <span className="text-gray-500 ml-2 text-xs">
                        {formatDate(evt.startDate)}
                      </span>
                    </span>
                    {actionLoading === evt.id && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Event List */}
      {events.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No events yet</p>
          <p className="text-sm mt-1">
            Create one or link an existing event.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow transition-shadow"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/admin/events/${evt.id}/edit`}
                    className="font-medium text-gray-900 hover:text-teal-600 transition-colors"
                  >
                    {evt.title}
                  </Link>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 capitalize">
                    {evt.category}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${IMPACT_BADGE[evt.impactLevel] ?? IMPACT_BADGE.medium}`}
                  >
                    {evt.impactLevel}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(evt.startDate)}
                  {evt.endDate ? ` – ${formatDate(evt.endDate)}` : ""}
                </p>
              </div>
              <button
                onClick={() => unlinkEvent(evt.id)}
                disabled={actionLoading === evt.id}
                className="ml-3 inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
                title="Unlink event from this business"
              >
                {actionLoading === evt.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Unlink className="h-3.5 w-3.5" />
                )}
                Unlink
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
