"use client";

import Image from "next/image";
import { Bell, LogOut, Loader2, User as UserIcon } from "lucide-react";
import { useSession, signOut, signIn } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

const AVATAR_URL =
  "https://www.figma.com/api/mcp/asset/69c4e576-4be1-4b97-a39d-e050a9fe2883";

export function TopNav() {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-[#e0bfb9] bg-[#fbf9f4]">
      <div className="flex h-14 items-center justify-between px-6">
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

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="relative size-8 overflow-hidden rounded-xl border border-[#e0bfb9] hover:opacity-80 transition-opacity flex items-center justify-center bg-gray-100"
            >
              {status === "loading" ? (
                <Loader2 className="size-4 animate-spin text-gray-500" />
              ) : session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              ) : session?.user ? (
                <span className="text-sm font-medium text-gray-700">
                  {session.user.name?.charAt(0).toUpperCase() || (
                    <UserIcon className="size-4" />
                  )}
                </span>
              ) : (
                <Image
                  src={AVATAR_URL}
                  alt="Default avatar"
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              )}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md border border-[#e0bfb9] bg-white text-[#1b1c19] shadow-lg focus:outline-none z-50">
                {session ? (
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-[#e0bfb9]">
                      <p className="text-sm font-semibold truncate">
                        {session.user?.name || "User"}
                      </p>
                      <p className="text-xs text-[#58413c] truncate">
                        {session.user?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#ba1a1a] hover:bg-[#f5f3ee] transition-colors text-left"
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        signIn("google");
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-[#c84b31] hover:bg-[#f5f3ee] transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
