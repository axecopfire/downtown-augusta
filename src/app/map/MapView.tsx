"use client";

import { useState, useMemo } from "react";
import MapWrapper from "@/components/map/MapWrapper";
import ImpactBadge from "@/components/ui/ImpactBadge";
import {
  BUSINESS_CATEGORIES,
  EVENT_CATEGORIES,
  IMPACT_LEVELS,
} from "@/lib/constants";
import type { ImpactLevel } from "@/lib/constants";
import type { Business, Event } from "@/generated/prisma/client";
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Store,
  MapPin,
  Eye,
  EyeOff,
  MessageSquare,
  Search,
  X,
} from "lucide-react";

type DatePreset = "today" | "tomorrow" | "this-week" | "next-week" | "all-upcoming" | "custom";

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "this-week", label: "This Week" },
  { value: "next-week", label: "Next Week" },
  { value: "all-upcoming", label: "All Upcoming" },
  { value: "custom", label: "Custom Range" },
];

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getPresetRange(preset: DatePreset): { start: string; end: string } | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case "today":
      return { start: toDateString(today), end: toDateString(today) };
    case "tomorrow": {
      const tmrw = new Date(today);
      tmrw.setDate(tmrw.getDate() + 1);
      return { start: toDateString(tmrw), end: toDateString(tmrw) };
    }
    case "this-week": {
      const dayOfWeek = today.getDay(); // 0=Sun
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { start: toDateString(monday), end: toDateString(sunday) };
    }
    case "next-week": {
      const dayOfWeek = today.getDay();
      const nextMon = new Date(today);
      nextMon.setDate(today.getDate() + (7 - ((dayOfWeek + 6) % 7)));
      const nextSun = new Date(nextMon);
      nextSun.setDate(nextMon.getDate() + 6);
      return { start: toDateString(nextMon), end: toDateString(nextSun) };
    }
    case "all-upcoming":
      return { start: toDateString(today), end: "9999-12-31" };
    case "custom":
      return null;
  }
}

function extractDate(isoStr: string): string {
  return isoStr.slice(0, 10);
}

type SerializedSocialPost = {
  id: string;
  businessId: string;
  platform: string;
  postId: string | null;
  content: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  postedAt: string;
  fetchedAt: string;
  createdAt: string;
};

type SerializedEventBrief = {
  id: string;
  title: string;
  startDate: string;
  startTime: string | null;
};

type SerializedBusiness = Omit<Business, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
  socialPosts?: SerializedSocialPost[];
  events?: SerializedEventBrief[];
};

type SerializedEvent = Omit<Event, "createdAt" | "updatedAt" | "startDate" | "endDate"> & {
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate: string | null;
};

interface MapViewProps {
  businesses: SerializedBusiness[];
  events: SerializedEvent[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

const SOCIAL_PLATFORMS = ["facebook", "instagram", "twitter"] as const;

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  twitter: "#1DA1F2",
};

export default function MapView({ businesses, events }: MapViewProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tab, setTab] = useState<"events" | "businesses" | "social">("events");

