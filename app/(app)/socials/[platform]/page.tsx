import { notFound } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { socialPosts } from "@/lib/db/schema";
import { serializeSocialPost } from "@/lib/db/serializers";
import { SocialsView } from "@/components/socials/socials-view";
import { PLATFORMS } from "@/lib/constants";
import type { SocialPlatform } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SocialsPlatformPage({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const { platform } = await params;
  if (!PLATFORMS.some((p) => p.value === platform)) notFound();

  const rows = await db
    .select()
    .from(socialPosts)
    .where(eq(socialPosts.platform, platform as SocialPlatform))
    .orderBy(asc(socialPosts.scheduledFor));

  return (
    <SocialsView
      platform={platform as SocialPlatform}
      initialPosts={rows.map(serializeSocialPost)}
    />
  );
}
