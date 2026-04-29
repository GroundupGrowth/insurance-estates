import { startOfWeek, endOfWeek } from "date-fns";
import { gte, lte, and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks, projects } from "@/lib/db/schema";
import { serializeTask } from "@/lib/db/serializers";
import { TodayCard } from "@/components/dashboard/today-card";
import { ProgressDonut } from "@/components/dashboard/progress-donut";
import { KpiRow } from "@/components/dashboard/kpi-row";
import { getGreeting } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const [allRows, weekRows, activeProjectsRows] = await Promise.all([
    db.select().from(tasks),
    db
      .select()
      .from(tasks)
      .where(and(gte(tasks.updatedAt, weekStart), lte(tasks.updatedAt, weekEnd))),
    db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.status, "active")),
  ]);

  const allTasks = allRows.map(serializeTask);
  const week = weekRows.map(serializeTask);

  const todayList = allTasks
    .filter(
      (t) =>
        t.status !== "done" &&
        (t.due_date === todayIso ||
          ((t.status === "todo" || t.status === "in_progress") &&
            t.priority === "high")),
    )
    .sort((a, b) => {
      const ap = a.priority === "high" ? 0 : a.priority === "medium" ? 1 : 2;
      const bp = b.priority === "high" ? 0 : b.priority === "medium" ? 1 : 2;
      return ap - bp;
    })
    .slice(0, 8);

  const weekTotal = week.length;
  const weekDone = week.filter((t) => t.status === "done").length;
  const pct = weekTotal === 0 ? 0 : Math.round((weekDone / weekTotal) * 100);

  const openTasks = allTasks.filter((t) =>
    ["backlog", "todo"].includes(t.status),
  ).length;
  const inProgress = allTasks.filter((t) =>
    ["in_progress", "review"].includes(t.status),
  ).length;
  const activeProjects = activeProjectsRows.length;

  return (
    <div className="space-y-6">
      <KpiRow
        tiles={[
          {
            label: "Open tasks",
            value: openTasks,
            href: "/tasks?status=todo",
            accent: "#A8345C",
          },
          {
            label: "In progress",
            value: inProgress,
            href: "/tasks?status=in_progress",
            accent: "#D8A24A",
          },
          {
            label: "Done this week",
            value: weekDone,
            accent: "#3F6E3A",
          },
          {
            label: "Active projects",
            value: activeProjects,
            href: "/projects",
            accent: "#2E5A87",
          },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-8">
          <h1 className="text-[32px] md:text-[36px] font-semibold tracking-tight leading-tight">
            {getGreeting(today)}
          </h1>
          <p className="mt-1 text-sm text-app-muted">
            {todayList.length > 0
              ? "Here's what to focus on today."
              : "Nothing urgent. Pick something from the board."}
          </p>
          <div className="mt-6">
            <TodayCard tasks={todayList} />
          </div>
        </Card>

        <Card className="md:col-span-4 flex flex-col items-center justify-center">
          <ProgressDonut percent={pct} />
          <p className="mt-3 text-xs text-app-muted">this week</p>
          <p className="mt-1 text-xs text-app-muted text-center">
            {weekDone} of {weekTotal} task{weekTotal === 1 ? "" : "s"} completed
          </p>
        </Card>
      </div>
    </div>
  );
}
