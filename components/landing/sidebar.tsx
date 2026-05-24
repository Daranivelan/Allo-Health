"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  HelpCircle,
  Package,
  Plus,
  Settings,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  {
    label: "Inventory",
    href: "/",
    icon: Package,
    match: (path: string) => path === "/",
  },
  {
    label: "Reservations",
    href: "/reservations",
    icon: FileText,
    match: (path: string) => path.startsWith("/reservations"),
  },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-[#e0bfb9] bg-[#f5f3ee] px-4 py-4 md:fixed md:top-14 md:left-0 md:z-20 md:flex md:h-[calc(100vh-3.5rem)] md:w-64 md:flex-col md:justify-between md:border-b-0 md:border-r md:px-3 md:py-6">
      <div className="flex flex-col gap-6 md:gap-10">
        <div className="flex items-center gap-3 md:px-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-[#c84b31] text-white">
            <Warehouse className="size-5" strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-[family-name:var(--font-dm-mono)] text-sm tracking-[0.28px] text-[#1b1c19]">
              Operations Portal
            </p>
            <p className="text-sm text-[#58413c]">Manage Inventory</p>
          </div>
        </div>

        <Link
          href="/"
          className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#c84b31] px-4 py-2 text-[15px] font-semibold tracking-[0.15px] text-white transition-colors hover:bg-[#a6331b] md:px-4"
        >
          <Plus className="size-3.5" strokeWidth={2.5} />
          New Reservation
        </Link>

        <nav className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0 md:gap-1">
          {mainNav.map(({ label, href, icon: Icon, match }) => {
            const active = match(pathname);

            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-3 rounded-sm px-3 py-2 font-[family-name:var(--font-dm-mono)] text-sm tracking-[0.28px] transition-colors md:shrink",
                  active
                    ? "border-r-2 border-[#a6331b] bg-[rgba(200,75,49,0.1)] text-[#a6331b]"
                    : "text-[#58413c] hover:bg-[rgba(200,75,49,0.05)]",
                )}
              >
                <Icon className="size-[18px] shrink-0" strokeWidth={1.75} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
