import Link from "next/link";
import { Calendar, Map, Store } from "lucide-react";

const stats = [
  { label: "Upcoming Events", value: "30+" },
  { label: "Local Businesses", value: "120+" },
  { label: "City Blocks", value: "15" },
];

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

export default function Home() {
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
