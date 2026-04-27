import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { serializeTask } from "@/lib/db/serializers";
import { TasksBoard } from "@/components/tasks/tasks-board";

export const dynamic = "force-dynamic";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const rows = await db
    .select()
    .from(tasks)
    .orderBy(asc(tasks.status), asc(tasks.position));
  const initialTasks = rows.map(serializeTask);
  const params = await searchParams;
  return <TasksBoard initialTasks={initialTasks} initialFilter={params.status ?? null} />;
}
