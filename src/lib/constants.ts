// Downtown Augusta, GA center coordinates
export const DOWNTOWN_AUGUSTA_CENTER = {
  lat: 33.4735,
  lng: -81.9748,
} as const;

export const DEFAULT_ZOOM = 15;

export const BUSINESS_CATEGORIES = [
  "restaurant",
  "bar",
  "retail",
  "service",
  "entertainment",
  "hotel",
  "general",
] as const;

export const EVENT_CATEGORIES = [
  "marathon",
  "festival",
  "concert",
  "market",
  "parade",
  "sports",
  "community",
  "other",
] as const;

export const IMPACT_LEVELS = ["low", "medium", "high"] as const;

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];
export type EventCategory = (typeof EVENT_CATEGORIES)[number];
export type ImpactLevel = (typeof IMPACT_LEVELS)[number];
