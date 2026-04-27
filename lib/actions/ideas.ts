"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ideas, ideaLinks } from "@/lib/db/schema";
import { stackServerApp } from "@/stack";
import { isAllowedEmail } from "@/lib/db/queries";
import { serializeIdea, serializeIdeaLink } from "@/lib/db/serializers";
import type { Idea, IdeaLink, IdeaStatus } from "@/lib/types";

async function requireUser() {
  const user = await stackServerApp.getUser();
  if (!user) throw new Error("Not authenticated");
  if (!(await isAllowedEmail(user.primaryEmail))) {
    throw new Error("Not authorized");
  }
  return user;
}

export interface IdeaPatch {
  title?: string;
  body?: string | null;
  status?: IdeaStatus;
  tags?: string[];
}

function patchToColumns(p: IdeaPatch) {
  const out: Record<string, unknown> = { updatedAt: new Date() };
  if (p.title !== undefined) out.title = p.title;
  if (p.body !== undefined) out.body = p.body;
  if (p.status !== undefined) out.status = p.status;
  if (p.tags !== undefined) out.tags = p.tags;
  return out;
}

export async function createIdea(input?: {
  title?: string;
}): Promise<Idea> {
  await requireUser();
  const [row] = await db
    .insert(ideas)
    .values({ title: input?.title ?? "Untitled idea" })
    .returning();
  revalidatePath("/brainstorm");
  return serializeIdea(row);
}

export async function updateIdea(id: string, patch: IdeaPatch): Promise<Idea> {
  await requireUser();
  const [row] = await db
    .update(ideas)
    .set(patchToColumns(patch))
    .where(eq(ideas.id, id))
    .returning();
  if (!row) throw new Error("Idea not found");
  revalidatePath("/brainstorm");
  revalidatePath(`/brainstorm/${id}`);
  return serializeIdea(row);
}

export async function deleteIdea(id: string): Promise<void> {
  await requireUser();
  await db.delete(ideas).where(eq(ideas.id, id));
  revalidatePath("/brainstorm");
}

export async function createIdeaLink(input: {
  idea_id: string;
  url: string;
  label?: string | null;
}): Promise<IdeaLink> {
  await requireUser();
  const [row] = await db
    .insert(ideaLinks)
    .values({
      ideaId: input.idea_id,
      url: input.url,
      label: input.label ?? null,
    })
    .returning();
  revalidatePath(`/brainstorm/${input.idea_id}`);
  revalidatePath("/brainstorm");
  return serializeIdeaLink(row);
}

export async function deleteIdeaLink(id: string): Promise<void> {
  await requireUser();
  const [row] = await db
    .delete(ideaLinks)
    .where(eq(ideaLinks.id, id))
    .returning({ ideaId: ideaLinks.ideaId });
  if (row) revalidatePath(`/brainstorm/${row.ideaId}`);
}
