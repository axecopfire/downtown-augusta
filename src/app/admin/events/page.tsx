import Link from "next/link";
import { format } from "date-fns";
import { Calendar, MapPin, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { ImpactLevel } from "@/lib/constants";
import ImpactBadge from "@/components/ui/ImpactBadge";
import DeleteEventButton from "./DeleteEventButton";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <Calendar className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">No events yet.</p>
          <Link
            href="/admin/events/new"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Event
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Impact
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {event.title}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {event.address}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {format(new Date(event.startDate), "MMM d, yyyy")}
                    {event.startTime && (
                      <span className="text-gray-400 ml-1">
                        {event.startTime}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm capitalize text-gray-600">
                    {event.category}
                  </td>
                  <td className="px-4 py-3">
                    <ImpactBadge
                      level={event.impactLevel as ImpactLevel}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </Link>
                      <DeleteEventButton
                        eventId={event.id}
                        eventTitle={event.title}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
