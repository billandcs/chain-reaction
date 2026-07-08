import { Bell, BellRing, ShieldCheck } from "lucide-react";
import {
  AlertEventActions,
  AlertRuleActions,
  MarkAllAlertsReadButton,
} from "@/components/alert-actions";
import { AlertRuleForm } from "@/components/alert-rule-form";
import { prisma } from "@/lib/db";
import { formatDateTimeUtc } from "@/lib/format";
import { MetricTile, PageHeader, Panel, StatusPill } from "@/components/ui";

export const dynamic = "force-dynamic";

const compactNumber = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export default async function AlertsPage() {
  const [rules, events] = await Promise.all([
    prisma.alertRule.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.alertEvent.findMany({
      include: { rule: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);
  const enabledRules = rules.filter((rule) => rule.enabled).length;
  const unreadEvents = events.filter((event) => !event.readAt).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Alerts"
        description="Local monitoring rules and triggered events. MVP notifications stay in-app and never touch private keys."
        action={<MarkAllAlertsReadButton disabled={unreadEvents === 0} />}
      />

      <div className="grid gap-3 md:grid-cols-3">
        <MetricTile
          label="Rules"
          value={String(rules.length)}
          detail={`${enabledRules} enabled`}
          icon={ShieldCheck}
          tone="blue"
        />
        <MetricTile
          label="Events"
          value={String(events.length)}
          detail="Recent local history"
          icon={BellRing}
          tone="amber"
        />
        <MetricTile
          label="Unread"
          value={String(unreadEvents)}
          detail="Notification center"
          icon={Bell}
          tone="rose"
        />
      </div>

      <Panel title="Add Alert Rule" eyebrow="Local monitor">
        <AlertRuleForm />
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Rules" eyebrow="Evaluation engine">
          <div className="divide-y divide-[#d8e0ec]/70 dark:divide-[#223047]/80">
            {rules.length === 0 ? (
              <div className="py-8 text-sm text-[#64706b] dark:text-[#9aa39e]">
                No alert rules configured.
              </div>
            ) : (
              rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="font-medium">{rule.name}</div>
                    <div className="mt-1 text-sm text-[#64706b] dark:text-[#9aa39e]">
                      {rule.type}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rule.thresholdUsd ? (
                      <StatusPill tone="warn">
                        ${compactNumber.format(rule.thresholdUsd)}
                      </StatusPill>
                    ) : null}
                    <StatusPill tone={rule.enabled ? "good" : "neutral"}>
                      {rule.enabled ? "Enabled" : "Paused"}
                    </StatusPill>
                    <AlertRuleActions ruleId={rule.id} enabled={rule.enabled} />
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Events" eyebrow="Triggered alerts">
          <div className="divide-y divide-[#d8e0ec]/70 dark:divide-[#223047]/80">
            {events.length === 0 ? (
              <div className="py-8 text-sm text-[#64706b] dark:text-[#9aa39e]">
                No events yet.
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-medium">{event.title}</div>
                      <div className="mt-1 text-sm leading-6 text-[#64706b] dark:text-[#9aa39e]">
                        {event.message}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <StatusPill tone={event.readAt ? "neutral" : "warn"}>
                        {event.readAt ? "Read" : "Unread"}
                      </StatusPill>
                      <AlertEventActions
                        eventId={event.id}
                        read={Boolean(event.readAt)}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-[#748079] dark:text-[#87938c]">
                    {formatDateTimeUtc(event.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