  // Filters
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedImpact, setSelectedImpact] = useState<Set<string>>(new Set());
  const [datePreset, setDatePreset] = useState<DatePreset>("today");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  // Focused item for map highlight
  const [focusedId, setFocusedId] = useState<string | null>(null);

  // Individual visibility toggles
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!evt.title.toLowerCase().includes(term) && 
            !(evt.description ?? "").toLowerCase().includes(term) &&
            !(evt.address ?? "").toLowerCase().includes(term)) {
          return false;
        }
      }
      if (selectedCategories.size > 0 && !selectedCategories.has(evt.category)) return false;
      if (selectedImpact.size > 0 && !selectedImpact.has(evt.impactLevel)) return false;

      // Date filtering
      let rangeStart: string | null = null;
      let rangeEnd: string | null = null;

      if (datePreset === "custom") {
        rangeStart = dateFrom || null;
        rangeEnd = dateTo || null;
      } else {
        const range = getPresetRange(datePreset);
        if (range) {
          rangeStart = range.start;
          rangeEnd = range.end;
        }
      }

      if (rangeStart || rangeEnd) {
        const evtStart = extractDate(evt.startDate);
        const evtEnd = evt.endDate ? extractDate(evt.endDate) : evtStart;
        // Event overlaps range if: evtStart <= rangeEnd AND evtEnd >= rangeStart
        if (rangeEnd && evtStart > rangeEnd) return false;
        if (rangeStart && evtEnd < rangeStart) return false;
      }

      return true;
    });
  }, [events, selectedCategories, selectedImpact, datePreset, dateFrom, dateTo, searchTerm]);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((biz) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!biz.name.toLowerCase().includes(term) && 
            !(biz.description ?? "").toLowerCase().includes(term) &&
            !(biz.address ?? "").toLowerCase().includes(term) &&
            !biz.category.toLowerCase().includes(term)) {
          return false;
        }
      }
      if (selectedCategories.size > 0 && !selectedCategories.has(biz.category)) return false;
      return true;
    });
  }, [businesses, selectedCategories, searchTerm]);

  const allSocialPosts = useMemo(() => {
    const posts: (SerializedSocialPost & { businessName: string })[] = [];
    for (const biz of businesses) {
      if (biz.socialPosts) {
        for (const post of biz.socialPosts) {
          posts.push({ ...post, businessName: biz.name });
        }
      }
    }
    posts.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    return posts;
  }, [businesses]);

  const filteredSocialPosts = useMemo(() => {
    if (selectedPlatforms.size === 0) return allSocialPosts;
    return allSocialPosts.filter((p) => selectedPlatforms.has(p.platform));
  }, [allSocialPosts, selectedPlatforms]);

  const categories = tab === "events" ? EVENT_CATEGORIES : BUSINESS_CATEGORIES;

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function toggleImpact(level: string) {
    setSelectedImpact((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  }

  function togglePlatform(platform: string) {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(platform)) next.delete(platform);
      else next.add(platform);
      return next;
    });
  }

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategories(new Set());
    setSelectedImpact(new Set());
    setDatePreset("today");
    setDateFrom("");
    setDateTo("");
    setSelectedPlatforms(new Set());
  }

  function handleItemClick(id: string) {
    setFocusedId(id);
    // On mobile, close sidebar when clicking an item
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }

  // Convert serialized data back to the format MapWrapper expects
  const mapBusinesses = filteredBusinesses.filter((b) => !hiddenIds.has(b.id)) as unknown as Business[];
  const mapEvents = filteredEvents.filter((e) => !hiddenIds.has(e.id)) as unknown as Event[];

  function toggleVisibility(id: string) {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function showAll(ids: string[]) {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.delete(id);
      return next;
    });
  }

  function hideAll(ids: string[]) {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.add(id);
      return next;
    });
  }

  const hasActiveFilters =
    searchTerm || selectedCategories.size > 0 || selectedImpact.size > 0 || datePreset !== "today" || dateFrom || dateTo || selectedPlatforms.size > 0;

  return (
    <div className="relative flex h-[calc(100vh-56px)] flex-col md:flex-row">
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-3 left-3 z-[1000] flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-lg md:hidden"
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } absolute inset-y-0 left-0 z-[999] w-80 bg-white shadow-xl transition-transform duration-200 md:relative md:translate-x-0 md:shadow-none md:border-r md:border-gray-200 flex flex-col`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-900">Explore</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => {
              setTab("events");
              setSelectedCategories(new Set());
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
              tab === "events"
                ? "border-b-2 border-teal-600 text-teal-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Events ({filteredEvents.length})
          </button>
          <button
            onClick={() => {
              setTab("businesses");
              setSelectedCategories(new Set());
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
              tab === "businesses"
                ? "border-b-2 border-teal-600 text-teal-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Store className="h-4 w-4" />
            Businesses ({filteredBusinesses.length})
          </button>
          <button
            onClick={() => {
              setTab("social");
              setSelectedCategories(new Set());
              setSelectedImpact(new Set());
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
              tab === "social"
                ? "border-b-2 border-teal-600 text-teal-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Social ({filteredSocialPosts.length})
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search businesses & events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-gray-200 px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Filters
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-teal-600 hover:text-teal-800"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Category filter */}
          {tab !== "social" && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-600">Category</p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    selectedCategories.has(cat)
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          )}

          {/* Platform filter (social only) */}
          {tab === "social" && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-600">Platform</p>
              <div className="flex flex-wrap gap-1.5">
                {SOCIAL_PLATFORMS.map((platform) => (
                  <button
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                      selectedPlatforms.has(platform)
                        ? "text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    style={
                      selectedPlatforms.has(platform)
                        ? { backgroundColor: PLATFORM_COLORS[platform] ?? "#6b7280" }
                        : undefined
                    }
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Impact filter (events only) */}
          {tab === "events" && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-600">Impact Level</p>
              <div className="flex gap-1.5">
                {IMPACT_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => toggleImpact(level)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                      selectedImpact.has(level)
                        ? "bg-teal-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date presets (events only) */}
          {tab === "events" && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-600">Date</p>
              <div className="flex flex-wrap gap-1.5">
                {DATE_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setDatePreset(p.value)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      datePreset === p.value
                        ? "bg-teal-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {datePreset === "custom" && (
                <div className="mt-2 flex gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-gray-600">From</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-gray-600">To</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {tab === "events" && (
            <ul className="divide-y divide-gray-100">
              {filteredEvents.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-gray-400">
                  No events match your filters.
                </li>
              )}
              {filteredEvents.length > 0 && (
                <li className="flex items-center justify-end px-4 py-2 border-b border-gray-100">
                  <button
                    onClick={() => {
                      const ids = filteredEvents.map((e) => e.id);
                      const allHidden = ids.every((id) => hiddenIds.has(id));
                      allHidden ? showAll(ids) : hideAll(ids);
                    }}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-teal-600 transition-colors"
                  >
                    {filteredEvents.every((e) => hiddenIds.has(e.id)) ? (
                      <>
                        <Eye className="h-3.5 w-3.5" /> Show All
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" /> Hide All
                      </>
                    )}
                  </button>
                </li>
              )}
              {filteredEvents.map((evt) => {
                const isHidden = hiddenIds.has(evt.id);
                return (
                  <li key={evt.id} className="flex items-stretch">
                    <button
                      onClick={() => handleItemClick(evt.id)}
                      className={`flex-1 px-4 py-3 text-left transition-colors hover:bg-teal-50 ${
                        focusedId === evt.id ? "bg-teal-50 ring-inset ring-2 ring-teal-500" : ""
                      } ${isHidden ? "opacity-40" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                          {evt.title}
                        </h3>
                        <ImpactBadge level={evt.impactLevel as ImpactLevel} />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(evt.startDate)}
                        {evt.startTime && ` · ${evt.startTime}`}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{evt.address}</span>
                      </div>
                      <span className="mt-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 uppercase">
                        {evt.category}
                      </span>
                    </button>
                    <button
                      onClick={() => toggleVisibility(evt.id)}
                      className="flex items-center px-2 text-gray-400 hover:text-teal-600 transition-colors"
                      aria-label={isHidden ? "Show on map" : "Hide from map"}
                    >
                      {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {tab === "businesses" && (
            <ul className="divide-y divide-gray-100">
              {filteredBusinesses.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-gray-400">
                  No businesses match your filters.
                </li>
              )}
              {filteredBusinesses.length > 0 && (
                <li className="flex items-center justify-end px-4 py-2 border-b border-gray-100">
                  <button
                    onClick={() => {
                      const ids = filteredBusinesses.map((b) => b.id);
                      const allHidden = ids.every((id) => hiddenIds.has(id));
                      allHidden ? showAll(ids) : hideAll(ids);
                    }}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-teal-600 transition-colors"
                  >
                    {filteredBusinesses.every((b) => hiddenIds.has(b.id)) ? (
                      <>
                        <Eye className="h-3.5 w-3.5" /> Show All
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" /> Hide All
                      </>
                    )}
                  </button>
                </li>
              )}
              {filteredBusinesses.map((biz) => {
                const isHidden = hiddenIds.has(biz.id);
                return (
                  <li key={biz.id} className="flex items-stretch">
                    <button
                      onClick={() => handleItemClick(biz.id)}
                      className={`flex-1 px-4 py-3 text-left transition-colors hover:bg-teal-50 ${
                        focusedId === biz.id ? "bg-teal-50 ring-inset ring-2 ring-teal-500" : ""
                      } ${isHidden ? "opacity-40" : ""}`}
                    >
                      <h3 className="text-sm font-semibold text-gray-900">{biz.name}</h3>
                      <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{biz.address}</span>
                      </div>
                      <span className="mt-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 uppercase">
                        {biz.category}
                      </span>
                      {biz.phone && (
                        <p className="mt-1 text-xs text-gray-400">📞 {biz.phone}</p>
                      )}
                    </button>
                    <button
                      onClick={() => toggleVisibility(biz.id)}
                      className="flex items-center px-2 text-gray-400 hover:text-teal-600 transition-colors"
                      aria-label={isHidden ? "Show on map" : "Hide from map"}
                    >
                      {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {tab === "social" && (
            <ul className="divide-y divide-gray-100">
              {filteredSocialPosts.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-gray-400">
                  No social posts found.
                </li>
              )}
              {filteredSocialPosts.map((post) => (
                <li key={post.id} className="px-4 py-3 hover:bg-teal-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase text-white"
                      style={{
                        backgroundColor: PLATFORM_COLORS[post.platform] ?? "#6b7280",
                      }}
                    >
                      {post.platform}
                    </span>
                    <span className="text-xs font-bold text-gray-900 truncate">
                      {post.businessName}
                    </span>
                    <span className="ml-auto text-[10px] text-gray-400 whitespace-nowrap">
                      {relativeTime(post.postedAt)}
                    </span>
                  </div>
                  {post.content && (
                    <p className="mt-1.5 text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      {post.content}
                    </p>
                  )}
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt=""
                      className="mt-2 h-20 w-20 rounded-md object-cover"
                    />
                  )}
                  {post.linkUrl && (
                    <a
                      href={post.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-block text-xs font-medium text-teal-600 hover:text-teal-800"
                    >
                      View original →
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Sidebar footer */}
        <div className="border-t border-gray-200 px-4 py-2 text-center text-[11px] text-gray-400">
          {filteredEvents.length} events · {filteredBusinesses.length} businesses · {filteredSocialPosts.length} posts
        </div>
      </aside>

      {/* Desktop sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-3 z-[1000] hidden h-8 w-6 items-center justify-center rounded-r-md bg-white shadow-md md:flex"
        style={{ left: sidebarOpen ? "320px" : "0px" }}
        aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {sidebarOpen ? (
          <ChevronLeft className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {/* Map */}
      <div className="flex-1 relative">
        <MapWrapper businesses={mapBusinesses} events={mapEvents} />
      </div>
    </div>
  );
}
