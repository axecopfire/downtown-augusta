"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import BusinessForm from "@/components/ui/BusinessForm";

export default function NewBusinessPage() {
  const router = useRouter();

  async function handleSubmit(data: Record<string, string>) {
    const res = await fetch("/api/businesses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.errors?.join(", ") ?? body.error ?? "Failed to create business");
    }

    router.push("/admin/businesses");
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
        Add New Business
      </h1>
      <BusinessForm onSubmit={handleSubmit} submitLabel="Create Business" />
    </div>
  );
}
