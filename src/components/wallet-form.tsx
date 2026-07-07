"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { chains, labelTypes } from "@/lib/validators";

export function WalletForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch("/api/wallets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, trackingEnabled: formData.get("trackingEnabled") === "on" }),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Failed to add wallet.");
      setPending(false);
      return;
    }

    event.currentTarget.reset();
    setPending(false);
    router.refresh();
  }

  const inputClass =
    "h-10 w-full rounded-lg border border-[#d5deeb] bg-[#ffffff] px-3 text-sm text-[#10131a] outline-none transition placeholder:text-[#98a4b3] focus:border-[#2563eb] dark:border-[#253246] dark:bg-[#0b111c] dark:text-[#f3f7fb]";
  const labelClass = "text-xs font-medium uppercase tracking-[0.08em] text-[#748096] dark:text-[#8795a8]";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 xl:grid-cols-[0.9fr_1.6fr_0.7fr_0.8fr_auto]">
        <label className="space-y-1.5">
          <span className={labelClass}>Name</span>
          <input name="name" className={inputClass} placeholder="Wintermute watch" required />
        </label>
        <label className="space-y-1.5">
          <span className={labelClass}>Address</span>
          <input name="address" className={`${inputClass} font-mono text-xs`} placeholder="0x..." required />
        </label>
        <label className="space-y-1.5">
          <span className={labelClass}>Chain</span>
          <select name="chain" className={inputClass}>
            {chains.map((chain) => (
              <option key={chain} value={chain}>
                {chain}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className={labelClass}>Label</span>
          <select name="labelType" className={inputClass}>
            {labelTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            disabled={pending}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#1d4ed8] disabled:opacity-60 xl:w-auto"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 text-sm text-[#535c6c] dark:text-[#a4afbf]">
          <input type="checkbox" name="trackingEnabled" defaultChecked className="size-4 accent-[#2563eb]" />
          Tracking enabled
        </label>
        {error ? <p className="text-sm text-[#aa2344] dark:text-[#ff9bad]">{error}</p> : null}
      </div>
    </form>
  );
}
