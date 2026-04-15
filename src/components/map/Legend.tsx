"use client";

const BUSINESS_CATEGORIES = [
  { key: "restaurant", label: "Restaurant", color: "#dc2626", emoji: "🍽️" },
  { key: "bar", label: "Bar", color: "#7c3aed", emoji: "🍸" },
  { key: "retail", label: "Retail", color: "#2563eb", emoji: "🛍️" },
  { key: "service", label: "Service", color: "#0891b2", emoji: "🔧" },
  { key: "entertainment", label: "Entertainment", color: "#d97706", emoji: "🎭" },
  { key: "hotel", label: "Hotel", color: "#059669", emoji: "🏨" },
  { key: "general", label: "General", color: "#6b7280", emoji: "📍" },
];

const IMPACT_LEVELS = [
  { key: "low", label: "Low", color: "#16a34a" },
  { key: "medium", label: "Medium", color: "#ea580c" },
  { key: "high", label: "High", color: "#dc2626" },
];

export function Legend() {
  return (
    <div className="absolute bottom-4 right-4 z-[1000] rounded-lg bg-white/95 p-3 shadow-md text-xs backdrop-blur-sm max-h-[60vh] overflow-y-auto">
      <h4 className="font-semibold text-sm mb-2">Map Legend</h4>

      <div className="mb-2">
        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
          Businesses
        </p>
        {BUSINESS_CATEGORIES.map((cat) => (
          <div key={cat.key} className="flex items-center gap-2 mb-0.5">
            <span className="text-base leading-none shrink-0">{cat.emoji}</span>
            <span>{cat.label}</span>
          </div>
        ))}
      </div>

      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
          Event Impact
        </p>
        {IMPACT_LEVELS.map((level) => (
          <div key={level.key} className="flex items-center gap-2 mb-0.5">
            <span
              className="inline-block h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: level.color }}
            />
            <span>{level.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
