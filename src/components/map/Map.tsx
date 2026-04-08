"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { DOWNTOWN_AUGUSTA_CENTER, DEFAULT_ZOOM } from "@/lib/constants";
import type { Event } from "@/generated/prisma/client";
import { Legend } from "./Legend";

interface SocialPostData {
  id: string;
  platform: string;
  content: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  postedAt: string;
}

interface BusinessWithPosts {
  id: string;
  name: string;
  category: string;
  address: string | null;
  phone: string | null;
  hours: string | null;
  website: string | null;
  latitude: number;
  longitude: number;
  facebookUrl: string | null;
  instagramUrl: string | null;
  socialPosts?: SocialPostData[];
}

const platformColors: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  twitter: "#1DA1F2",
};

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

// Fix Leaflet's default marker icon paths broken by webpack bundling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function createColoredIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
        <circle cx="12.5" cy="12.5" r="5.5" fill="#fff"/>
      </svg>
    `,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -35],
  });
}

const businessIcon = createColoredIcon("#2563eb"); // blue-600
const impactIcons = {
  low: createColoredIcon("#16a34a"),    // green-600
  medium: createColoredIcon("#ea580c"), // orange-600
  high: createColoredIcon("#dc2626"),   // red-600
} as const;

const impactColors: Record<string, string> = {
  low: "#16a34a",
  medium: "#ea580c",
  high: "#dc2626",
};

function parsePolygon(polygon: string | null): [number, number][] | null {
  if (!polygon) return null;
  try {
    const parsed = JSON.parse(polygon);
    if (Array.isArray(parsed) && parsed.length >= 3) {
      return parsed as [number, number][];
    }
    return null;
  } catch {
    return null;
  }
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(time: string | null): string {
  if (!time) return "";
  return time;
}

interface MapProps {
  businesses?: BusinessWithPosts[];
  events?: Event[];
}

export default function Map({ businesses = [], events = [] }: MapProps) {
  useEffect(() => {
    // Force Leaflet to recalculate container size after mount
    window.dispatchEvent(new Event("resize"));
  }, []);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[DOWNTOWN_AUGUSTA_CENTER.lat, DOWNTOWN_AUGUSTA_CENTER.lng]}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full z-0"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {businesses.map((biz) => (
          <Marker
            key={`biz-${biz.id}`}
            position={[biz.latitude, biz.longitude]}
            icon={businessIcon}
          >
            <Popup>
              <div className="min-w-[200px] max-w-[280px] text-sm">
                <h3 className="font-bold text-base mb-1">{biz.name}</h3>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                  {biz.category}
                </p>
                {biz.address && <p className="mb-1">📍 {biz.address}</p>}
                {biz.latitude && biz.longitude && (
                  <p className="mb-1">
                    🧭{" "}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${biz.latitude},${biz.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-xs"
                    >
                      Get Directions
                    </a>
                  </p>
                )}
                {biz.phone && <p className="mb-1">📞 {biz.phone}</p>}
                {biz.hours && <p className="mb-1">🕐 {biz.hours}</p>}
                {biz.website && (
                  <p>
                    🔗{" "}
                    <a
                      href={biz.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Website
                    </a>
                  </p>
                )}
                {(biz.facebookUrl || biz.instagramUrl) && (
                  <div className="mt-1.5 flex items-center gap-2">
                    {biz.instagramUrl && (
                      <a
                        href={biz.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-pink-600 hover:text-pink-700"
                        title="Instagram"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                        Instagram
                      </a>
                    )}
                    {biz.facebookUrl && (
                      <a
                        href={biz.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                        title="Facebook"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Facebook
                      </a>
                    )}
                  </div>
                )}
                {biz.socialPosts && biz.socialPosts.length > 0 && (
                  <>
                    <hr className="my-2 border-gray-200" />
                    <p className="text-xs font-semibold text-gray-600 mb-1">Recent Posts</p>
                    {biz.socialPosts.slice(0, 2).map((post) => (
                      <div key={post.id} className="flex items-start gap-1.5 mb-1 last:mb-0">
                        <span
                          className="mt-1 inline-block h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: platformColors[post.platform] ?? "#6B7280" }}
                          title={post.platform}
                        />
                        <div className="min-w-0">
                          {post.content && (
                            <p className="text-xs text-gray-700 leading-tight">
                              {truncate(post.content, 60)}
                            </p>
                          )}
                          <p className="text-[10px] text-gray-400">{relativeTime(post.postedAt)}</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {events.map((evt) => {
          const icon =
            impactIcons[evt.impactLevel as keyof typeof impactIcons] ??
            impactIcons.low;
          const color = impactColors[evt.impactLevel] ?? impactColors.low;
          const positions = parsePolygon(evt.polygon);

          const popupContent = (
            <div className="min-w-[200px] text-sm">
              <h3 className="font-bold text-base mb-1">{evt.title}</h3>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                {evt.category} · Impact: {evt.impactLevel}
              </p>
              {evt.description && (
                <p className="mb-1 text-gray-700">{evt.description}</p>
              )}
              <p className="mb-1">
                📅 {formatDate(evt.startDate)}
                {evt.endDate &&
                  evt.endDate !== evt.startDate &&
                  ` – ${formatDate(evt.endDate)}`}
              </p>
              {(evt.startTime || evt.endTime) && (
                <p className="mb-1">
                  🕐 {formatTime(evt.startTime)}
                  {evt.endTime && ` – ${formatTime(evt.endTime)}`}
                </p>
              )}
              {evt.address && <p className="mb-1">📍 {evt.address}</p>}
              {evt.website && (
                <p>
                  🔗{" "}
                  <a
                    href={evt.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Website
                  </a>
                </p>
              )}
            </div>
          );

          return (
            <span key={`evt-${evt.id}`}>
              {positions && (
                <Polygon
                  positions={positions}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.2,
                    weight: 2,
                  }}
                >
                  <Popup>{popupContent}</Popup>
                </Polygon>
              )}
              <Marker
                position={[evt.latitude, evt.longitude]}
                icon={icon}
                zIndexOffset={1000}
              >
                <Popup>{popupContent}</Popup>
              </Marker>
            </span>
          );
        })}
      </MapContainer>
      <Legend />
    </div>
  );
}
