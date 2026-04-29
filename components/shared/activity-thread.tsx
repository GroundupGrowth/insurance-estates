"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TASK_STATUS_LABEL } from "@/lib/constants";
import {
  createComment,
  deleteComment,
} from "@/lib/actions/comments";
import { toast } from "@/components/ui/use-toast";
import type {
  ActivityEvent,
  Comment,
  ParentType,
  TaskStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface ActivityThreadProps {
  parentType: ParentType;
  parentId: string;
  initialComments: Comment[];
  initialActivity: ActivityEvent[];
  className?: string;
}

const initialFromEmail = (email: string | null) => {
  if (!email) return "?";
  return email[0]?.toUpperCase() ?? "?";
};

const formatStatus = (val: unknown) => {
  if (typeof val !== "string") return String(val ?? "—");
  return TASK_STATUS_LABEL[val as TaskStatus] ?? val;
};

const summarizeEvent = (e: ActivityEvent) => {
  const meta = e.meta ?? {};
  switch (e.action) {
    case "created":
      return "created this";
    case "status_changed": {
      const from = meta.from ? formatStatus(meta.from) : null;
      const to = meta.to ? formatStatus(meta.to) : null;
      if (from && to) return `moved status from ${from} to ${to}`;
      if (to) return `set status to ${to}`;
      return "changed status";
    }
    case "assignee_changed":
      return `assigned to ${meta.to ?? "no one"}`;
    case "owner_changed":
      return `owner changed to ${meta.to ?? "no one"}`;
    case "project_changed":
      if (!meta.to) return "removed from a project";
      return "moved to another project";
    case "commented":
      return "commented";
    default:
      return e.action.replace(/_/g, " ");
  }
};

export function ActivityThread({
  parentType,
  parentId,
  initialComments,
  initialActivity,
  className,
}: ActivityThreadProps) {
  const [items, setItems] = useState<Comment[]>(initialComments);
  const [events, setEvents] = useState<ActivityEvent[]>(initialActivity);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    setItems(initialComments);
    setEvents(initialActivity);
  }, [initialComments, initialActivity]);

  const merged = useMemo(() => {
    type Row =
      | { kind: "comment"; ts: string; data: Comment }
      | { kind: "event"; ts: string; data: ActivityEvent };
    const rows: Row[] = [
      ...items.map((c) => ({ kind: "comment" as const, ts: c.created_at, data: c })),
      // Suppress "commented" events because the comment itself appears.
      ...events
        .filter((e) => e.action !== "commented")
        .map((e) => ({ kind: "event" as const, ts: e.created_at, data: e })),
    ];
    rows.sort((a, b) => a.ts.localeCompare(b.ts));
    return rows;
  }, [items, events]);

  const submit = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    setPosting(true);
    try {
      const created = await createComment({
        parent_type: parentType,
        parent_id: parentId,
        body: trimmed,
      });
      setItems((cur) => [...cur, created]);
      setBody("");
    } catch {
      toast({ title: "Couldn't post comment", variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const remove = async (id: string) => {
    const prev = items;
    setItems((cur) => cur.filter((c) => c.id !== id));
    try {
      await deleteComment(id);
    } catch {
      toast({ title: "Couldn't delete comment", variant: "destructive" });
      setItems(prev);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <ul className="flex flex-col gap-3">
        {merged.length === 0 && (
          <li className="text-xs text-app-muted">No activity yet.</li>
        )}
        {merged.map((row) =>
          row.kind === "comment" ? (
            <li key={`c-${row.data.id}`} className="flex gap-2">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-app-active text-[10px] font-semibold text-app-ink">
                {initialFromEmail(row.data.author)}
              </span>
              <div className="flex-1 rounded-lg border border-app-border bg-white px-3 py-2">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[11px] text-app-muted">
                    <span className="text-app-ink font-medium">
                      {row.data.author ?? "—"}
                    </span>{" "}
                    · {formatDistanceToNow(new Date(row.data.created_at), { addSuffix: true })}
                  </span>
                  <button
                    onClick={() => remove(row.data.id)}
                    className="text-app-muted hover:text-app-ink"
                    aria-label="Delete comment"
                  >
                    <X size={12} strokeWidth={1.75} />
                  </button>
                </div>
                <p className="whitespace-pre-wrap text-sm text-app-ink">
                  {row.data.body}
                </p>
              </div>
            </li>
          ) : (
            <li
              key={`a-${row.data.id}`}
              className="ml-8 text-[11px] text-app-muted italic"
            >
              <span className="text-app-subtle">{row.data.actor ?? "Someone"}</span>{" "}
              {summarizeEvent(row.data)}{" "}
              <span>· {formatDistanceToNow(new Date(row.data.created_at), { addSuffix: true })}</span>
            </li>
          ),
        )}
      </ul>

      <div className="flex flex-col gap-2">
        <Textarea
          value={body}
          autosize
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void submit();
            }
          }}
          placeholder="Add a comment… (⌘/Ctrl + Enter to post)"
          className="min-h-[60px]"
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={submit} disabled={!body.trim() || posting}>
            {posting ? "Posting…" : "Post comment"}
          </Button>
        </div>
      </div>
    </div>
  );
}
