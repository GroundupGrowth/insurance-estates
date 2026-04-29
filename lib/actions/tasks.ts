"use server";

import { revalidatePath } from "next/cache";
import { eq, and, desc, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks, comments, activity } from "@/lib/db/schema";
import { getCurrentUser } from "@/stack";
import { serializeTask } from "@/lib/db/serializers";
import { logActivity } from "@/lib/db/activity";
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
  project_id?: string | null;
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
  if (p.project_id !== undefined) out.projectId = p.project_id;
  if (p.due_date !== undefined) out.dueDate = p.due_date;
  if (p.position !== undefined) out.position = p.position;
  return out;
}

const revalidateTaskPaths = (projectId: string | null | undefined) => {
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (projectId) revalidatePath(`/projects/${projectId}`);
};

export async function createTask(input: {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority?: TaskPriority | null;
  assignee?: Assignee | null;
  project_id?: string | null;
  due_date?: string | null;
  position?: number;
}): Promise<Task> {
  const user = await requireUser();

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
      projectId: input.project_id ?? null,
      dueDate: input.due_date ?? null,
      position,
    })
    .returning();

  await logActivity({
    parent_type: "task",
    parent_id: row.id,
    actor: user.primaryEmail,
    action: "created",
    meta: { title: row.title },
  });

  revalidateTaskPaths(row.projectId);
  return serializeTask(row);
}

export async function updateTask(id: string, patch: TaskPatch): Promise<Task> {
  const user = await requireUser();

  const [before] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  if (!before) throw new Error("Task not found");

  const [row] = await db
    .update(tasks)
    .set(patchToColumns(patch))
    .where(eq(tasks.id, id))
    .returning();
  if (!row) throw new Error("Task not found");

  if (patch.status !== undefined && patch.status !== before.status) {
    await logActivity({
      parent_type: "task",
      parent_id: id,
      actor: user.primaryEmail,
      action: "status_changed",
      meta: { from: before.status, to: patch.status },
    });
  }
  if (patch.assignee !== undefined && patch.assignee !== before.assignee) {
    await logActivity({
      parent_type: "task",
      parent_id: id,
      actor: user.primaryEmail,
      action: "assignee_changed",
      meta: { from: before.assignee, to: patch.assignee },
    });
  }
  if (patch.project_id !== undefined && patch.project_id !== before.projectId) {
    await logActivity({
      parent_type: "task",
      parent_id: id,
      actor: user.primaryEmail,
      action: "project_changed",
      meta: { from: before.projectId, to: patch.project_id },
    });
  }

  revalidateTaskPaths(row.projectId);
  if (before.projectId && before.projectId !== row.projectId) {
    revalidatePath(`/projects/${before.projectId}`);
  }
  return serializeTask(row);
}

export async function deleteTask(id: string): Promise<void> {
  await requireUser();
  const [row] = await db
    .delete(tasks)
    .where(eq(tasks.id, id))
    .returning({ projectId: tasks.projectId });
  await db.delete(comments).where(and(eq(comments.parentType, "task"), eq(comments.parentId, id)));
  await db.delete(activity).where(and(eq(activity.parentType, "task"), eq(activity.parentId, id)));
  revalidateTaskPaths(row?.projectId ?? null);
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

  // Revalidate any project pages whose tasks moved.
  const ids = updates.map((u) => u.id);
  const moved = await db
    .select({ projectId: tasks.projectId })
    .from(tasks)
    .where(inArray(tasks.id, ids));
  const projectIds = new Set(moved.map((m) => m.projectId).filter(Boolean) as string[]);
  for (const pid of projectIds) revalidatePath(`/projects/${pid}`);

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function markTaskDone(id: string): Promise<void> {
  const user = await requireUser();
  const [row] = await db
    .update(tasks)
    .set({ status: "done", updatedAt: new Date() })
    .where(and(eq(tasks.id, id)))
    .returning({ projectId: tasks.projectId });
  await logActivity({
    parent_type: "task",
    parent_id: id,
    actor: user.primaryEmail,
    action: "status_changed",
    meta: { to: "done" },
  });
  revalidateTaskPaths(row?.projectId ?? null);
}
