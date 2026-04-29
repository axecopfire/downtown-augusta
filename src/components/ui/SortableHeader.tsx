"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface SortableHeaderProps {
  column: string;
  label: string;
  className?: string;
}

export default function SortableHeader({
  column,
  label,
  className = "",
}: SortableHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") ?? "";
  const currentDir = searchParams.get("dir") ?? "asc";
  const isActive = currentSort === column;

  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isActive) {
      params.set("dir", currentDir === "asc" ? "desc" : "asc");
    } else {
      params.set("sort", column);
      params.set("dir", "asc");
    }
    router.replace(`?${params.toString()}`);
  };

  const Icon = isActive
    ? currentDir === "asc"
      ? ChevronUp
      : ChevronDown
    : ChevronsUpDown;

  return (
    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ${className}`}>
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1 hover:text-gray-700 transition-colors group"
      >
        {label}
        <Icon
          className={`h-3.5 w-3.5 ${isActive ? "text-blue-600" : "text-gray-400 opacity-0 group-hover:opacity-100"} transition-opacity`}
        />
      </button>
    </th>
  );
}
