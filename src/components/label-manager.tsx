"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Download, Plus, Upload } from "lucide-react";
import { chains, labelTypes } from "@/lib/validators";

type WalletOption = {
  id: string;
  name: string;
  address: string;
  chain: string;
};

export function LabelManager({ wallets }: { wallets: WalletOption[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [csv, setCsv] = useState("chain,address,type,name,confidence,notes,sourceUrl\n");
  const inputClass =
    "h-10 w-full rounded-lg border border-[#d5deeb] bg-[#ffffff] px-3 text-sm text-[#10131a] outline-none transition placeholder:text-[#98a4b3] focus:border-[#2563eb] dark:border-[#253246] dark:bg-[#0b111c] dark:text-[#f3f7fb]";
  const labelClass = "text-xs font-medium uppercase tracking-[0.08em] text-[#748096] dark:text-[#8795a8]";

  async function createLabel(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const walletId = String(formData.get("walletId") ?? "");
    const selectedWallet = wallets.find((wallet) => wallet.id === walletId);
    const payload = {
      walletId: walletId || undefined,
      address: selectedWallet?.address ?? String(formData.get("address") ?? ""),
      chain: selectedWallet?.chain ?? String(formData.get("chain") ?? "ethereum"),
      type: String(formData.get("type") ?? "Custom"),
      name: String(formData.get("name") ?? ""),
      confidence: Number(formData.get("confidence") ?? 70),
      notes: String(formData.get("notes") ?? ""),
      sourceUrl: String(formData.get("sourceUrl") ?? ""),
    };

    const response = await fetch("/api/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Failed to create label.");
      return;
    }

    form.reset();
    setMessage("Label created.");
    router.refresh();
  }

  async function importCsv() {
    setError("");
    setMessage("");
    const response = await fetch("/api/labels/import", {
      method: "POST",
      headers: { "Content-Type": "text/csv" },
      body: csv,
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Import failed.");
      return;
    }

    setMessage(`Imported ${data.imported} labels${data.errors?.length ? `, ${data.errors.length} rows skipped` : ""}.`);
    if (data.errors?.length) {
      setError(data.errors.slice(0, 3).join(" "));
    }
    router.refresh();
  }

  async function readFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setCsv(await file.text());
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
      <form onSubmit={createLabel} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className={labelClass}>Wallet</span>
            <select name="walletId" className={inputClass}>
              <option value="">Address-only label</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name} · {wallet.address.slice(0, 8)}...
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className={labelClass}>Address</span>
            <input name="address" className={`${inputClass} font-mono text-xs`} placeholder="0x... optional if wallet selected" />
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
            <span className={labelClass}>Type</span>
            <select name="type" className={inputClass}>
              {labelTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className={labelClass}>Name</span>
            <input name="name" className={inputClass} placeholder="Smart Money source" required />
          </label>
          <label className="space-y-1.5">
            <span className={labelClass}>Confidence</span>
            <input name="confidence" type="number" min="0" max="100" defaultValue="70" className={inputClass} />
          </label>
          <label className="space-y-1.5 md:col-span-2">
            <span className={labelClass}>Source URL</span>
            <input name="sourceUrl" className={inputClass} placeholder="https://..." />
          </label>
          <label className="space-y-1.5 md:col-span-2">
            <span className={labelClass}>Notes</span>
            <textarea
              name="notes"
              className="min-h-20 w-full rounded-lg border border-[#d5deeb] bg-[#ffffff] px-3 py-2 text-sm text-[#10131a] outline-none transition placeholder:text-[#98a4b3] focus:border-[#2563eb] dark:border-[#253246] dark:bg-[#0b111c] dark:text-[#f3f7fb]"
              placeholder="Why should this wallet be treated this way?"
            />
          </label>
        </div>
        <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#2563eb] px-4 text-sm font-medium text-white shadow-sm hover:bg-[#1d4ed8]">
          <Plus size={16} />
          Create Label
        </button>
      </form>

      <div className="space-y-3">
        <a
          href="/api/labels/export"
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#d9deea] bg-white px-4 text-sm font-medium text-[#10131a] hover:bg-[#f4f6fb] dark:border-[#253246] dark:bg-[#0b111c] dark:text-[#f3f7fb] dark:hover:bg-[#101824]"
        >
          <Download size={16} />
          Export CSV
        </a>
        <label className="block space-y-1.5">
          <span className={labelClass}>Import CSV</span>
          <input type="file" accept=".csv,text/csv" onChange={readFile} className="w-full text-sm text-[#626b7a] dark:text-[#98a4b3]" />
        </label>
        <textarea
          value={csv}
          onChange={(event) => setCsv(event.target.value)}
          className="min-h-44 w-full rounded-lg border border-[#d5deeb] bg-[#ffffff] px-3 py-2 font-mono text-xs text-[#10131a] outline-none focus:border-[#2563eb] dark:border-[#253246] dark:bg-[#0b111c] dark:text-[#f3f7fb]"
        />
        <button
          type="button"
          onClick={importCsv}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#1d2433] px-4 text-sm font-medium text-white hover:bg-[#111827] dark:bg-[#2563eb] dark:hover:bg-[#1d4ed8]"
        >
          <Upload size={16} />
          Import Labels
        </button>
        {message ? <p className="text-sm text-[#075985] dark:text-[#7dd3fc]">{message}</p> : null}
        {error ? <p className="text-sm text-[#aa2344] dark:text-[#ff9bad]">{error}</p> : null}
      </div>
    </div>
  );
}
