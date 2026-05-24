"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterBarProps = {
  filters: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

export function FilterBar({
  filters,
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: FilterBarProps) {
  return (
    <section className="flex flex-col gap-4 border-b border-[#e0bfb9] bg-[rgba(251,249,244,0.9)] py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:pb-0">
        {filters.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => onFilterChange(filter)}
              className={cn(
                "shrink-0 rounded-xl px-3 py-1.5 font-[family-name:var(--font-dm-mono)] text-sm tracking-[0.28px] transition-colors sm:px-4",
                isActive
                  ? "bg-[#1b1c19] text-white"
                  : "border border-[#e0bfb9] bg-white text-[#1b1c19] hover:border-[#c84b31]",
              )}
            >
              {filter}
            </button>
          );
        })}
      </div>

      <div className="relative w-full sm:w-64 sm:max-w-64">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-2.5 -translate-y-1/2 text-[#6b7280]" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="SEARCH SKU..."
          className="w-full rounded-sm border border-[#e0bfb9] bg-white py-2 pr-3 pl-9 font-[family-name:var(--font-dm-mono)] text-xs tracking-[0.48px] text-[#1b1c19] uppercase placeholder:text-[#6b7280] placeholder:normal-case focus:border-[#c84b31] focus:outline-none"
        />
      </div>
    </section>
  );
}
