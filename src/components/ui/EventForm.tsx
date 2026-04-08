"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, AlertTriangle, Plus, X, Square } from "lucide-react";
import { EVENT_CATEGORIES, IMPACT_LEVELS } from "@/lib/constants";
import type { Event } from "@/generated/prisma/client";

type PolygonPoint = { lat: string; lng: string };

type EventFormData = {
  title: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
  category: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  impactLevel: string;
  imageUrl: string;
  website: string;
  polygonPoints: PolygonPoint[];
};

const IMPACT_COLORS: Record<string, string> = {
  low: "border-green-400 bg-green-50 text-green-800",
  medium: "border-amber-400 bg-amber-50 text-amber-800",
  high: "border-red-400 bg-red-50 text-red-800",
};

const IMPACT_SELECTED: Record<string, string> = {
  low: "ring-2 ring-green-500 border-green-500 bg-green-100",
  medium: "ring-2 ring-amber-500 border-amber-500 bg-amber-100",
  high: "ring-2 ring-red-500 border-red-500 bg-red-100",
};

function toDateInput(val: string | Date | null | undefined): string {
  if (!val) return "";
  const d = typeof val === "string" ? new Date(val) : val;
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

function parsePolygonPoints(polygon: string | null | undefined): PolygonPoint[] {
  if (!polygon) return [];
  try {
    const parsed = JSON.parse(polygon);
    if (Array.isArray(parsed)) {
      return parsed.map((p: [number, number]) => ({
        lat: String(p[0]),
        lng: String(p[1]),
      }));
    }
  } catch { /* ignore invalid JSON */ }
  return [];
}

function formDataFromEvent(event: Event): EventFormData {
  return {
    title: event.title,
    description: event.description ?? "",
    address: event.address,
    latitude: String(event.latitude),
    longitude: String(event.longitude),
    category: event.category,
    startDate: toDateInput(event.startDate),
    endDate: toDateInput(event.endDate),
    startTime: event.startTime ?? "",
    endTime: event.endTime ?? "",
    impactLevel: event.impactLevel,
    imageUrl: event.imageUrl ?? "",
    website: event.website ?? "",
    polygonPoints: parsePolygonPoints((event as Event & { polygon?: string | null }).polygon),
  };
}

const emptyForm: EventFormData = {
  title: "",
  description: "",
  address: "",
  latitude: "",
  longitude: "",
  category: "community",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  impactLevel: "medium",
  imageUrl: "",
  website: "",
  polygonPoints: [],
};

interface EventFormProps {
  initialData?: Event;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}

export default function EventForm({ initialData, onSubmit }: EventFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<EventFormData>(
    initialData ? formDataFromEvent(initialData) : emptyForm
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof EventFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.address.trim()) errs.address = "Address is required";
    if (!form.latitude || isNaN(Number(form.latitude)))
      errs.latitude = "Valid latitude is required";
    if (!form.longitude || isNaN(Number(form.longitude)))
      errs.longitude = "Valid longitude is required";
    if (!form.startDate) errs.startDate = "Start date is required";
    for (let i = 0; i < form.polygonPoints.length; i++) {
      const pt = form.polygonPoints[i];
      if (pt.lat && isNaN(Number(pt.lat)))
        errs[`polygon_${i}_lat`] = "Invalid latitude";
      if (pt.lng && isNaN(Number(pt.lng)))
        errs[`polygon_${i}_lng`] = "Invalid longitude";
    }
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const validPoints = form.polygonPoints.filter(
        (p) => p.lat && p.lng && !isNaN(Number(p.lat)) && !isNaN(Number(p.lng))
      );
      const polygonValue =
        validPoints.length >= 3
          ? JSON.stringify(validPoints.map((p) => [parseFloat(p.lat), parseFloat(p.lng)]))
          : null;

      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        address: form.address.trim(),
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        category: form.category,
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.endDate
          ? new Date(form.endDate).toISOString()
          : null,
        startTime: form.startTime || null,
        endTime: form.endTime || null,
        impactLevel: form.impactLevel,
        imageUrl: form.imageUrl.trim() || null,
        website: form.website.trim() || null,
        polygon: polygonValue,
      };
      await onSubmit(payload);
      router.push("/admin/events");
    } catch (err) {
      setErrors({
        _form:
          err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors._form && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {errors._form}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className={labelClass}>
          Title *
        </label>
        <input
          id="title"
          type="text"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className={inputClass}
          placeholder="Event title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="Event description"
        />
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className={labelClass}>
          <MapPin className="inline h-4 w-4 mr-1" />
          Address *
        </label>
        <input
          id="address"
          type="text"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          className={inputClass}
          placeholder="123 Main St, Augusta, GA"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address}</p>
        )}
      </div>

      {/* Lat / Lng */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="latitude" className={labelClass}>
            Latitude *
          </label>
          <input
            id="latitude"
            type="number"
            step="any"
            value={form.latitude}
            onChange={(e) => update("latitude", e.target.value)}
            className={inputClass}
            placeholder="33.4735"
          />
          {errors.latitude && (
            <p className="mt-1 text-sm text-red-600">{errors.latitude}</p>
          )}
        </div>
        <div>
          <label htmlFor="longitude" className={labelClass}>
            Longitude *
          </label>
          <input
            id="longitude"
            type="number"
            step="any"
            value={form.longitude}
            onChange={(e) => update("longitude", e.target.value)}
            className={inputClass}
            placeholder="-81.9748"
          />
          {errors.longitude && (
            <p className="mt-1 text-sm text-red-600">{errors.longitude}</p>
          )}
        </div>
      </div>

      {/* Polygon Editor */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
        <div>
          <label className={labelClass}>Impact Area (Polygon)</label>
          <p className="text-xs text-gray-500">
            Define the area affected by this event. Add at least 3 coordinate
            points to create a polygon.
          </p>
        </div>

        {form.polygonPoints.length > 0 && (
          <div className="space-y-2">
            {form.polygonPoints.map((pt, i) => (
              <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2">
                <span className="text-xs font-medium text-gray-500 w-6 text-right">
                  {i + 1}.
                </span>
                <div>
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={pt.lat}
                    onChange={(e) => {
                      const pts = [...form.polygonPoints];
                      pts[i] = { ...pts[i], lat: e.target.value };
                      setForm((prev) => ({ ...prev, polygonPoints: pts }));
                    }}
                    className={inputClass}
                  />
                  {errors[`polygon_${i}_lat`] && (
                    <p className="mt-0.5 text-xs text-red-600">
                      {errors[`polygon_${i}_lat`]}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={pt.lng}
                    onChange={(e) => {
                      const pts = [...form.polygonPoints];
                      pts[i] = { ...pts[i], lng: e.target.value };
                      setForm((prev) => ({ ...prev, polygonPoints: pts }));
                    }}
                    className={inputClass}
                  />
                  {errors[`polygon_${i}_lng`] && (
                    <p className="mt-0.5 text-xs text-red-600">
                      {errors[`polygon_${i}_lng`]}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const pts = form.polygonPoints.filter((_, j) => j !== i);
                    setForm((prev) => ({ ...prev, polygonPoints: pts }));
                  }}
                  className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  aria-label={`Remove point ${i + 1}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {form.polygonPoints.length > 0 && form.polygonPoints.length < 3 && (
          <p className="text-xs text-amber-600">
            At least 3 points are needed to form a polygon.
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                polygonPoints: [...prev.polygonPoints, { lat: "", lng: "" }],
              }))
            }
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-white transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Point
          </button>

          {form.latitude &&
            form.longitude &&
            !isNaN(Number(form.latitude)) &&
            !isNaN(Number(form.longitude)) && (
              <button
                type="button"
                onClick={() => {
                  const lat = parseFloat(form.latitude);
                  const lng = parseFloat(form.longitude);
                  const d = 0.001;
                  setForm((prev) => ({
                    ...prev,
                    polygonPoints: [
                      { lat: String(lat + d), lng: String(lng - d) },
                      { lat: String(lat + d), lng: String(lng + d) },
                      { lat: String(lat - d), lng: String(lng + d) },
                      { lat: String(lat - d), lng: String(lng - d) },
                    ],
                  }));
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-white transition-colors"
              >
                <Square className="h-3.5 w-3.5" />
                Generate Rectangle
              </button>
            )}
        </div>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className={labelClass}>
          Category
        </label>
        <select
          id="category"
          value={form.category}
          onChange={(e) => update("category", e.target.value)}
          className={inputClass}
        >
          {EVENT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className={labelClass}>
            <Calendar className="inline h-4 w-4 mr-1" />
            Start Date *
          </label>
          <input
            id="startDate"
            type="date"
            value={form.startDate}
            onChange={(e) => update("startDate", e.target.value)}
            className={inputClass}
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
          )}
        </div>
        <div>
          <label htmlFor="endDate" className={labelClass}>
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            value={form.endDate}
            onChange={(e) => update("endDate", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className={labelClass}>
            Start Time
          </label>
          <input
            id="startTime"
            type="time"
            value={form.startTime}
            onChange={(e) => update("startTime", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="endTime" className={labelClass}>
            End Time
          </label>
          <input
            id="endTime"
            type="time"
            value={form.endTime}
            onChange={(e) => update("endTime", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Impact Level */}
      <div>
        <label className={labelClass}>Impact Level</label>
        <div className="flex gap-3 mt-1">
          {IMPACT_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => update("impactLevel", level)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-all ${
                form.impactLevel === level
                  ? IMPACT_SELECTED[level]
                  : IMPACT_COLORS[level]
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Image URL */}
      <div>
        <label htmlFor="imageUrl" className={labelClass}>
          Image URL
        </label>
        <input
          id="imageUrl"
          type="url"
          value={form.imageUrl}
          onChange={(e) => update("imageUrl", e.target.value)}
          className={inputClass}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Website */}
      <div>
        <label htmlFor="website" className={labelClass}>
          Website
        </label>
        <input
          id="website"
          type="url"
          value={form.website}
          onChange={(e) => update("website", e.target.value)}
          className={inputClass}
          placeholder="https://example.com"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {submitting
            ? "Saving…"
            : initialData
              ? "Update Event"
              : "Create Event"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/events")}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
