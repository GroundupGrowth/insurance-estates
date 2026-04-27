import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SocialsView } from "@/components/socials/socials-view";
import { PLATFORMS } from "@/lib/constants";
import type { SocialPlatform, SocialPost } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function SocialsPlatformPage({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const { platform } = await params;
  if (!PLATFORMS.some((p) => p.value === platform)) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("social_posts")
    .select("*")
    .eq("platform", platform)
    .order("scheduled_for", { ascending: true, nullsFirst: false });

  return (
    <SocialsView
      platform={platform as SocialPlatform}
      initialPosts={(data ?? []) as SocialPost[]}
    />
  );
}
