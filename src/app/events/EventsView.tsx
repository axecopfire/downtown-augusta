"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Calendar, MapPin, Clock, ExternalLink, Search } from "lucide-react";
import ImpactBadge from "@/components/ui/ImpactBadge";
import { EVENT_CATEGORIES } from "@/lib/constants";
import type { ImpactLevel } from "@/lib/constants";
import type { Business, Event } from "@/generated/prisma/client";

type EventWithBusiness = Event & { business: Business | null };

type DatePreset = "today" | "this-week" | "this-weekend" | "all";

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: "all", label: "All Upcoming" },
  { value: "today", label: "Today" },
  { value: "this-week", label: "This Week" },
  { value: "this-weekend", label: "This Weekend" },
];

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDateRange(preset: DatePreset): { start: string; end: string } | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case "today":
      return { start: toDateStr(today), end: toDateStr(today) };
    case "this-week": {
      const dow = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((dow + 6) % 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { start: toDateStr(monday), end: toDateStr(sunday) };
    }
    case "this-weekend": {
      const dow = today.getDay();
      const saturday = new Date(today);
      saturday.setDate(today.getDate() + ((6 - dow + 7) % 7));
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      return { start: toDateStr(saturday), end: toDateStr(sunday) };
    }
    case "all":
      return null;
  }
}

function extractDate(isoStr: string): string {
  return isoStr.slice(0, 10);
}

function formatDate(isoStr: string): string {
  const d = new Date(isoStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateRange(start: string, end: string | null): string {
  const startFmt = formatDate(start);
  if (!end) return startFmt;
  const endDate = extractDate(end);
  const startDate = extractDate(start);
  if (startDate === endDate) return startFmt;
  return `${startFmt} — ${formatDate(end)}`;
}

export default function EventsView({ events }: { events: EventWithBusiness[] }) {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [datePreset, setDatePreset] = useState<DatePreset>("all");

  const hasFilters = selectedCategories.size > 0 || datePreset !== "all";

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function clearFilters() {
    setSelectedCategories(new Set());
    setDatePreset("all");
  }

  const filtered = useMemo(() => {
    let result = events;

    if (selectedCategories.size > 0) {
      result = result.filter((e) => selectedCategories.has(e.category));
    }

    const range = getDateRange(datePreset);
    if (range) {
      result = result.filter((e) => {
        const eStart = extractDate(e.startDate as unknown as string);
        const eEnd = e.endDate ? extractDate(e.endDate as unknown as string) : eStart;
        return eEnd >= range.start && eStart <= range.end;
      });
    }

    return result;
  }, [events, selectedCategories, datePreset]);

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-800 to-teal-950 px-4 py-16 text-center text-white sm:py-20">
        <div className="mx-auto max-w-3xl">
          <Calendar className="mx-auto h-10 w-10 text-amber-400" />
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Upcoming Events
          </h1>
          <p className="mt-3 text-base text-teal-100 sm:text-lg">
            Concerts, festivals, markets, and more — discover what&apos;s happening in downtown
            Augusta.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-gray-200 bg-white px-4 py-5">
        <div className="mx-auto max-w-6xl space-y-4">
          {/* Date presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              When
            </span>
            {DATE_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setDatePreset(p.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  datePreset === p.value
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Category
            </span>
            {EVENT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  selectedCategories.has(cat)
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Clear */}
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-teal-700 underline underline-offset-2 hover:text-teal-900"
            >
              Clear all filters
            </button>
          )}
        </div>
      </section>

      {/* Events grid */}
      <section className="flex-1 bg-gray-50 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-6xl">
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Search className="mx-auto h-12 w-12 text-gray-300" />
              <h2 className="mt-4 text-lg font-semibold text-gray-900">No events found</h2>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters or check back soon for new events.
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 rounded-full bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-gray-500">
                Showing {filtered.length} event{filtered.length !== 1 && "s"}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function EventCard({ event }: { event: EventWithBusiness }) {
  const startStr = event.startDate as unknown as string;
  const endStr = event.endDate as unknown as string | null;

  return (
    <article className="flex flex-col rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md">
      {/* Category & impact badges */}
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium capitalize text-teal-700">
          {event.category}
        </span>
        <ImpactBadge level={event.impactLevel as ImpactLevel} />
      </div>

      {/* Title */}
      <h3 className="mt-3 text-lg font-semibold text-gray-900 line-clamp-2">{event.title}</h3>

      {/* Date & time */}
      <div className="mt-3 space-y-1.5 text-sm text-gray-600">
        <div className="flex items-start gap-2">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <span>{formatDateRange(startStr, endStr)}</span>
        </div>
        {event.startTime && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-gray-400" />
            <span>
              {event.startTime}
              {event.endTime && ` — ${event.endTime}`}
            </span>
          </div>
        )}
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <span>{event.address}</span>
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <p className="mt-3 text-sm leading-relaxed text-gray-500 line-clamp-3">
          {event.description}
        </p>
      )}

      {/* Footer: business + website */}
      <div className="mt-auto flex flex-wrap items-center gap-3 pt-4 text-sm">
        {event.business && (
          <span className="text-gray-500">
            Hosted by{" "}
            <Link
              href={`/admin/businesses/${event.business.id}/edit`}
              className="font-medium text-teal-700 hover:underline"
            >
              {event.business.name}
            </Link>
          </span>
        )}
        {event.website && (
          <a
            href={event.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-teal-700 hover:underline"
          >
            Website
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </article>
  );
}
