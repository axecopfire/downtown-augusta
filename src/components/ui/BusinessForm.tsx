"use client";

import { useState } from "react";
import type { Business } from "@/generated/prisma/client";
import { BUSINESS_CATEGORIES } from "@/lib/constants";

type BusinessFormData = {
  name: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
  category: string;
  phone: string;
  website: string;
  hours: string;
  imageUrl: string;
};

function toFormData(business?: Business | null): BusinessFormData {
  if (!business) {
    return {
      name: "",
      description: "",
      address: "",
      latitude: "",
      longitude: "",
      category: "general",
      phone: "",
      website: "",
      hours: "",
      imageUrl: "",
    };
  }
  return {
    name: business.name,
    description: business.description ?? "",
    address: business.address,
    latitude: String(business.latitude),
    longitude: String(business.longitude),
    category: business.category,
    phone: business.phone ?? "",
    website: business.website ?? "",
    hours: business.hours ?? "",
    imageUrl: business.imageUrl ?? "",
  };
}

type Props = {
  initialData?: Business | null;
  onSubmit: (data: BusinessFormData) => Promise<void>;
  submitLabel?: string;
};

export default function BusinessForm({
  initialData,
  onSubmit,
  submitLabel = "Save Business",
}: Props) {
  const [formData, setFormData] = useState<BusinessFormData>(
    toFormData(initialData)
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof BusinessFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);

    const validationErrors: string[] = [];
    if (!formData.name.trim()) validationErrors.push("Name is required");
    if (!formData.address.trim()) validationErrors.push("Address is required");
    if (!formData.latitude || isNaN(Number(formData.latitude)))
      validationErrors.push("Valid latitude is required");
    if (!formData.longitude || isNaN(Number(formData.longitude)))
      validationErrors.push("Valid longitude is required");

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setErrors([message]);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {errors.length > 0 && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label htmlFor="name" className={labelClass}>
          Name *
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => update("name", e.target.value)}
          className={inputClass}
          placeholder="Business name"
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => update("description", e.target.value)}
          className={inputClass + " min-h-[80px]"}
          placeholder="Brief description of the business"
          rows={3}
        />
      </div>

      <div>
        <label htmlFor="address" className={labelClass}>
          Address *
        </label>
        <input
          id="address"
          type="text"
          value={formData.address}
          onChange={(e) => update("address", e.target.value)}
          className={inputClass}
          placeholder="123 Broad St, Augusta, GA"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="latitude" className={labelClass}>
            Latitude *
          </label>
          <input
            id="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => update("latitude", e.target.value)}
            className={inputClass}
            placeholder="33.4735"
          />
        </div>
        <div>
          <label htmlFor="longitude" className={labelClass}>
            Longitude *
          </label>
          <input
            id="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => update("longitude", e.target.value)}
            className={inputClass}
            placeholder="-81.9748"
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className={labelClass}>
          Category
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => update("category", e.target.value)}
          className={inputClass}
        >
          {BUSINESS_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => update("phone", e.target.value)}
          className={inputClass}
          placeholder="(706) 555-0123"
        />
      </div>

      <div>
        <label htmlFor="website" className={labelClass}>
          Website
        </label>
        <input
          id="website"
          type="url"
          value={formData.website}
          onChange={(e) => update("website", e.target.value)}
          className={inputClass}
          placeholder="https://example.com"
        />
      </div>

      <div>
        <label htmlFor="hours" className={labelClass}>
          Hours
        </label>
        <input
          id="hours"
          type="text"
          value={formData.hours}
          onChange={(e) => update("hours", e.target.value)}
          className={inputClass}
          placeholder="Mon-Fri 9am-5pm"
        />
      </div>

      <div>
        <label htmlFor="imageUrl" className={labelClass}>
          Image URL
        </label>
        <input
          id="imageUrl"
          type="url"
          value={formData.imageUrl}
          onChange={(e) => update("imageUrl", e.target.value)}
          className={inputClass}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
