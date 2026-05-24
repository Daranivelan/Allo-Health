"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/inventory-display";

type CountdownTimerProps = {
  expiresAt: string;
  onExpire?: () => void;
};

export function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [time, setTime] = useState(() => formatCountdown(expiresAt));

  useEffect(() => {
    let expiredCalled = false;

    const tick = () => {
      const next = formatCountdown(expiresAt);
      setTime(next);
      if (next.expired && !expiredCalled) {
        expiredCalled = true;
        onExpire?.();
      }
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [expiresAt, onExpire]);

  const display = `${String(time.minutes).padStart(2, "0")}:${String(time.seconds).padStart(2, "0")}`;

  return (
    <div className="relative overflow-hidden rounded border border-[#e0bfb9] bg-[#1b1c19] p-10 text-center">
      <p className="font-[family-name:var(--font-dm-mono)] text-xs tracking-[1.2px] text-[#dbdad5] uppercase">
        Reservation expires in
      </p>
      <p className="mt-2 font-[family-name:var(--font-dm-serif)] text-5xl leading-[52.8px] text-white">
        {display}
      </p>
      <p className="mt-2 font-[family-name:var(--font-dm-mono)] text-xs tracking-[1.2px] text-[#dbdad5] uppercase">
        Minutes · Seconds
      </p>
    </div>
  );
}
