"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Calendar, Store, Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Map", icon: Map },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/businesses", label: "Businesses", icon: Store },
] as const;

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-teal-800 text-white shadow-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <Map className="h-5 w-5 text-amber-400" />
          <span>Downtown Augusta</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-teal-700 text-white"
                    : "text-teal-100 hover:bg-teal-700/60 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          className="inline-flex items-center justify-center rounded-md p-1.5 text-teal-100 hover:bg-teal-700 sm:hidden"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-teal-700 pb-3 sm:hidden">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-teal-700 text-white"
                    : "text-teal-100 hover:bg-teal-700/60 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
