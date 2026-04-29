"use client";

import { useRouter, usePathname } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/admin/login") return null;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs font-medium text-gray-500 hover:text-gray-700"
    >
      Sign out
    </button>
  );
}
