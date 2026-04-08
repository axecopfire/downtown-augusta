"use client";

export function Legend() {
  return (
    <div className="absolute bottom-4 right-4 z-[1000] rounded-lg bg-white/95 p-3 shadow-md text-sm backdrop-blur-sm">
      <h4 className="font-semibold mb-2">Map Legend</h4>

      <div className="mb-2">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          Markers
        </p>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block h-3 w-3 rounded-full bg-blue-600" />
          <span>Business</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-orange-500" />
          <span>Event</span>
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          Event Impact
        </p>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block h-3 w-3 rounded-full bg-green-600" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block h-3 w-3 rounded-full bg-orange-600" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-red-600" />
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
