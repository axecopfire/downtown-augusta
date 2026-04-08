import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  Globe,
  Navigation,
  Calendar,
} from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import type { Metadata } from "next";
import BusinessDetailMap from "./BusinessDetailMap";
import OpenStatusBadge from "@/components/ui/OpenStatusBadge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const business = await prisma.business.findUnique({ where: { id } });
  if (!business) return { title: "Business Not Found" };
  return {
    title: `${business.name} — Downtown Augusta`,
    description:
      business.description ||
      `Find ${business.name} in downtown Augusta, GA`,
  };
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const impactBadgeColors: Record<string, string> = {
  low: "bg-green-50 text-green-700",
  medium: "bg-orange-50 text-orange-700",
  high: "bg-red-50 text-red-700",
};

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      events: { orderBy: { startDate: "asc" } },
      socialPosts: { orderBy: { postedAt: "desc" }, take: 5 },
    },
  });

  if (!business) notFound();

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`;

  return (
    <div className="flex flex-1 flex-col">
      {/* Back link */}
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/businesses"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Businesses
          </Link>
        </div>
      </div>

      {/* Header */}
      <section className="bg-gradient-to-br from-teal-800 to-teal-950 px-4 py-12 text-white">
        <div className="mx-auto max-w-5xl">
          <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium capitalize backdrop-blur">
            {business.category}
          </span>
          <div className="mt-3 flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {business.name}
            </h1>
            <OpenStatusBadge hours={business.hours} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-teal-100">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {business.address}
            </span>
            {business.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                {business.phone}
              </span>
            )}
            {business.hours && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {business.hours}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-teal-800 shadow hover:bg-gray-50 transition"
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-amber-600 transition"
            >
              <Navigation className="h-4 w-4" />
              Get Directions
            </a>
            {business.facebookUrl && (
              <a
                href={business.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/30 transition"
              >
                <FaFacebook className="h-4 w-4" />
                Facebook
              </a>
            )}
            {business.instagramUrl && (
              <a
                href={business.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/30 transition"
              >
                <FaInstagram className="h-4 w-4" />
                Instagram
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="flex-1 bg-gray-50 px-4 py-8">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-8 lg:col-span-2">
            {/* Description */}
            {business.description && (
              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">About</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {business.description}
                </p>
              </div>
            )}

            {/* Upcoming Events */}
            {business.events.length > 0 && (
              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Calendar className="h-5 w-5 text-teal-700" />
                  Events ({business.events.length})
                </h2>
                <div className="mt-4 space-y-3">
                  {business.events.map((evt) => (
                    <div
                      key={evt.id}
                      className="flex items-start gap-4 rounded-lg border border-gray-100 p-4"
                    >
                      <div className="shrink-0 text-center">
                        <p className="text-xs font-medium uppercase text-gray-500">
                          {new Date(evt.startDate).toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </p>
                        <p className="text-2xl font-bold text-teal-700">
                          {new Date(evt.startDate).getDate()}
                        </p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900">{evt.title}</p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {formatDate(evt.startDate)}
                          {evt.startTime && ` · ${evt.startTime}`}
                          {evt.endTime && ` – ${evt.endTime}`}
                        </p>
                        {evt.description && (
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {evt.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                          impactBadgeColors[evt.impactLevel] ??
                          impactBadgeColors.low
                        }`}
                      >
                        {evt.impactLevel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Posts */}
            {business.socialPosts.length > 0 && (
              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Social Posts
                </h2>
                <div className="mt-4 space-y-3">
                  {business.socialPosts.map((post) => (
                    <div
                      key={post.id}
                      className="rounded-lg border border-gray-100 p-4"
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-700">
                          {post.platform}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(post.postedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {post.content && (
                        <p className="mt-2 text-sm text-gray-600">
                          {post.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — Map */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
              <div className="h-64 w-full">
                <BusinessDetailMap
                  lat={business.latitude}
                  lng={business.longitude}
                  name={business.name}
                />
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600">{business.address}</p>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-800 transition-colors"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
