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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SOCIAL_STATUS_TINT, PLATFORMS } from "@/lib/constants";
import type { SocialPlatform, SocialPost } from "@/lib/types";
import { cn } from "@/lib/utils";

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

export function CalendarBoard({ posts }: CalendarBoardProps) {
  const [cursor, setCursor] = useState(new Date());
  const [filter, setFilter] = useState<SocialPlatform | typeof ALL>(ALL);

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

  return (
    <>
      <PageHeader
        title="Calendar"
        description="Scheduled social posts across every platform. Edit a post by clicking it."
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
              "rounded-full border px-3 py-1 text-xs transition-colors duration-150",
              filter === p.value
                ? "border-app-ink bg-app-active text-app-ink"
                : "border-app-border bg-white text-app-subtle hover:text-app-ink",
            )}
          >
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
                  "relative flex flex-col items-stretch gap-1 bg-white p-2 text-left min-h-[88px]",
                  !inMonth && "bg-app-bg/60 text-app-muted",
                )}
              >
                <span
                  className={cn(
                    "text-xs font-medium",
                    isToday &&
                      "inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5B8A] text-white",
                  )}
                >
                  {format(day, "d")}
                </span>
                <div className="flex flex-col gap-1">
                  {dayPosts.slice(0, 3).map((p) => {
                    const tint = SOCIAL_STATUS_TINT[p.status];
                    return (
                      <Link
                        key={p.id}
                        href={`/socials/${p.platform}`}
                        className="flex items-center gap-1 truncate rounded px-1.5 py-0.5 text-[10px] font-medium hover:opacity-90"
                        style={{ backgroundColor: tint.bg, color: tint.text }}
                        title={p.title || "Untitled"}
                      >
                        <span className="font-bold tabular-nums">
                          {PLATFORM_TAG[p.platform]}
                        </span>
                        <span className="truncate">{p.title || "Untitled"}</span>
                      </Link>
                    );
                  })}
                  {dayPosts.length > 3 && (
                    <span className="text-[10px] text-app-muted">
                      +{dayPosts.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
