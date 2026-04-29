import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks, projects } from "@/lib/db/schema";
import { serializeTask } from "@/lib/db/serializers";
import { TasksBoard } from "@/components/tasks/tasks-board";

export const dynamic = "force-dynamic";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [taskRows, projectRows] = await Promise.all([
    db.select().from(tasks).orderBy(asc(tasks.status), asc(tasks.position)),
    db
      .select({ id: projects.id, name: projects.name, color: projects.color })
      .from(projects)
      .where(eq(projects.status, "active"))
      .orderBy(asc(projects.name)),
  ]);
  const initialTasks = taskRows.map(serializeTask);
  const params = await searchParams;
  return (
    <TasksBoard
      initialTasks={initialTasks}
      initialFilter={params.status ?? null}
      projects={projectRows.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color ?? "#2E5A87",
      }))}
    />
  );
}
