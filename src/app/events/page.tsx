import { prisma } from "@/lib/prisma";
import EventsView from "./EventsView";

export const metadata = {
  title: "Upcoming Events — Downtown Augusta",
  description:
    "Discover concerts, festivals, markets, and community events happening in downtown Augusta, GA.",
};

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { startDate: "asc" },
    include: {
      business: true,
      eventBusinesses: { include: { business: true } },
    },
  });

  return <EventsView events={JSON.parse(JSON.stringify(events))} />;
}
