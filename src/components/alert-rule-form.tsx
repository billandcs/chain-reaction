"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { alertRuleTypes } from "@/lib/validators";

const inputClass =
  "h-10 w-full rounded-lg border border-[#d5deeb] bg-[#ffffff] px-3 text-sm text-[#10131a] outline-none transition placeholder:text-[#98a4b3] focus:border-[#2563eb] dark:border-[#253246] dark:bg-[#0b111c] dark:text-[#f3f7fb]";
const labelClass =
  "text-xs font-medium uppercase tracking-[0.08em] text-[#748096] dark:text-[#8795a8]";

function labelForType(type: string) {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function AlertRuleForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch("/api/alerts/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        enabled: formData.get("enabled") === "on",
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Failed to create alert rule.");
      setPending(false);
      return;
    }

    form.reset();
    setPending(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 xl:grid-cols-[1.1fr_1.2fr_0.7fr_1.3fr_auto]">
        <label className="space-y-1.5">
          <span className={labelClass}>Rule name</span>
          <input
            name="name"
            className={inputClass}
            placeholder="Large ETH flow"
            required
          />
        </label>
        <label className="space-y-1.5">
          <span className={labelClass}>Type</span>
          <select
            name="type"
            className={inputClass}
            defaultValue="wallet_flow_over_usd"
          >
            {alertRuleTypes.map((type) => (
              <option key={type} value={type}>
                {labelForType(type)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className={labelClass}>Threshold USD</span>
          <input
            name="thresholdUsd"
            className={inputClass}
            placeholder="10000"
            inputMode="decimal"
          />
        </label>
        <label className="space-y-1.5">
          <span className={labelClass}>Token address</span>
          <input
            name="tokenAddress"
            className={`${inputClass} font-mono text-xs`}
            placeholder="Optional 0x..."
          />
        </label>
        <div className="flex items-end">
          <button
            disabled={pending}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-4 text-sm font-medium text-white shadow-[0_12px_26px_rgba(37,99,235,0.22)] transition hover:bg-[#1d4ed8] disabled:opacity-60 xl:w-auto"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 text-sm text-[#535c6c] dark:text-[#a4afbf]">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked
            className="size-4 accent-[#2563eb]"
          />
          Enabled
        </label>
        {error ? (
          <p className="text-sm text-[#aa2344] dark:text-[#ff9bad]">{error}</p>
        ) : null}
      </div>
    </form>
  );
}
