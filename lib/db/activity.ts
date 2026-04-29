import "server-only";
import { db } from "@/lib/db";
import { activity } from "@/lib/db/schema";
import type { ParentType } from "@/lib/types";

export async function logActivity(input: {
  parent_type: ParentType;
  parent_id: string;
  actor: string | null;
  action: string;
  meta?: Record<string, unknown> | null;
}): Promise<void> {
  await db.insert(activity).values({
    parentType: input.parent_type,
    parentId: input.parent_id,
    actor: input.actor,
    action: input.action,
    meta: input.meta ? JSON.stringify(input.meta) : null,
  });
}
