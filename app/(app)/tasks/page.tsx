import { createClient } from "@/lib/supabase/server";
import { TasksBoard } from "@/components/tasks/tasks-board";
import type { Task } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .order("status")
    .order("position", { ascending: true });

  const initialTasks = (data ?? []) as Task[];
  const params = await searchParams;
  return <TasksBoard initialTasks={initialTasks} initialFilter={params.status ?? null} />;
}
