import { Bot, FileText, Link2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { MetricTile, PageHeader, Panel, StatusPill } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AiReportsPage() {
  const reports = await prisma.aiReport.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  const citationCount = reports.reduce((sum, report) => {
    try {
      return sum + JSON.parse(report.citationsJson).length;
    } catch {
      return sum;
    }
  }, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="AI Reports"
        description="Stored summaries designed to cite local database records instead of making unsupported market claims."
      />

      <div className="grid gap-3 md:grid-cols-3">
        <MetricTile label="Reports" value={String(reports.length)} detail="Stored locally" icon={FileText} tone="blue" />
        <MetricTile label="Citations" value={String(citationCount)} detail="Local data references" icon={Link2} />
        <MetricTile label="AI Mode" value="Ready" detail="Requires configured provider" icon={Bot} tone="amber" />
      </div>

      <Panel title="Report Library" eyebrow="Local summaries">
        <div className="divide-y divide-[#e2e6e1] dark:divide-[#25302b]">
          {reports.length === 0 ? (
            <div className="py-10 text-sm text-[#64706b] dark:text-[#9aa39e]">No reports yet.</div>
          ) : (
            reports.map((report) => (
              <article key={report.id} className="py-4">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                  <div>
                    <h2 className="font-semibold">{report.title}</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusPill tone="info">{report.subjectType}</StatusPill>
                      {report.model ? <StatusPill>{report.model}</StatusPill> : null}
                    </div>
                  </div>
                  <span className="text-xs text-[#748079] dark:text-[#87938c]">{report.createdAt.toLocaleString()}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#53605a] dark:text-[#a4ada7]">{report.content}</p>
              </article>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
