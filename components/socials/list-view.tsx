"use client";

import { format, parseISO, startOfWeek } from "date-fns";
import { useMemo } from "react";
import { SOCIAL_STATUS_TINT } from "@/lib/constants";
import type { SocialPost } from "@/lib/supabase/types";
import { Empty } from "@/components/ui/empty";

interface ListViewProps {
  posts: SocialPost[];
  onOpen: (post: SocialPost) => void;
}

function weekKey(post: SocialPost) {
  const ref = post.scheduled_for ? parseISO(post.scheduled_for) : parseISO(post.created_at);
  return format(startOfWeek(ref, { weekStartsOn: 1 }), "yyyy-MM-dd");
}

export function ListView({ posts, onOpen }: ListViewProps) {
  const groups = useMemo(() => {
    const map = new Map<string, SocialPost[]>();
    for (const p of posts) {
      const k = weekKey(p);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(p);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [posts]);

  if (posts.length === 0) {
    return (
      <Empty
        title="No posts yet."
        description="Sketch a hook, drop the caption later. Schedule when you're ready."
      />
    );
  }

  return (
    <div className="space-y-6">
      {groups.map(([k, list]) => (
        <section key={k}>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-app-muted">
            Week of {format(parseISO(k), "MMM d, yyyy")}
          </h4>
          <ul className="rounded-2xl border border-app-border bg-white divide-y divide-app-border">
            {list
              .sort((a, b) => {
                const ad = a.scheduled_for ?? "";
                const bd = b.scheduled_for ?? "";
                return ad.localeCompare(bd);
              })
              .map((p) => {
                const tint = SOCIAL_STATUS_TINT[p.status];
                return (
                  <li
                    key={p.id}
                    onClick={() => onOpen(p)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 hover:bg-app-hover"
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: tint.chip }}
                    />
                    <span className="flex-1 truncate text-sm font-medium text-app-ink">
                      {p.title || "Untitled"}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                      style={{ backgroundColor: tint.bg, color: tint.text }}
                    >
                      {p.status}
                    </span>
                    <span className="text-[11px] text-app-muted shrink-0 w-32 text-right">
                      {p.scheduled_for
                        ? format(parseISO(p.scheduled_for), "EEE, MMM d · h:mm a")
                        : "Unscheduled"}
                    </span>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}
