"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ListView } from "./list-view";
import { PostDrawer } from "./post-drawer";
import { PlatformOverview } from "./platform-overview";
import {
  createSocialPost,
  updateSocialPost,
  deleteSocialPost,
} from "@/lib/actions/socials";
import { PLATFORMS, PLATFORM_COLOR } from "@/lib/constants";
import type {
  SocialPlatform,
  SocialPost,
  SocialLink,
  SocialChannel,
  SocialCompetitor,
} from "@/lib/types";
import { toast } from "@/components/ui/use-toast";

interface SocialsViewProps {
  platform: SocialPlatform;
  initialPosts: SocialPost[];
  initialLinks: SocialLink[];
  initialChannel: SocialChannel | null;
  initialCompetitors: SocialCompetitor[];
}

export function SocialsView({
  platform,
  initialPosts,
  initialLinks,
  initialChannel,
  initialCompetitors,
}: SocialsViewProps) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openPost, setOpenPost] = useState<Partial<SocialPost> | null>(null);

  const platformLabel =
    PLATFORMS.find((p) => p.value === platform)?.label ?? platform;

  const openExisting = (post: SocialPost) => {
    setOpenPost(post);
    setDrawerOpen(true);
  };

  const openNew = () => {
    setOpenPost({ platform, title: "", status: "idea" });
    setDrawerOpen(true);
  };

  const linksForOpenPost = openPost?.id
    ? initialLinks.filter((l) => l.post_id === openPost.id)
    : [];

  const persist = async (patch: Partial<SocialPost>) => {
    const id = openPost?.id;
    if (!id) {
      try {
        const created = await createSocialPost({
          platform,
          title: patch.title ?? openPost?.title ?? "Untitled post",
          caption: patch.caption ?? openPost?.caption ?? null,
          hook: patch.hook ?? openPost?.hook ?? null,
          cta: patch.cta ?? openPost?.cta ?? null,
          hashtags: patch.hashtags ?? openPost?.hashtags ?? null,
          media_notes: patch.media_notes ?? openPost?.media_notes ?? null,
          status: patch.status ?? openPost?.status ?? "idea",
          scheduled_for: patch.scheduled_for ?? openPost?.scheduled_for ?? null,
        });
        setPosts((cur) => [...cur, created]);
        setOpenPost(created);
      } catch {
        toast({ title: "Couldn't create post", variant: "destructive" });
      }
      return;
    }

    setPosts((cur) => cur.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    setOpenPost((cur) => (cur ? { ...cur, ...patch } : cur));
    try {
      await updateSocialPost(id, patch);
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
      router.refresh();
    }
  };

  const remove = async () => {
    const id = openPost?.id;
    if (!id) return;
    const prev = posts;
    setPosts((cur) => cur.filter((p) => p.id !== id));
    try {
      await deleteSocialPost(id);
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
      setPosts(prev);
    }
  };

  return (
    <>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: PLATFORM_COLOR[platform] }}
            />
            {platformLabel}
          </span>
        }
        description="Channel info, competitors, and the post idea board."
      />

      <Tabs defaultValue="overview">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ideas">Ideas</TabsTrigger>
          </TabsList>
          <Button onClick={openNew}>
            <Plus size={16} strokeWidth={2} />
            New post
          </Button>
        </div>

        <TabsContent value="overview">
          <PlatformOverview
            platform={platform}
            initialChannel={initialChannel}
            initialCompetitors={initialCompetitors}
          />
        </TabsContent>

        <TabsContent value="ideas">
          <ListView posts={posts} onOpen={openExisting} />
        </TabsContent>
      </Tabs>

      <PostDrawer
        open={drawerOpen}
        onOpenChange={(o) => {
          setDrawerOpen(o);
          if (!o) setOpenPost(null);
        }}
        platform={platform}
        post={openPost}
        links={linksForOpenPost}
        onSave={persist}
        onDelete={openPost?.id ? remove : undefined}
      />
    </>
  );
}
