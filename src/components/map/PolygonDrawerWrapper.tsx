"use client";

import dynamic from "next/dynamic";

const PolygonDrawer = dynamic(() => import("./PolygonDrawer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[350px] w-full items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
      <p className="text-sm text-gray-400">Loading map editor…</p>
    </div>
  ),
});

export default PolygonDrawer;
