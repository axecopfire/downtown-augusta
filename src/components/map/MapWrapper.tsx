"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center text-gray-500">
        <div className="mb-2 text-2xl">🗺️</div>
        <p className="text-sm">Loading map…</p>
      </div>
    </div>
  ),
});

export default Map;
