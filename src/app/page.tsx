import Link from "next/link";
import { Calendar, Map, Store, MapPin, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";

const features = [
  {
    icon: Calendar,
    title: "Upcoming Events",
    description:
      "Stay in the loop with concerts, markets, festivals, and community gatherings happening downtown.",
  },
  {
    icon: Store,
    title: "Local Businesses",
    description:
      "Browse restaurants, shops, galleries, and services — all on one interactive map.",
  },
  {
    icon: Map,
    title: "Interactive Map",
    description:
      "See everything at a glance. Filter by category, date, or distance and get directions instantly.",
  },
];

export default async function Home() {
  const [businessCount, eventCount, upcomingEvents] = await Promise.all([
    prisma.business.count(),
    prisma.event.count(),
    prisma.event.findMany({
      where: { startDate: { gte: new Date() } },
      orderBy: { startDate: "asc" },
      take: 6,
      include: { business: true },
    }),
  ]);

  const stats = [
    { label: "Upcoming Events", value: String(eventCount) },
    { label: "Local Businesses", value: String(businessCount) },
    { label: "City Blocks", value: "15" },
  ];

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-800 to-teal-950 px-4 py-24 text-center text-white sm:py-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Discover Downtown Augusta
          </h1>
          <p className="mt-4 text-lg text-teal-100 sm:text-xl">
            Explore events, restaurants, shops, and more across Augusta&apos;s
            vibrant downtown district — all in one place.
          </p>
          <Link
            href="/map"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          >
            <Map className="h-4 w-4" />
            Explore the Map
          </Link>
          <div className="mt-6 mx-auto max-w-md">
            <form action="/map" className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search businesses & events..."
                  className="w-full rounded-full border-0 bg-white/20 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-teal-200 backdrop-blur-sm focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-amber-600"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid max-w-5xl grid-cols-1 divide-y divide-gray-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats.map((s) => (
            <div key={s.label} className="px-6 py-8 text-center">
              <p className="text-3xl font-bold text-teal-700">{s.value}</p>
              <p className="mt-1 text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Category Quick Links */}
      <section className="bg-white px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
            Browse by Category
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Restaurants", href: "/businesses?category=restaurant", icon: "🍽️", color: "bg-red-50 text-red-700 hover:bg-red-100" },
              { label: "Bars & Nightlife", href: "/businesses?category=bar", icon: "🍸", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
              { label: "Shopping", href: "/businesses?category=retail", icon: "🛍️", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
              { label: "Entertainment", href: "/businesses?category=entertainment", icon: "🎭", color: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
            ].map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className={`flex flex-col items-center gap-2 rounded-xl p-6 text-center transition ${cat.color} ring-1 ring-gray-200`}
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-sm font-semibold">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="bg-gray-50 px-4 py-12">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Upcoming Events
              </h2>
              <Link href="/events" className="text-sm font-medium text-teal-600 hover:text-teal-800">
                View all events →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {new Date(event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {event.startTime && ` · ${event.startTime}`}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  {event.description && (
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{event.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{event.address}</span>
                  </div>
                  {event.business && (
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      <Store className="h-3.5 w-3.5 shrink-0" />
                      <span>{event.business.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="flex-1 bg-gray-50 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Everything you need to explore downtown
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
                  <f.icon className="h-5 w-5 text-teal-700" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
