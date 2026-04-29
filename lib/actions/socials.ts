"use server";

import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  socialPosts,
  socialLinks,
  socialChannels,
  socialCompetitors,
} from "@/lib/db/schema";
import { getCurrentUser } from "@/stack";
import {
  serializeSocialPost,
  serializeSocialLink,
  serializeSocialChannel,
  serializeSocialCompetitor,
} from "@/lib/db/serializers";
import type {
  SocialPlatform,
  SocialPost,
  SocialStatus,
  SocialLink,
  SocialChannel,
  SocialCompetitor,
} from "@/lib/types";

async function requireUser() {
  return getCurrentUser();
}

export interface SocialPostPatch {
  title?: string;
  caption?: string | null;
  hook?: string | null;
  cta?: string | null;
  hashtags?: string | null;
  media_notes?: string | null;
  status?: SocialStatus;
  scheduled_for?: string | null;
}

function patchToColumns(p: SocialPostPatch) {
  const out: Record<string, unknown> = { updatedAt: new Date() };
  if (p.title !== undefined) out.title = p.title;
  if (p.caption !== undefined) out.caption = p.caption;
  if (p.hook !== undefined) out.hook = p.hook;
  if (p.cta !== undefined) out.cta = p.cta;
  if (p.hashtags !== undefined) out.hashtags = p.hashtags;
  if (p.media_notes !== undefined) out.mediaNotes = p.media_notes;
  if (p.status !== undefined) out.status = p.status;
  if (p.scheduled_for !== undefined) {
    out.scheduledFor = p.scheduled_for ? new Date(p.scheduled_for) : null;
  }
  return out;
}

export async function createSocialPost(input: {
  platform: SocialPlatform;
  title: string;
  caption?: string | null;
  hook?: string | null;
  cta?: string | null;
  hashtags?: string | null;
  media_notes?: string | null;
  status?: SocialStatus;
  scheduled_for?: string | null;
}): Promise<SocialPost> {
  await requireUser();
  const [row] = await db
    .insert(socialPosts)
    .values({
      platform: input.platform,
      title: input.title,
      caption: input.caption ?? null,
      hook: input.hook ?? null,
      cta: input.cta ?? null,
      hashtags: input.hashtags ?? null,
      mediaNotes: input.media_notes ?? null,
      status: input.status ?? "idea",
      scheduledFor: input.scheduled_for ? new Date(input.scheduled_for) : null,
    })
    .returning();

  revalidatePath(`/socials/${input.platform}`);
  return serializeSocialPost(row);
}

export async function updateSocialPost(
  id: string,
  patch: SocialPostPatch,
): Promise<SocialPost> {
  await requireUser();
  const [row] = await db
    .update(socialPosts)
    .set(patchToColumns(patch))
    .where(eq(socialPosts.id, id))
    .returning();
  if (!row) throw new Error("Post not found");
  revalidatePath(`/socials/${row.platform}`);
  return serializeSocialPost(row);
}

export async function deleteSocialPost(id: string): Promise<void> {
  await requireUser();
  const [row] = await db
    .delete(socialPosts)
    .where(eq(socialPosts.id, id))
    .returning({ platform: socialPosts.platform });
  if (row) revalidatePath(`/socials/${row.platform}`);
}

export async function createSocialLink(input: {
  post_id: string;
  url: string;
  label?: string | null;
}): Promise<SocialLink> {
  await requireUser();
  const [row] = await db
    .insert(socialLinks)
    .values({
      postId: input.post_id,
      url: input.url,
      label: input.label ?? null,
    })
    .returning();
  const [post] = await db
    .select({ platform: socialPosts.platform })
    .from(socialPosts)
    .where(eq(socialPosts.id, input.post_id))
    .limit(1);
  if (post) revalidatePath(`/socials/${post.platform}`);
  return serializeSocialLink(row);
}

export async function deleteSocialLink(id: string): Promise<void> {
  await requireUser();
  const [row] = await db
    .delete(socialLinks)
    .where(eq(socialLinks.id, id))
    .returning({ postId: socialLinks.postId });
  if (!row) return;
  const [post] = await db
    .select({ platform: socialPosts.platform })
    .from(socialPosts)
    .where(eq(socialPosts.id, row.postId))
    .limit(1);
  if (post) revalidatePath(`/socials/${post.platform}`);
}

export interface SocialChannelPatch {
  drive_url?: string | null;
  account_url?: string | null;
  notes?: string | null;
}

export async function upsertSocialChannel(
  platform: SocialPlatform,
  patch: SocialChannelPatch,
): Promise<SocialChannel> {
  await requireUser();
  const values = {
    platform,
    driveUrl: patch.drive_url ?? null,
    accountUrl: patch.account_url ?? null,
    notes: patch.notes ?? null,
    updatedAt: new Date(),
  };
  const [row] = await db
    .insert(socialChannels)
    .values(values)
    .onConflictDoUpdate({
      target: socialChannels.platform,
      set: {
        driveUrl: values.driveUrl,
        accountUrl: values.accountUrl,
        notes: values.notes,
        updatedAt: values.updatedAt,
      },
    })
    .returning();
  revalidatePath(`/socials/${platform}`);
  return serializeSocialChannel(row);
}

export async function createCompetitor(input: {
  platform: SocialPlatform;
  name: string;
  url?: string | null;
  notes?: string | null;
}): Promise<SocialCompetitor> {
  await requireUser();
  const last = await db
    .select({ position: socialCompetitors.position })
    .from(socialCompetitors)
    .where(eq(socialCompetitors.platform, input.platform))
    .orderBy(desc(socialCompetitors.position))
    .limit(1);
  const position = (last[0]?.position ?? -1) + 1;
  const [row] = await db
    .insert(socialCompetitors)
    .values({
      platform: input.platform,
      name: input.name,
      url: input.url ?? null,
      notes: input.notes ?? null,
      position,
    })
    .returning();
  revalidatePath(`/socials/${input.platform}`);
  return serializeSocialCompetitor(row);
}

export async function updateCompetitor(
  id: string,
  patch: { name?: string; url?: string | null; notes?: string | null },
): Promise<SocialCompetitor> {
  await requireUser();
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.url !== undefined) update.url = patch.url;
  if (patch.notes !== undefined) update.notes = patch.notes;
  const [row] = await db
    .update(socialCompetitors)
    .set(update)
    .where(eq(socialCompetitors.id, id))
    .returning();
  if (!row) throw new Error("Competitor not found");
  revalidatePath(`/socials/${row.platform}`);
  return serializeSocialCompetitor(row);
}

export async function deleteCompetitor(id: string): Promise<void> {
  await requireUser();
  const [row] = await db
    .delete(socialCompetitors)
    .where(eq(socialCompetitors.id, id))
    .returning({ platform: socialCompetitors.platform });
  if (row) revalidatePath(`/socials/${row.platform}`);
}
