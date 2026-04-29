"use client";

import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  format,
  isSameMonth,
  isSameDay,
  parseISO,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PostDrawer } from "@/components/socials/post-drawer";
import { SOCIAL_STATUS_TINT, PLATFORMS, PLATFORM_COLOR } from "@/lib/constants";
import {
  createSocialPost,
  updateSocialPost,
  deleteSocialPost,
} from "@/lib/actions/socials";
import type { SocialPlatform, SocialPost } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface CalendarBoardProps {
  posts: SocialPost[];
}

const PLATFORM_TAG: Record<SocialPlatform, string> = {
  instagram: "IG",
  facebook: "FB",
  youtube: "YT",
  linkedin: "LI",
};

const ALL = "__all__";

export function CalendarBoard({ posts: initialPosts }: CalendarBoardProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<SocialPost[]>(initialPosts);
  const [cursor, setCursor] = useState(new Date());
  const [filter, setFilter] = useState<SocialPlatform | typeof ALL>(ALL);

  // Picker state for "+ New post"
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingDate, setPendingDate] = useState<Date | null>(null);

  // Drawer state for editing/creating
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPlatform, setDrawerPlatform] = useState<SocialPlatform>("instagram");
  const [openPost, setOpenPost] = useState<Partial<SocialPost> | null>(null);

  const filtered = useMemo(
    () => (filter === ALL ? posts : posts.filter((p) => p.platform === filter)),
    [posts, filter],
  );

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const postsByDay = new Map<string, SocialPost[]>();
  for (const p of filtered) {
    if (!p.scheduled_for) continue;
    const key = format(parseISO(p.scheduled_for), "yyyy-MM-dd");
    if (!postsByDay.has(key)) postsByDay.set(key, []);
    postsByDay.get(key)!.push(p);
  }

  const weekdayHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const openPicker = (date: Date | null) => {
    setPendingDate(date);
    setPickerOpen(true);
  };

  const choosePlatform = (platform: SocialPlatform) => {
    const date = pendingDate;
    setPickerOpen(false);
    setPendingDate(null);

    let scheduled: string | null = null;
    if (date) {
      const d = new Date(date);
      d.setHours(9, 0, 0, 0);
      scheduled = d.toISOString();
    }

    setDrawerPlatform(platform);
    setOpenPost({
      platform,
      title: "",
      status: "idea",
      scheduled_for: scheduled,
    });
    setDrawerOpen(true);
  };

  const openExisting = (post: SocialPost) => {
    setDrawerPlatform(post.platform);
    setOpenPost(post);
    setDrawerOpen(true);
  };

  const persist = async (patch: Partial<SocialPost>) => {
    const id = openPost?.id;
    if (!id) {
      try {
        const created = await createSocialPost({
          platform: drawerPlatform,
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
        title="Calendar"
        description="Scheduled posts across every platform. Click a day or use New post to add."
        actions={
          <Button onClick={() => openPicker(null)}>
            <Plus size={16} strokeWidth={2} />
            New post
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter(ALL)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs transition-colors duration-150",
            filter === ALL
              ? "border-app-ink bg-app-active text-app-ink"
              : "border-app-border bg-white text-app-subtle hover:text-app-ink",
          )}
        >
          All
        </button>
        {PLATFORMS.map((p) => (
          <button
            key={p.value}
            onClick={() => setFilter(p.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors duration-150",
              filter === p.value
                ? "border-app-ink bg-app-active text-app-ink"
                : "border-app-border bg-white text-app-subtle hover:text-app-ink",
            )}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: PLATFORM_COLOR[p.value] }}
            />
            {p.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-app-border bg-white p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold tracking-tight">
            {format(cursor, "MMMM yyyy")}
          </h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCursor((d) => subMonths(d, 1))}
            >
              <ChevronLeft size={16} strokeWidth={1.75} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCursor(new Date())}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCursor((d) => addMonths(d, 1))}
            >
              <ChevronRight size={16} strokeWidth={1.75} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px text-[11px] uppercase tracking-wide text-app-muted">
          {weekdayHeaders.map((d) => (
            <div key={d} className="px-2 py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-app-border bg-app-border">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayPosts = postsByDay.get(key) ?? [];
            const inMonth = isSameMonth(day, cursor);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={key}
                className={cn(
                  "group relative flex flex-col items-stretch gap-1 bg-white p-2 text-left min-h-[88px]",
                  !inMonth && "bg-app-bg/60 text-app-muted",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isToday &&
                        "inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5B8A] text-white",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openPicker(day);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-app-muted hover:text-app-ink transition-opacity duration-150"
                    aria-label="Add post on this day"
                  >
                    <Plus size={12} strokeWidth={2} />
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  {dayPosts.slice(0, 3).map((p) => {
                    const tint = SOCIAL_STATUS_TINT[p.status];
                    return (
                      <button
                        key={p.id}
                        onClick={() => openExisting(p)}
                        className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-[10px] font-medium text-left hover:opacity-90"
                        style={{ backgroundColor: tint.bg, color: tint.text }}
                        title={`${p.platform}: ${p.title || "Untitled"}`}
                      >
                        <span
                          className="rounded-sm px-1 text-[9px] font-bold leading-none text-white tabular-nums"
                          style={{ backgroundColor: PLATFORM_COLOR[p.platform] }}
                        >
                          {PLATFORM_TAG[p.platform]}
                        </span>
                        <span className="truncate">{p.title || "Untitled"}</span>
                      </button>
                    );
                  })}
                  {dayPosts.length > 3 && (
                    <Link
                      href={`/socials/${dayPosts[0].platform}`}
                      className="text-[10px] text-app-muted hover:underline"
                    >
                      +{dayPosts.length - 3} more
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              New post{pendingDate ? ` · ${format(pendingDate, "MMM d")}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <p className="text-sm text-app-muted mb-3">Pick a platform.</p>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => choosePlatform(p.value)}
                  className="flex items-center gap-2 rounded-lg border border-app-border bg-white px-3 py-2 text-sm hover:bg-app-hover transition-colors duration-150"
                >
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: PLATFORM_COLOR[p.value] }}
                  />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PostDrawer
        open={drawerOpen}
        onOpenChange={(o) => {
          setDrawerOpen(o);
          if (!o) setOpenPost(null);
        }}
        platform={drawerPlatform}
        post={openPost}
        links={[]}
        onSave={persist}
        onDelete={openPost?.id ? remove : undefined}
      />
    </>
  );
}
