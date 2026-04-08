"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import BusinessForm from "@/components/ui/BusinessForm";
import type { Business } from "@/generated/prisma/client";

export default function EditBusinessPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    router.push("/admin/businesses");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-gray-500">Loading...</p>
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/admin/businesses"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to businesses
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Edit Business
      </h1>
      <BusinessForm
        initialData={business}
        onSubmit={handleSubmit}
        submitLabel="Update Business"
      />
    </div>
  );
}
