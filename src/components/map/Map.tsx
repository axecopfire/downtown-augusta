"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { DOWNTOWN_AUGUSTA_CENTER, DEFAULT_ZOOM } from "@/lib/constants";
import type { Business, Event } from "@/generated/prisma/client";
import { Legend } from "./Legend";

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
  businesses?: Business[];
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
              <div className="min-w-[200px] text-sm">
                <h3 className="font-bold text-base mb-1">{biz.name}</h3>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                  {biz.category}
                </p>
                {biz.address && <p className="mb-1">📍 {biz.address}</p>}
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
