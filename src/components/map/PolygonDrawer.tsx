"use client";

import { useCallback, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  CircleMarker,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { DOWNTOWN_AUGUSTA_CENTER, DEFAULT_ZOOM } from "@/lib/constants";

// Fix Leaflet default marker icons (same pattern as Map.tsx)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface PolygonDrawerProps {
  points: Array<{ lat: number; lng: number }>;
  onPointsChange: (points: Array<{ lat: number; lng: number }>) => void;
  center?: { lat: number; lng: number };
}

/** Inner component that captures map click events. */
function MapClickHandler({
  onClick,
  skipRef,
}: {
  onClick: (lat: number, lng: number) => void;
  skipRef: React.RefObject<boolean>;
}) {
  useMapEvents({
    click(e) {
      // Skip if the click originated from a marker interaction
      if (skipRef.current) {
        skipRef.current = false;
        return;
      }
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function PolygonDrawer({
  points,
  onPointsChange,
  center,
}: PolygonDrawerProps) {
  // Flag to suppress the next map click when a vertex marker is clicked
  const skipNextClick = useRef(false);

  const mapCenter = center ?? DOWNTOWN_AUGUSTA_CENTER;

  const addPoint = useCallback(
    (lat: number, lng: number) => {
      onPointsChange([...points, { lat, lng }]);
    },
    [points, onPointsChange],
  );

  const removePoint = useCallback(
    (index: number) => {
      onPointsChange(points.filter((_, i) => i !== index));
    },
    [points, onPointsChange],
  );

  const undoLast = useCallback(() => {
    if (points.length > 0) {
      onPointsChange(points.slice(0, -1));
    }
  }, [points, onPointsChange]);

  const clearAll = useCallback(() => {
    onPointsChange([]);
  }, [onPointsChange]);

  const generateRectangle = useCallback(() => {
    const lat = mapCenter.lat;
    const lng = mapCenter.lng;
    const d = 0.001;
    onPointsChange([
      { lat: lat + d, lng: lng - d },
      { lat: lat + d, lng: lng + d },
      { lat: lat - d, lng: lng + d },
      { lat: lat - d, lng: lng - d },
    ]);
  }, [mapCenter, onPointsChange]);

  const positions = points.map(
    (p) => [p.lat, p.lng] as [number, number],
  );

  return (
    <div className="space-y-2">
      {/* Map */}
      <div className="relative rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={DEFAULT_ZOOM}
          className="h-[350px] w-full z-0"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onClick={addPoint} skipRef={skipNextClick} />

          {/* Draw polygon when we have 3+ points */}
          {positions.length >= 3 && (
            <Polygon
              positions={positions}
              pathOptions={{
                color: "#0d9488",
                fillColor: "#0d9488",
                fillOpacity: 0.2,
                weight: 2,
              }}
            />
          )}

          {/* Draw polyline for 2 points so the user sees the shape forming */}
          {positions.length === 2 && (
            <Polyline
              positions={positions}
              pathOptions={{ color: "#0d9488", weight: 2, dashArray: "6 4" }}
            />
          )}

          {/* Vertex markers */}
          {positions.map((pos, i) => (
            <CircleMarker
              key={i}
              center={pos}
              radius={7}
              pathOptions={{
                color: "#fff",
                fillColor: "#0d9488",
                fillOpacity: 1,
                weight: 2,
              }}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e);
                  skipNextClick.current = true;
                  removePoint(i);
                },
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -8]}
                permanent={false}
              >
                Point {i + 1} — click to remove
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Overlay hint */}
        {points.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="rounded-md bg-black/50 px-3 py-1.5 text-xs font-medium text-white">
              Click on the map to add points
            </span>
          </div>
        )}
      </div>

      {/* Controls & info */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={undoLast}
          disabled={points.length === 0}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ↩ Undo
        </button>
        <button
          type="button"
          onClick={clearAll}
          disabled={points.length === 0}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ✕ Clear All
        </button>
        <button
          type="button"
          onClick={generateRectangle}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ▭ Generate Rectangle
        </button>

        <span className="ml-auto text-xs text-gray-500">
          {points.length === 0 && "No points yet"}
          {points.length > 0 &&
            points.length < 3 &&
            `${points.length} point${points.length > 1 ? "s" : ""} — need ${3 - points.length} more`}
          {points.length >= 3 && `${points.length} points`}
        </span>
      </div>
    </div>
  );
}
