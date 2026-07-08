"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCheck, Pause, Play, Trash2 } from "lucide-react";

export function AlertRuleActions({
  ruleId,
  enabled,
}: {
  ruleId: string;
  enabled: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function updateEnabled(nextEnabled: boolean) {
    setPending(true);
    await fetch(`/api/alerts/rules/${ruleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: nextEnabled }),
    });
    setPending(false);
    router.refresh();
  }

  async function remove() {
    setPending(true);
    await fetch(`/api/alerts/rules/${ruleId}`, { method: "DELETE" });
    setPending(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => updateEnabled(!enabled)}
        className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#2b3a50] bg-white/[0.05] px-2 text-xs font-medium text-[#dbeafe] transition hover:text-[#7dd3fc] disabled:opacity-60"
      >
        {enabled ? <Pause size={13} /> : <Play size={13} />}
        {enabled ? "Pause" : "Enable"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={remove}
        className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#5a2230] bg-[#351820]/70 px-2 text-xs font-medium text-[#ff9bad] transition hover:bg-[#421a25] disabled:opacity-60"
      >
        <Trash2 size={13} />
        Delete
      </button>
    </div>
  );
}

export function AlertEventActions({
  eventId,
  read,
}: {
  eventId: string;
  read: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function mark(nextRead: boolean) {
    setPending(true);
    await fetch(`/api/alerts/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: nextRead }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => mark(!read)}
      className="inline-flex h-8 items-center rounded-lg border border-[#2b3a50] bg-white/[0.05] px-2 text-xs font-medium text-[#dbeafe] transition hover:text-[#7dd3fc] disabled:opacity-60"
    >
      {read ? "Mark unread" : "Mark read"}
    </button>
  );
}

export function MarkAllAlertsReadButton({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function markAll() {
    setPending(true);
    await fetch("/api/alerts/events/read-all", { method: "POST" });
    setPending(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      disabled={disabled || pending}
      onClick={markAll}
      className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#2b3a50] bg-white/[0.05] px-3 text-sm font-medium text-[#dbeafe] transition hover:text-[#7dd3fc] disabled:opacity-50"
    >
      <CheckCheck size={16} />
      Mark all read
    </button>
  );
}
