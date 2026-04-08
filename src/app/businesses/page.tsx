import { prisma } from "@/lib/prisma";
import BusinessesView from "./BusinessesView";

export const metadata = {
  title: "Downtown Businesses — Downtown Augusta",
  description:
    "Browse restaurants, shops, galleries, and services in downtown Augusta, GA.",
};

export default async function BusinessesPage() {
  const businesses = await prisma.business.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { events: true } } },
  });

  // Serialize dates for the client component
  const serialized = businesses.map((b) => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }));

  return <BusinessesView businesses={serialized} />;
}
