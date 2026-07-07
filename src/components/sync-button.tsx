"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";

export function SyncButton({ walletId }: { walletId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function sync() {
    setPending(true);
    setError("");
    const response = await fetch(`/api/wallets/${walletId}/sync`, { method: "POST" });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Sync failed.");
    }
    setPending(false);
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={sync}
        disabled={pending}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#2563eb] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#1d4ed8] disabled:opacity-60"
      >
        <RefreshCw size={16} className={pending ? "animate-spin" : ""} />
        Sync
      </button>
      {error ? <p className="mt-2 text-sm text-[#aa2344] dark:text-[#ff9bad]">{error}</p> : null}
    </div>
  );
}

export function DeleteWalletButton({ walletId }: { walletId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function remove() {
    setPending(true);
    await fetch(`/api/wallets/${walletId}`, { method: "DELETE" });
    router.push("/wallets");
    router.refresh();
  }

  return (
    <button
      onClick={remove}
      disabled={pending}
      className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#f1bdc6] bg-[#fff0f2] px-4 text-sm font-medium text-[#aa2344] transition hover:bg-[#ffe4e8] disabled:opacity-60 dark:border-[#5a2230] dark:bg-[#351820] dark:text-[#ff9bad] dark:hover:bg-[#421a25]"
    >
      <Trash2 size={16} />
      Delete
    </button>
  );
}
