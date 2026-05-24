import { Clock } from "lucide-react";

type HeroSectionProps = {
  stats: Array<{ value: string; label: string }>;
};

export function HeroSection({ stats }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-lg border border-[#e0bfb9] bg-white p-6 sm:p-10">
      <div
        className="pointer-events-none absolute -top-20 -right-20 size-48 rounded-xl opacity-50 blur-[32px] sm:size-64"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgb(228, 226, 221) 0%, rgba(228, 226, 221, 0) 100%)",
        }}
      />

      <div className="relative max-w-2xl">
        <h2 className="font-[family-name:var(--font-dm-serif)] text-3xl leading-tight text-[#1b1c19] sm:text-5xl sm:leading-[52.8px]">
          Reserve what you <span className="italic text-[#c84b31]">need.</span>
        </h2>

        <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-[#58413c] sm:text-lg sm:leading-[28.8px]">
          <Clock className="mt-1 size-[18px] shrink-0" strokeWidth={1.75} />
          Standard 10-minute hold policy applies to all active carts.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-[#e0bfb9] pt-4 sm:grid-cols-3 sm:gap-6">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p className="font-[family-name:var(--font-dm-serif)] text-xl leading-[1.2] text-[#1b1c19] sm:text-2xl sm:leading-[31.2px]">
                {value}
              </p>
              <p className="font-[family-name:var(--font-dm-mono)] text-xs tracking-[0.6px] text-[#58413c] uppercase">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
