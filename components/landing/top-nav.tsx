import Image from "next/image";
import { Bell } from "lucide-react";

const AVATAR_URL =
  "https://www.figma.com/api/mcp/asset/69c4e576-4be1-4b97-a39d-e050a9fe2883";

export function TopNav() {
  return (
    <header className="z-30 shrink-0 border-b border-[#e0bfb9] bg-[#fbf9f4]">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <h1 className="font-[family-name:var(--font-dm-serif)] text-2xl leading-[31.2px] text-[#1b1c19]">
            stock <span className="text-[#c84b31]">pulse</span>
          </h1>
          <span className="rounded-sm border border-[#c84b31] bg-[rgba(200,75,49,0.1)] px-2 py-1 font-[family-name:var(--font-dm-mono)] text-xs tracking-[0.48px] text-[#c84b31]">
            LIVE INVENTORY
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="flex size-10 items-center justify-center rounded-xl text-[#1b1c19] transition-colors hover:bg-[#e4e2dd]/60"
          >
            <Bell className="size-5" strokeWidth={1.75} />
          </button>
          <div className="relative size-8 overflow-hidden rounded-xl border border-[#e0bfb9]">
            <Image
              src={AVATAR_URL}
              alt="User avatar"
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
