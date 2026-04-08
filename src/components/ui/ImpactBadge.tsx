import type { ImpactLevel } from "@/lib/constants";

const IMPACT_STYLES: Record<ImpactLevel, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
};

export default function ImpactBadge({ level }: { level: ImpactLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${IMPACT_STYLES[level] ?? IMPACT_STYLES.medium}`}
    >
      {level}
    </span>
  );
}
