import { notFound } from "next/navigation";
import { eq, asc, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  socialPosts,
  socialLinks,
  socialChannels,
  socialCompetitors,
} from "@/lib/db/schema";
import {
  serializeSocialPost,
  serializeSocialLink,
  serializeSocialChannel,
  serializeSocialCompetitor,
} from "@/lib/db/serializers";
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

  const platformValue = platform as SocialPlatform;

  const [posts, channelRows, competitorRows] = await Promise.all([
    db
      .select()
      .from(socialPosts)
      .where(eq(socialPosts.platform, platformValue))
      .orderBy(asc(socialPosts.scheduledFor)),
    db
      .select()
      .from(socialChannels)
      .where(eq(socialChannels.platform, platformValue))
      .limit(1),
    db
      .select()
      .from(socialCompetitors)
      .where(eq(socialCompetitors.platform, platformValue))
      .orderBy(asc(socialCompetitors.position)),
  ]);

  const postIds = posts.map((r) => r.id);
  const linkRows = postIds.length
    ? await db.select().from(socialLinks).where(inArray(socialLinks.postId, postIds))
    : [];

  return (
    <SocialsView
      platform={platformValue}
      initialPosts={posts.map(serializeSocialPost)}
      initialLinks={linkRows.map(serializeSocialLink)}
      initialChannel={channelRows[0] ? serializeSocialChannel(channelRows[0]) : null}
      initialCompetitors={competitorRows.map(serializeSocialCompetitor)}
    />
  );
}
