"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PLATFORMS, SOCIAL_STATUSES } from "@/lib/constants";
import type {
  SocialPlatform,
  SocialPost,
  SocialStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface PostDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: SocialPlatform;
  post: Partial<SocialPost> | null;
  onSave: (patch: Partial<SocialPost>) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}

const charLimit = (platform: SocialPlatform) =>
  PLATFORMS.find((p) => p.value === platform)?.charLimit ?? 0;

function toLocalInput(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const tzo = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzo).toISOString().slice(0, 16);
}

function fromLocalInput(local: string) {
  if (!local) return null;
  return new Date(local).toISOString();
}

export function PostDrawer({
  open,
  onOpenChange,
  platform,
  post,
  onSave,
  onDelete,
}: PostDrawerProps) {
  const [title, setTitle] = useState("");
  const [hook, setHook] = useState("");
  const [caption, setCaption] = useState("");
  const [cta, setCta] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [mediaNotes, setMediaNotes] = useState("");
  const [status, setStatus] = useState<SocialStatus>("idea");
  const [scheduledFor, setScheduledFor] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title ?? "");
      setHook(post.hook ?? "");
      setCaption(post.caption ?? "");
      setCta(post.cta ?? "");
      setHashtags(post.hashtags ?? "");
      setMediaNotes(post.media_notes ?? "");
      setStatus((post.status as SocialStatus) ?? "idea");
      setScheduledFor(toLocalInput(post.scheduled_for));
      setConfirmDelete(false);
    }
  }, [post]);

  const limit = charLimit(platform);
  const captionOver = caption.length > limit;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="p-0">
        <SheetHeader>
          <SheetTitle>{post?.id ? "Edit post" : "New post"}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="post-title">Working title</Label>
            <Input
              id="post-title"
              value={title}
              autoFocus={!post?.id}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => title !== (post?.title ?? "") && onSave({ title })}
              placeholder="Internal name for this post"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-hook">Hook</Label>
            <Input
              id="post-hook"
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              onBlur={() => hook !== (post?.hook ?? "") && onSave({ hook })}
              placeholder="The opening line"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-caption">Caption</Label>
            <Textarea
              id="post-caption"
              autosize
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              onBlur={() =>
                caption !== (post?.caption ?? "") && onSave({ caption })
              }
              placeholder="The actual post copy"
              className="min-h-[140px]"
            />
            <div
              className={cn(
                "text-[11px] text-app-muted text-right tabular-nums",
                captionOver && "text-[#8A3A3A]",
              )}
            >
              {caption.length} / {limit}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-cta">CTA</Label>
            <Input
              id="post-cta"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              onBlur={() => cta !== (post?.cta ?? "") && onSave({ cta })}
              placeholder="Link in bio, sign up, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-hashtags">Hashtags</Label>
            <Textarea
              id="post-hashtags"
              autosize
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              onBlur={() =>
                hashtags !== (post?.hashtags ?? "") && onSave({ hashtags })
              }
              placeholder="#whole_life #infinite_banking …"
              className="min-h-[60px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-media">Media notes</Label>
            <Textarea
              id="post-media"
              autosize
              value={mediaNotes}
              onChange={(e) => setMediaNotes(e.target.value)}
              onBlur={() =>
                mediaNotes !== (post?.media_notes ?? "") &&
                onSave({ media_notes: mediaNotes })
              }
              placeholder="Shoot vertical. B-roll of policy doc."
              className="min-h-[60px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => {
                  const next = v as SocialStatus;
                  setStatus(next);
                  onSave({ status: next });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOCIAL_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="post-sched">Scheduled for</Label>
              <Input
                id="post-sched"
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                onBlur={() => {
                  const next = fromLocalInput(scheduledFor);
                  if ((post?.scheduled_for ?? null) !== next) {
                    onSave({ scheduled_for: next });
                  }
                }}
              />
            </div>
          </div>
        </div>

        {onDelete && post?.id && (
          <SheetFooter>
            {confirmDelete ? (
              <div className="flex w-full items-center justify-between gap-2">
                <span className="text-xs text-app-muted">Delete this post?</span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      await onDelete();
                      onOpenChange(false);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                className="ml-auto"
              >
                <Trash2 size={14} strokeWidth={1.75} />
                Delete
              </Button>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
