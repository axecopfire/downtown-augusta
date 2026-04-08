"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Store,
  MapPin,
  Phone,
  Clock,
  Calendar,
  Search,
  X,
} from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { BUSINESS_CATEGORIES } from "@/lib/constants";
import OpenStatusBadge from "@/components/ui/OpenStatusBadge";

interface SerializedBusiness {
  id: string;
  name: string;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  phone: string | null;
  website: string | null;
  hours: string | null;
  imageUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { events: number };
}

interface BusinessesViewProps {
  businesses: SerializedBusiness[];
}

export default function BusinessesView({ businesses }: BusinessesViewProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return businesses.filter((b) => {
      if (activeCategory && b.category !== activeCategory) return false;
      if (
        q &&
        !b.name.toLowerCase().includes(q) &&
        !(b.description ?? "").toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [businesses, search, activeCategory]);

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-800 to-teal-950 px-4 py-16 text-center text-white sm:py-20">
        <div className="mx-auto max-w-3xl">
          <Store className="mx-auto mb-4 h-10 w-10 text-amber-400" />
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Downtown Businesses
          </h1>
          <p className="mt-3 text-base text-teal-100 sm:text-lg">
            Explore restaurants, shops, galleries, and services across
            Augusta&apos;s vibrant downtown district.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-9 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveCategory(null)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                activeCategory === null
                  ? "bg-teal-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {BUSINESS_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setActiveCategory(activeCategory === cat ? null : cat)
                }
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                  activeCategory === cat
                    ? "bg-teal-700 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="flex-1 bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <Store className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="text-lg font-medium">No businesses found</p>
              <p className="mt-1 text-sm">
                Try adjusting your search or category filter.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((biz) => (
                <div
                  key={biz.id}
                  className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition"
                >
                  <Link
                    href={`/businesses/${biz.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-teal-700 transition-colors"
                  >
                    {biz.name}
                  </Link>

                  <span className="ml-2 inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium capitalize text-teal-700">
                    {biz.category}
                  </span>

                  <div className="mt-3 space-y-1.5 text-sm text-gray-600">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      {biz.address}
                    </p>
                    {biz.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        {biz.phone}
                      </p>
                    )}
                    {biz.hours && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span>{biz.hours}</span>
                        <OpenStatusBadge hours={biz.hours} />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {biz._count.events}{" "}
                      {biz._count.events === 1 ? "event" : "events"}
                    </span>

                    <div className="flex items-center gap-2">
                      {biz.facebookUrl && (
                        <a
                          href={biz.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-[#1877F2] transition-colors"
                          title="Facebook"
                        >
                          <FaFacebook className="h-4 w-4" />
                        </a>
                      )}
                      {biz.instagramUrl && (
                        <a
                          href={biz.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-[#E4405F] transition-colors"
                          title="Instagram"
                        >
                          <FaInstagram className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
