export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Admin
        </p>
      </div>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
