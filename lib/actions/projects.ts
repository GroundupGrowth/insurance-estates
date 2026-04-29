"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { getCurrentUser } from "@/stack";
import { serializeProject } from "@/lib/db/serializers";
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
  await requireUser();
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
  revalidatePath("/projects");
  return serializeProject(row);
}

export async function updateProject(id: string, patch: ProjectPatch): Promise<Project> {
  await requireUser();
  const [row] = await db
    .update(projects)
    .set(patchToColumns(patch))
    .where(eq(projects.id, id))
    .returning();
  if (!row) throw new Error("Project not found");
  revalidatePath("/projects");
  return serializeProject(row);
}

export async function deleteProject(id: string): Promise<void> {
  await requireUser();
  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath("/projects");
}
