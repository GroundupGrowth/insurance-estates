"use server";

import { revalidatePath } from "next/cache";
import { eq, and, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { comments, activity } from "@/lib/db/schema";
import { getCurrentUser } from "@/stack";
import { serializeComment } from "@/lib/db/serializers";
import type { Comment, ParentType } from "@/lib/types";

async function requireUser() {
  return getCurrentUser();
}

const revalidateFor = (parentType: ParentType, parentId: string) => {
  switch (parentType) {
    case "task":
      revalidatePath("/tasks");
      revalidatePath("/dashboard");
      break;
    case "project":
      revalidatePath("/projects");
      revalidatePath(`/projects/${parentId}`);
      break;
    case "idea":
      revalidatePath("/brainstorm");
      revalidatePath(`/brainstorm/${parentId}`);
      break;
    case "social_post":
      // Caller should also revalidate the platform path if it knows it.
      break;
  }
};

export async function createComment(input: {
  parent_type: ParentType;
  parent_id: string;
  body: string;
}): Promise<Comment> {
  const user = await requireUser();
  const trimmed = input.body.trim();
  if (!trimmed) throw new Error("Empty comment");
  const [row] = await db
    .insert(comments)
    .values({
      parentType: input.parent_type,
      parentId: input.parent_id,
      author: user.primaryEmail,
      body: trimmed,
    })
    .returning();
  await db.insert(activity).values({
    parentType: input.parent_type,
    parentId: input.parent_id,
    actor: user.primaryEmail,
    action: "commented",
  });
  revalidateFor(input.parent_type, input.parent_id);
  return serializeComment(row);
}

export async function deleteComment(id: string): Promise<void> {
  await requireUser();
  const [row] = await db
    .delete(comments)
    .where(eq(comments.id, id))
    .returning({ parentType: comments.parentType, parentId: comments.parentId });
  if (row) revalidateFor(row.parentType as ParentType, row.parentId);
}

export async function fetchThread(parentType: ParentType, parentId: string) {
  const [commentRows, activityRows] = await Promise.all([
    db
      .select()
      .from(comments)
      .where(and(eq(comments.parentType, parentType), eq(comments.parentId, parentId)))
      .orderBy(asc(comments.createdAt)),
    db
      .select()
      .from(activity)
      .where(and(eq(activity.parentType, parentType), eq(activity.parentId, parentId)))
      .orderBy(asc(activity.createdAt)),
  ]);
  return {
    comments: commentRows.map(serializeComment),
    activity: activityRows.map((r) => ({
      id: r.id,
      parent_type: r.parentType as ParentType,
      parent_id: r.parentId,
      actor: r.actor ?? null,
      action: r.action,
      meta: r.meta ? (JSON.parse(r.meta) as Record<string, unknown>) : null,
      created_at: r.createdAt?.toISOString() ?? new Date().toISOString(),
    })),
  };
}
