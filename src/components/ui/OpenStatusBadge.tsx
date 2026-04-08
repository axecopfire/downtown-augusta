"use client";

import { useState, useEffect } from "react";
import { isOpenNow } from "@/lib/hours";

interface OpenStatusBadgeProps {
  hours: string | null;
  className?: string;
}

export default function OpenStatusBadge({ hours, className = "" }: OpenStatusBadgeProps) {
  const [status, setStatus] = useState<boolean | null>(null);

  useEffect(() => {
    setStatus(isOpenNow(hours));
    const interval = setInterval(() => setStatus(isOpenNow(hours)), 60_000);
    return () => clearInterval(interval);
  }, [hours]);

  if (status === null) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        status
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      } ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${status ? "bg-green-500" : "bg-red-500"}`} />
      {status ? "Open Now" : "Closed"}
    </span>
  );
}
