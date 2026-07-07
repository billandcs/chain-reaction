import clsx from "clsx";

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/15 bg-white/[0.08] shadow-[0_14px_38px_rgba(2,6,23,0.26)] backdrop-blur-xl",
        compact ? "size-8" : "size-10",
      )}
    >
      <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(56,189,248,0.34),rgba(99,102,241,0.2)_52%,rgba(245,158,11,0.16))]" />
      <span className="absolute h-[58%] w-[58%] rotate-45 rounded-[7px] border border-[#dbeafe]/75 bg-[#0f172a]/10" />
      <span className="absolute h-[38%] w-[72%] -rotate-12 rounded-full border border-[#7dd3fc]/70" />
      <span className="absolute h-[72%] w-[38%] rotate-12 rounded-full border border-[#c4b5fd]/55" />
      <span className="relative h-1.5 w-1.5 rounded-sm bg-[#e0f2fe] shadow-[0_0_18px_rgba(125,211,252,0.9)]" />
    </span>
  );
}
