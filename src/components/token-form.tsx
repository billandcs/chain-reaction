"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { chains } from "@/lib/validators";

const inputClass =
  "h-10 w-full rounded-lg border border-[#d5deeb] bg-[#ffffff] px-3 text-sm text-[#10131a] outline-none transition placeholder:text-[#98a4b3] focus:border-[#2563eb] dark:border-[#253246] dark:bg-[#0b111c] dark:text-[#f3f7fb]";
const labelClass =
  "text-xs font-medium uppercase tracking-[0.08em] text-[#748096] dark:text-[#8795a8]";

export function TokenForm() {
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

    const response = await fetch("/api/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Failed to add token.");
      setPending(false);
      return;
    }

    form.reset();
    setPending(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 xl:grid-cols-[0.9fr_1.7fr_0.8fr_0.7fr_0.85fr_auto]">
        <label className="space-y-1.5">
          <span className={labelClass}>Symbol</span>
          <input name="symbol" className={inputClass} placeholder="AUTO" />
        </label>
        <label className="space-y-1.5">
          <span className={labelClass}>Token address</span>
          <input
            name="address"
            className={`${inputClass} font-mono text-xs`}
            placeholder="0x..."
            required
          />
        </label>
        <label className="space-y-1.5">
          <span className={labelClass}>Chain</span>
          <select name="chain" className={inputClass} defaultValue="ethereum">
            {chains.map((chain) => (
              <option key={chain} value={chain}>
                {chain}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className={labelClass}>Decimals</span>
          <input
            name="decimals"
            className={inputClass}
            placeholder="AUTO"
            inputMode="numeric"
          />
        </label>
        <label className="space-y-1.5">
          <span className={labelClass}>CoinGecko ID</span>
          <input
            name="coingeckoId"
            className={inputClass}
            placeholder="ethereum"
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
      <label className="block space-y-1.5">
        <span className={labelClass}>Name override</span>
        <input
          name="name"
          className={inputClass}
          placeholder="Optional. Adapter metadata is used when empty."
        />
      </label>
      {error ? (
        <p className="text-sm text-[#aa2344] dark:text-[#ff9bad]">{error}</p>
      ) : null}
    </form>
  );
}
