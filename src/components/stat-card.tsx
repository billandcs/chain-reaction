import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "teal",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "teal" | "amber" | "indigo" | "rose";
}) {
  const tones = {
    teal: "bg-[#dff5ff] text-[#075985] dark:bg-[#10283a] dark:text-[#7dd3fc]",
    amber: "bg-[#fff1c2] text-[#9a6700] dark:bg-[#3b3216] dark:text-[#f6d56b]",
    indigo: "bg-[#e5e7ff] text-[#4338ca] dark:bg-[#27284a] dark:text-[#a5b4fc]",
    rose: "bg-[#ffe4e6] text-[#be123c] dark:bg-[#4a1f2a] dark:text-[#fda4af]",
  };

  return (
    <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#171918]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-black/55 dark:text-white/55">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <div className={`flex size-10 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon size={20} />
        </div>
      </div>
    </section>
  );
}
