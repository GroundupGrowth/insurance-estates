"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SocialsTabs } from "./socials-tabs";
import { CalendarView } from "./calendar-view";
import { ListView } from "./list-view";
import { PostDrawer } from "./post-drawer";
import { createClient } from "@/lib/supabase/client";
import { PLATFORMS } from "@/lib/constants";
import type {
  SocialPlatform,
  SocialPost,
} from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface SocialsViewProps {
  platform: SocialPlatform;
  initialPosts: SocialPost[];
}

type Mode = "calendar" | "list";

export function SocialsView({ platform, initialPosts }: SocialsViewProps) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [mode, setMode] = useState<Mode>("calendar");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openPost, setOpenPost] = useState<Partial<SocialPost> | null>(null);

  const platformLabel =
    PLATFORMS.find((p) => p.value === platform)?.label ?? platform;

  const openExisting = (post: SocialPost) => {
    setOpenPost(post);
    setDrawerOpen(true);
  };

  const openNewForDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(9, 0, 0, 0);
    setOpenPost({
      platform,
      title: "",
      status: "idea",
      scheduled_for: d.toISOString(),
    });
    setDrawerOpen(true);
  };

  const openNew = () => {
    setOpenPost({ platform, title: "", status: "idea" });
    setDrawerOpen(true);
  };

  const persist = async (patch: Partial<SocialPost>) => {
    const id = openPost?.id;
    if (!id) {
      const insert = {
        platform,
        title: patch.title ?? openPost?.title ?? "Untitled post",
        caption: patch.caption ?? openPost?.caption ?? null,
        hook: patch.hook ?? openPost?.hook ?? null,
        cta: patch.cta ?? openPost?.cta ?? null,
        hashtags: patch.hashtags ?? openPost?.hashtags ?? null,
        media_notes: patch.media_notes ?? openPost?.media_notes ?? null,
        status: (patch.status ?? openPost?.status ?? "idea") as SocialPost["status"],
        scheduled_for:
          patch.scheduled_for ?? openPost?.scheduled_for ?? null,
      };
      const { data, error } = await supabase
        .from("social_posts")
        .insert(insert)
        .select()
        .single();
      if (error || !data) {
        toast({ title: "Couldn't create post", variant: "destructive" });
        return;
      }
      setPosts((cur) => [...cur, data as SocialPost]);
      setOpenPost(data as SocialPost);
      return;
    }

    setPosts((cur) =>
      cur.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
    setOpenPost((cur) => (cur ? { ...cur, ...patch } : cur));
    const { error } = await supabase
      .from("social_posts")
      .update(patch)
      .eq("id", id);
    if (error) {
      toast({ title: "Save failed", variant: "destructive" });
      router.refresh();
    }
  };

  const remove = async () => {
    const id = openPost?.id;
    if (!id) return;
    const prev = posts;
    setPosts((cur) => cur.filter((p) => p.id !== id));
    const { error } = await supabase.from("social_posts").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", variant: "destructive" });
      setPosts(prev);
    }
  };

  return (
    <>
      <PageHeader
        title="Socials"
        description={`Plan and draft ${platformLabel} posts. Pure planning — no posting, no analytics.`}
      />

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <SocialsTabs />
        <div className="flex items-center gap-2">
          <div className="inline-flex h-9 items-center rounded-lg border border-app-border bg-white p-1">
            <button
              onClick={() => setMode("calendar")}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150",
                mode === "calendar"
                  ? "bg-app-active text-app-ink"
                  : "text-app-subtle hover:text-app-ink",
              )}
            >
              <CalendarDays size={14} strokeWidth={1.75} />
              Calendar
            </button>
            <button
              onClick={() => setMode("list")}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150",
                mode === "list"
                  ? "bg-app-active text-app-ink"
                  : "text-app-subtle hover:text-app-ink",
              )}
            >
              <List size={14} strokeWidth={1.75} />
              List
            </button>
          </div>
          <Button onClick={openNew}>
            <Plus size={16} strokeWidth={2} />
            New post
          </Button>
        </div>
      </div>

      {mode === "calendar" ? (
        <CalendarView
          posts={posts}
          onOpen={openExisting}
          onCreateForDay={openNewForDay}
        />
      ) : (
        <ListView posts={posts} onOpen={openExisting} />
      )}

      <PostDrawer
        open={drawerOpen}
        onOpenChange={(o) => {
          setDrawerOpen(o);
          if (!o) setOpenPost(null);
        }}
        platform={platform}
        post={openPost}
        onSave={persist}
        onDelete={openPost?.id ? remove : undefined}
      />
    </>
  );
}
