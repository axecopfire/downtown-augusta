"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/map/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100">
      <p className="text-sm text-gray-500">Loading map…</p>
    </div>
  ),
});

interface BusinessDetailMapProps {
  lat: number;
  lng: number;
  name: string;
}

export default function BusinessDetailMap({
  lat,
  lng,
  name,
}: BusinessDetailMapProps) {
  return (
    <Map
      businesses={[
        {
          id: "detail",
          name,
          category: "",
          address: null,
          phone: null,
          hours: null,
          website: null,
          facebookUrl: null,
          instagramUrl: null,
          latitude: lat,
          longitude: lng,
        },
      ]}
    />
  );
}
