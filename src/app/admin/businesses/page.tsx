import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BUSINESS_CATEGORIES } from "@/lib/constants";
import { Plus, Pencil, Store, Calendar, Rss } from "lucide-react";
import DeleteBusinessButton from "@/components/ui/DeleteBusinessButton";
import AdminTableControls from "@/components/ui/AdminTableControls";
import SortableHeader from "@/components/ui/SortableHeader";

const VALID_SORT_COLUMNS = ["name", "category"] as const;
type SortColumn = (typeof VALID_SORT_COLUMNS)[number];

function parseSortColumn(value: string | undefined): SortColumn {
  if (value && VALID_SORT_COLUMNS.includes(value as SortColumn))
    return value as SortColumn;
  return "name";
}

function parseDir(value: string | undefined): "asc" | "desc" {
  return value === "desc" ? "desc" : "asc";
}

function param(
  v: string | string[] | undefined,
): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function BusinessListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = param(params.search) ?? "";
  const category = param(params.category) ?? "";
  const sort = parseSortColumn(param(params.sort));
  const dir = parseDir(param(params.dir));

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { address: { contains: search } },
    ];
  }
  if (category) {
    where.category = category;
  }

  const orderBy =
    sort === "name"
      ? [{ name: dir }]
      : [{ category: dir }, { name: "asc" as const }];

  const totalCount = await prisma.business.count();
  const businesses = await prisma.business.findMany({
    where,
    orderBy,
    include: {
      _count: {
        select: { events: true, socialPosts: true },
      },
    },
  });

  const hasFilters = !!(search || category);

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

      {totalCount === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Store className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No businesses yet</p>
          <p className="text-sm mt-1">
            Get started by adding your first business.
          </p>
        </div>
      ) : (
        <>
          <AdminTableControls
            categories={BUSINESS_CATEGORIES}
            categoryLabel="category"
          />

          {businesses.length === 0 && hasFilters ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
              <p className="text-sm text-gray-600">
                No businesses match your filters.
              </p>
              <Link
                href="/admin/businesses"
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <SortableHeader column="name" label="Name" />
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <SortableHeader column="category" label="Category" />
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Events / Posts
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
                      <td className="px-4 py-3 text-sm text-center whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1 text-gray-600 mr-3"
                          title="Events"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          {biz._count.events}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 text-gray-600"
                          title="Social Posts"
                        >
                          <Rss className="h-3.5 w-3.5" />
                          {biz._count.socialPosts}
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
        </>
      )}
    </div>
  );
}
