"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  projects,
  tasks,
  ideas,
  socialPosts,
  comments,
  activity,
} from "@/lib/db/schema";
import { getCurrentUser } from "@/stack";
import { serializeProject } from "@/lib/db/serializers";
import { logActivity } from "@/lib/db/activity";
import type { Project, ProjectStatus } from "@/lib/types";

async function requireUser() {
  return getCurrentUser();
}

export interface ProjectPatch {
  name?: string;
  topic?: string | null;
  description?: string | null;
  owner?: string | null;
  url?: string | null;
  color?: string;
  notes?: string | null;
  status?: ProjectStatus;
}

function patchToColumns(p: ProjectPatch) {
  const out: Record<string, unknown> = { updatedAt: new Date() };
  if (p.name !== undefined) out.name = p.name;
  if (p.topic !== undefined) out.topic = p.topic;
  if (p.description !== undefined) out.description = p.description;
  if (p.owner !== undefined) out.owner = p.owner;
  if (p.url !== undefined) out.url = p.url;
  if (p.color !== undefined) out.color = p.color;
  if (p.notes !== undefined) out.notes = p.notes;
  if (p.status !== undefined) out.status = p.status;
  return out;
}

export async function createProject(input: {
  name: string;
  topic?: string | null;
  description?: string | null;
  owner?: string | null;
  url?: string | null;
  color?: string;
  notes?: string | null;
  status?: ProjectStatus;
}): Promise<Project> {
  const user = await requireUser();
  const [row] = await db
    .insert(projects)
    .values({
      name: input.name,
      topic: input.topic ?? null,
      description: input.description ?? null,
      owner: input.owner ?? null,
      url: input.url ?? null,
      color: input.color ?? "#2E5A87",
      notes: input.notes ?? null,
      status: input.status ?? "active",
    })
    .returning();
  await logActivity({
    parent_type: "project",
    parent_id: row.id,
    actor: user.primaryEmail,
    action: "created",
    meta: { name: row.name },
  });
  revalidatePath("/projects");
  return serializeProject(row);
}

export async function updateProject(id: string, patch: ProjectPatch): Promise<Project> {
  const user = await requireUser();
  const [before] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  const [row] = await db
    .update(projects)
    .set(patchToColumns(patch))
    .where(eq(projects.id, id))
    .returning();
  if (!row) throw new Error("Project not found");

  if (before && patch.status !== undefined && patch.status !== before.status) {
    await logActivity({
      parent_type: "project",
      parent_id: id,
      actor: user.primaryEmail,
      action: "status_changed",
      meta: { from: before.status, to: patch.status },
    });
  }
  if (before && patch.owner !== undefined && patch.owner !== before.owner) {
    await logActivity({
      parent_type: "project",
      parent_id: id,
      actor: user.primaryEmail,
      action: "owner_changed",
      meta: { from: before.owner, to: patch.owner },
    });
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return serializeProject(row);
}

export async function deleteProject(id: string): Promise<void> {
  await requireUser();
  // Detach any associated tasks/ideas/posts so they survive (but are unlinked).
  await Promise.all([
    db.update(tasks).set({ projectId: null }).where(eq(tasks.projectId, id)),
    db.update(ideas).set({ projectId: null }).where(eq(ideas.projectId, id)),
    db.update(socialPosts).set({ projectId: null }).where(eq(socialPosts.projectId, id)),
  ]);
  await db.delete(comments).where(and(eq(comments.parentType, "project"), eq(comments.parentId, id)));
  await db.delete(activity).where(and(eq(activity.parentType, "project"), eq(activity.parentId, id)));
  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
}
