import Link from "next/link";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-[28px] font-semibold leading-tight tracking-normal text-[#10131a] dark:text-[#f3f7fb] sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#626b7a] dark:text-[#98a4b3]">{description}</p>
        ) : null}
      </div>
      {action ? <div className="self-start sm:self-auto">{action}</div> : null}
    </div>
  );
}

export function Panel({
  title,
  eyebrow,
  action,
  children,
  className,
}: {
  title?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={clsx(
        "rounded-lg border border-[#d9deea] bg-[#fbfcff] shadow-[0_1px_2px_rgba(15,23,42,0.05)] dark:border-[#253246] dark:bg-[#111722]",
        className,
      )}
    >
      {title || action || eyebrow ? (
        <div className="flex items-start justify-between gap-4 border-b border-[#e2e7f0] px-4 py-3 dark:border-[#223047] sm:px-5">
          <div>
            {eyebrow ? (
              <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#778195] dark:text-[#7f8da3]">
                {eyebrow}
              </div>
            ) : null}
            {title ? <h2 className="text-base font-semibold text-[#151a24] dark:text-[#eef4fb]">{title}</h2> : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function MetricTile({
  label,
  value,
  detail,
  icon: Icon,
  tone = "teal",
}: {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  tone?: "teal" | "amber" | "blue" | "rose";
}) {
  const tones = {
    teal: "bg-[#dff5ff] text-[#075985] dark:bg-[#10283a] dark:text-[#7dd3fc]",
    amber: "bg-[#fff3cf] text-[#94630a] dark:bg-[#3a2e11] dark:text-[#f4d37c]",
    blue: "bg-[#e4e9ff] text-[#3730a3] dark:bg-[#1d2447] dark:text-[#aebfff]",
    rose: "bg-[#ffe4e8] text-[#b52146] dark:bg-[#421a25] dark:text-[#ff9bad]",
  };

  return (
    <div className="rounded-lg border border-[#dde4ef] bg-[#fbfcff] p-4 dark:border-[#253246] dark:bg-[#111722]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-[#748096] dark:text-[#8795a8]">
            {label}
          </div>
          <div className="mt-2 text-2xl font-semibold leading-none text-[#10131a] dark:text-[#f3f7fb]">{value}</div>
          {detail ? <div className="mt-2 text-xs text-[#626b7a] dark:text-[#98a4b3]">{detail}</div> : null}
        </div>
        <div className={clsx("flex size-9 shrink-0 items-center justify-center rounded-lg", tones[tone])}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warn" | "risk" | "info";
}) {
  const tones = {
    neutral: "border-[#d9deea] bg-[#f4f6fb] text-[#535c6c] dark:border-[#2a3548] dark:bg-[#171d28] dark:text-[#a4afbf]",
    good: "border-[#b8e6ff] bg-[#e7f7ff] text-[#075985] dark:border-[#22506b] dark:bg-[#10283a] dark:text-[#7dd3fc]",
    warn: "border-[#efd99e] bg-[#fff7df] text-[#8d650d] dark:border-[#594518] dark:bg-[#302712] dark:text-[#f2d47b]",
    risk: "border-[#f1bdc6] bg-[#fff0f2] text-[#aa2344] dark:border-[#5a2230] dark:bg-[#351820] dark:text-[#ff9bad]",
    info: "border-[#cfd6ff] bg-[#f0f3ff] text-[#3730a3] dark:border-[#303b77] dark:bg-[#1d2447] dark:text-[#aebfff]",
  };

  return (
    <span className={clsx("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}

export function AddressText({ address }: { address: string }) {
  return (
    <span className="font-mono text-xs text-[#626b7a] dark:text-[#98a4b3]">
      <span className="hidden sm:inline">{address}</span>
      <span className="sm:hidden">
        {address.slice(0, 8)}...{address.slice(-6)}
      </span>
    </span>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center rounded-lg bg-[#2563eb] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#1d4ed8]"
    >
      {children}
    </Link>
  );
}
