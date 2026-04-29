"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

interface AdminTableControlsProps {
  categories: readonly string[];
  categoryLabel?: string;
}

export default function AdminTableControls({
  categories,
  categoryLabel = "Category",
}: AdminTableControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") ?? "";
  const currentCategory = searchParams.get("category") ?? "";

  const [searchValue, setSearchValue] = useState(currentSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Sync local state when URL changes externally
  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams("search", value);
    }, 300);
  };

  const clearFilters = () => {
    setSearchValue("");
    router.replace("?");
  };

  const hasFilters = currentSearch || currentCategory;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or address…"
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <select
        value={currentCategory}
        onChange={(e) => updateParams("category", e.target.value)}
        className="rounded-md border border-gray-300 py-2 pl-3 pr-8 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">All {categoryLabel}s</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  );
}
