import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Pencil, Store } from "lucide-react";
import DeleteBusinessButton from "@/components/ui/DeleteBusinessButton";

export default async function BusinessListPage() {
  const businesses = await prisma.business.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Store className="h-6 w-6" />
          Businesses
        </h1>
        <Link
          href="/admin/businesses/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Business
        </Link>
      </div>

      {businesses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Store className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No businesses yet</p>
          <p className="text-sm mt-1">
            Get started by adding your first business.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {businesses.map((biz) => (
                <tr key={biz.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {biz.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {biz.address}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 capitalize">
                      {biz.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/businesses/${biz.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
                        title="Edit business"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteBusinessButton id={biz.id} />
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
