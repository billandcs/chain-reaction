"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeDollarSign,
  Bell,
  Bot,
  Gauge,
  Layers3,
  Settings,
  Tags,
  WalletCards,
} from "lucide-react";
import clsx from "clsx";

const primaryNav = [
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/wallets", label: "Wallets", icon: WalletCards },
  { href: "/tokens", label: "Tokens", icon: BadgeDollarSign },
  { href: "/smart-money", label: "Smart Money", icon: Tags },
];

const secondaryNav = [
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/ai-reports", label: "AI Reports", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

const mobileNav = [...primaryNav, { href: "/alerts", label: "Alerts", icon: Bell }];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#eef2f8] text-[#10131a] dark:bg-[#070c13] dark:text-[#f3f7fb]">
      <aside className="fixed inset-y-0 left-0 hidden w-[250px] border-r border-[#d8e0ec] bg-[#f8faff] px-3 py-4 dark:border-[#1d2838] dark:bg-[#09111c] lg:block">
        <Link href="/" className="mb-7 flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#2563eb] text-white shadow-sm shadow-blue-950/20">
            <Layers3 size={18} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-normal">Chain Reaction</div>
            <div className="truncate text-[11px] text-[#626b7a] dark:text-[#98a4b3]">Local onchain intel</div>
          </div>
        </Link>

        <nav className="space-y-5">
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#778195] dark:text-[#6f7e93]">
              Monitor
            </div>
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition",
                    active
                      ? "bg-[#e7efff] font-medium text-[#1d4ed8] dark:bg-[#10213a] dark:text-[#7dd3fc]"
                      : "text-[#535c6c] hover:bg-[#edf2fb] dark:text-[#9ba7b8] dark:hover:bg-[#111b29]",
                  )}
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#778195] dark:text-[#6f7e93]">
              System
            </div>
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition",
                    active
                      ? "bg-[#e7efff] font-medium text-[#1d4ed8] dark:bg-[#10213a] dark:text-[#7dd3fc]"
                      : "text-[#535c6c] hover:bg-[#edf2fb] dark:text-[#9ba7b8] dark:hover:bg-[#111b29]",
                  )}
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-4 left-3 right-3 rounded-lg border border-[#d9deea] bg-[#ffffff] p-3 dark:border-[#253246] dark:bg-[#101722]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-medium">MVP mode</div>
              <div className="mt-1 text-[11px] text-[#626b7a] dark:text-[#98a4b3]">Mock adapter active</div>
            </div>
            <span className="size-2 rounded-full bg-[#38bdf8]" />
          </div>
        </div>
      </aside>

      <div className="lg:pl-[250px]">
        <div className="sticky top-0 z-30 hidden h-12 items-center justify-between border-b border-[#d8e0ec] bg-[#f8faff]/92 px-6 backdrop-blur dark:border-[#1d2838] dark:bg-[#09111c]/92 lg:flex">
          <div className="text-sm text-[#535c6c] dark:text-[#c5cfdc]">
            Chain Reaction terminal is local-first. Sync watched wallets, inspect flows, and keep trading disabled.
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-lg border border-[#d9deea] px-3 py-1.5 text-[#535c6c] dark:border-[#253246] dark:text-[#a4afbf]">
              Wallet $0
            </span>
            <Link href="/settings" className="rounded-lg bg-[#2563eb] px-3 py-1.5 font-medium text-white hover:bg-[#1d4ed8]">
              Configure
            </Link>
          </div>
        </div>
        <header className="sticky top-0 z-30 border-b border-[#d8e0ec] bg-[#f8faff]/92 px-4 py-3 backdrop-blur dark:border-[#1d2838] dark:bg-[#09111c]/92 lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="flex size-8 items-center justify-center rounded-lg bg-[#2563eb] text-white">
                <Layers3 size={16} />
              </span>
              Chain Reaction
            </Link>
            <Link
              href="/settings"
              aria-label="Settings"
              className="flex size-9 items-center justify-center rounded-lg border border-[#d9deea] dark:border-[#253246]"
            >
              <Settings size={18} />
            </Link>
          </div>
        </header>

        <main className="mx-auto min-h-screen max-w-[1400px] px-4 pb-24 pt-6 sm:px-6 lg:px-3 lg:pb-8 lg:pt-3">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[#d8e0ec] bg-[#fbfcff]/95 px-1 py-1.5 backdrop-blur dark:border-[#1d2838] dark:bg-[#09111c]/95 lg:hidden">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[11px]",
                active
                  ? "bg-[#e7efff] font-medium text-[#1d4ed8] dark:bg-[#10213a] dark:text-[#7dd3fc]"
                  : "text-[#626b7a] dark:text-[#98a4b3]",
              )}
            >
              <Icon size={17} />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
