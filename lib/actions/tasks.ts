"use server";

import { revalidatePath } from "next/cache";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { getCurrentUser } from "@/stack";
import { serializeTask } from "@/lib/db/serializers";
import type {
  Task,
  TaskPriority,
  TaskStatus,
  Assignee,
} from "@/lib/types";

async function requireUser() {
  return getCurrentUser();
}

export interface TaskPatch {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority | null;
  assignee?: Assignee | null;
  due_date?: string | null;
  position?: number;
}

function patchToColumns(p: TaskPatch) {
  const out: Record<string, unknown> = { updatedAt: new Date() };
  if (p.title !== undefined) out.title = p.title;
  if (p.description !== undefined) out.description = p.description;
  if (p.status !== undefined) out.status = p.status;
  if (p.priority !== undefined) out.priority = p.priority;
  if (p.assignee !== undefined) out.assignee = p.assignee;
  if (p.due_date !== undefined) out.dueDate = p.due_date;
  if (p.position !== undefined) out.position = p.position;
  return out;
}

export async function createTask(input: {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority?: TaskPriority | null;
  assignee?: Assignee | null;
  due_date?: string | null;
  position?: number;
}): Promise<Task> {
  await requireUser();

  let position = input.position;
  if (position === undefined) {
    const last = await db
      .select({ position: tasks.position })
      .from(tasks)
      .where(eq(tasks.status, input.status))
      .orderBy(desc(tasks.position))
      .limit(1);
    position = (last[0]?.position ?? -1) + 1;
  }

  const [row] = await db
    .insert(tasks)
    .values({
      title: input.title,
      description: input.description ?? null,
      status: input.status,
      priority: input.priority ?? "medium",
      assignee: input.assignee ?? null,
      dueDate: input.due_date ?? null,
      position,
    })
    .returning();

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return serializeTask(row);
}

export async function updateTask(id: string, patch: TaskPatch): Promise<Task> {
  await requireUser();
  const [row] = await db
    .update(tasks)
    .set(patchToColumns(patch))
    .where(eq(tasks.id, id))
    .returning();
  if (!row) throw new Error("Task not found");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return serializeTask(row);
}

export async function deleteTask(id: string): Promise<void> {
  await requireUser();
  await db.delete(tasks).where(eq(tasks.id, id));
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function reorderTasks(
  updates: Array<{ id: string; status: TaskStatus; position: number }>,
): Promise<void> {
  await requireUser();
  if (updates.length === 0) return;

  await Promise.all(
    updates.map((u) =>
      db
        .update(tasks)
        .set({ status: u.status, position: u.position, updatedAt: new Date() })
        .where(eq(tasks.id, u.id)),
    ),
  );

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function markTaskDone(id: string): Promise<void> {
  await requireUser();
  await db
    .update(tasks)
    .set({ status: "done", updatedAt: new Date() })
    .where(and(eq(tasks.id, id)));
  revalidatePath("/dashboard");
  revalidatePath("/tasks");
}
