import { prisma } from "@/lib/prisma";
import MapView from "./MapView";

export const metadata = {
  title: "Interactive Map — Downtown Augusta",
  description:
    "Explore downtown Augusta's businesses and upcoming events on an interactive map. Filter by category, impact level, and date.",
};

export default async function MapPage() {
  const [businesses, events] = await Promise.all([
    prisma.business.findMany({ orderBy: { name: "asc" } }),
    prisma.event.findMany({ orderBy: { startDate: "asc" } }),
  ]);

  return (
    <MapView
      businesses={JSON.parse(JSON.stringify(businesses))}
      events={JSON.parse(JSON.stringify(events))}
    />
  );
}
