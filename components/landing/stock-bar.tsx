import { cn } from "@/lib/utils";
import type { StockLevel } from "@/lib/inventory-types";

const levelColors: Record<StockLevel, string> = {
  high: "bg-emerald-500",
  medium: "bg-amber-500",
  low: "bg-amber-500",
  empty: "bg-transparent",
};

const dotColors: Record<StockLevel, string> = {
  high: "bg-emerald-500",
  medium: "bg-amber-500",
  low: "bg-amber-500",
  empty: "bg-red-500",
};

export function StockBar({
  name,
  quantity,
  level,
  fillPercent,
}: {
  name: string;
  quantity: number;
  level: StockLevel;
  fillPercent: number;
}) {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between p-1">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", dotColors[level])} />
          <span className="text-sm text-[#1b1c19]">{name}</span>
        </div>
        <span
          className={cn(
            "font-[family-name:var(--font-dm-mono)] text-sm tracking-[0.28px]",
            level === "empty" ? "text-[#ba1a1a]" : "text-[#1b1c19]"
          )}
        >
          {quantity.toLocaleString()}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-xl bg-[#e4e2dd]">
        {fillPercent > 0 && (
          <div
            className={cn("h-full rounded-xl", levelColors[level])}
            style={{ width: `${fillPercent}%` }}
          />
        )}
      </div>
    </div>
  );
}
