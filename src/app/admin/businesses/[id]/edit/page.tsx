"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Store,
  Calendar,
  Rss,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import BusinessForm from "@/components/ui/BusinessForm";
import EventsTab from "./EventsTab";
import SocialFeedTab from "./SocialFeedTab";
import type { Business } from "@/generated/prisma/client";

type Tab = "info" | "events" | "social";

type BusinessWithCounts = Business & {
  _count?: { events?: number; socialPosts?: number };
};

export default function EditBusinessPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<BusinessWithCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("info");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/businesses/${id}`);
        if (!res.ok) throw new Error("Business not found");
        setBusiness(await res.json());
      } catch {
        setError("Failed to load business");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmit(data: Record<string, string>) {
    const res = await fetch(`/api/businesses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.errors?.join(", ") ?? body.error ?? "Failed to update business");
    }

    // Refresh business data to pick up changes
    const updated = await fetch(`/api/businesses/${id}`);
    if (updated.ok) setBusiness(await updated.json());
    router.refresh();
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-center py-12 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading business…
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-red-600">{error ?? "Business not found"}</p>
        <Link
          href="/admin/businesses"
          className="text-sm text-blue-600 hover:underline mt-2 inline-block"
        >
          Back to businesses
        </Link>
      </div>
    );
  }

  const eventCount = business._count?.events ?? 0;
  const postCount = business._count?.socialPosts ?? 0;

  const tabs: { key: Tab; label: string; icon: typeof Store; count?: number }[] = [
    { key: "info", label: "Info", icon: Store },
    { key: "events", label: "Events", icon: Calendar, count: eventCount },
    { key: "social", label: "Social Feed", icon: Rss, count: postCount },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/admin/businesses"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to businesses
      </Link>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Store className="h-6 w-6 text-teal-600" />
        {business.name}
      </h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 border-b-2 pb-3 pt-1 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-teal-500 text-teal-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      isActive
                        ? "bg-teal-100 text-teal-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "info" && (
          <BusinessForm
            initialData={business}
            onSubmit={handleSubmit}
            submitLabel="Update Business"
          />
        )}
        {activeTab === "events" && <EventsTab businessId={id} />}
        {activeTab === "social" && (
          <SocialFeedTab
            businessId={id}
            facebookUrl={business.facebookUrl}
            instagramUrl={business.instagramUrl}
          />
        )}
      </div>
    </div>
  );
}
