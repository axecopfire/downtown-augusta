type DayName = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

const DAY_MAP: Record<string, DayName> = {
  sun: "sun", sunday: "sun",
  mon: "mon", monday: "mon",
  tue: "tue", tues: "tue", tuesday: "tue",
  wed: "wed", wednesday: "wed",
  thu: "thu", thur: "thu", thurs: "thu", thursday: "thu",
  fri: "fri", friday: "fri",
  sat: "sat", saturday: "sat",
};

const DAY_ORDER: DayName[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function parseTime(timeStr: string): number | null {
  const cleaned = timeStr.trim().toLowerCase().replace(/\s+/g, "");
  const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3];
  if (period === "pm" && hours !== 12) hours += 12;
  if (period === "am" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function expandDayRange(rangeStr: string): DayName[] {
  const cleaned = rangeStr.trim().toLowerCase();
  if (DAY_MAP[cleaned]) return [DAY_MAP[cleaned]];
  const parts = cleaned.split(/[–\-]/);
  if (parts.length === 2) {
    const start = DAY_MAP[parts[0].trim()];
    const end = DAY_MAP[parts[1].trim()];
    if (start && end) {
      const startIdx = DAY_ORDER.indexOf(start);
      const endIdx = DAY_ORDER.indexOf(end);
      const days: DayName[] = [];
      if (startIdx <= endIdx) {
        for (let i = startIdx; i <= endIdx; i++) days.push(DAY_ORDER[i]);
      } else {
        for (let i = startIdx; i < 7; i++) days.push(DAY_ORDER[i]);
        for (let i = 0; i <= endIdx; i++) days.push(DAY_ORDER[i]);
      }
      return days;
    }
  }
  return [];
}

interface DaySchedule {
  open: number; // minutes from midnight
  close: number;
}

export function parseHours(hoursStr: string | null): Map<DayName, DaySchedule[]> | null {
  if (!hoursStr) return null;
  const schedule = new Map<DayName, DaySchedule[]>();
  const segments = hoursStr.split(",").map((s) => s.trim());
  for (const segment of segments) {
    const match = segment.match(
      /^(.+?)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*[–\-]\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)$/i
    );
    if (!match) continue;
    const days = expandDayRange(match[1]);
    const openTime = parseTime(match[2]);
    const closeTime = parseTime(match[3]);
    if (days.length === 0 || openTime === null || closeTime === null) continue;
    for (const day of days) {
      if (!schedule.has(day)) schedule.set(day, []);
      schedule.get(day)!.push({ open: openTime, close: closeTime });
    }
  }
  return schedule.size > 0 ? schedule : null;
}

export function isOpenNow(hoursStr: string | null, now?: Date): boolean | null {
  const schedule = parseHours(hoursStr);
  if (!schedule) return null;
  const d = now ?? new Date();
  const dayName = DAY_ORDER[d.getDay()];
  const currentMinutes = d.getHours() * 60 + d.getMinutes();
  const todaySlots = schedule.get(dayName);
  if (!todaySlots || todaySlots.length === 0) return false;
  return todaySlots.some((slot) => currentMinutes >= slot.open && currentMinutes < slot.close);
}
