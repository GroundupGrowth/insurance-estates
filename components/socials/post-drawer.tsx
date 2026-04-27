"use client";

import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
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
  SocialLink,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { createSocialLink, deleteSocialLink } from "@/lib/actions/socials";
import { toast } from "@/components/ui/use-toast";

interface PostDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: SocialPlatform;
  post: Partial<SocialPost> | null;
  links: SocialLink[];
  onSave: (patch: Partial<SocialPost>) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}

const hostnameOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

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
  links,
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
  const [linkRows, setLinkRows] = useState<SocialLink[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [linkLabel, setLinkLabel] = useState("");

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
      setLinkRows(links);
      setLinkInput("");
      setLinkLabel("");
    }
  }, [post, links]);

  const addLink = async () => {
    const url = linkInput.trim();
    if (!url || !post?.id) return;
    try {
      const created = await createSocialLink({
        post_id: post.id,
        url,
        label: linkLabel.trim() || null,
      });
      setLinkRows((cur) => [...cur, created]);
      setLinkInput("");
      setLinkLabel("");
    } catch {
      toast({ title: "Couldn't add link", variant: "destructive" });
    }
  };

  const removeLink = async (id: string) => {
    const prev = linkRows;
    setLinkRows((cur) => cur.filter((l) => l.id !== id));
    try {
      await deleteSocialLink(id);
    } catch {
      toast({ title: "Couldn't remove link", variant: "destructive" });
      setLinkRows(prev);
    }
  };

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

          <div className="space-y-2">
            <Label>Links</Label>
            {post?.id ? (
              <>
                <ul className="flex flex-col divide-y divide-app-border rounded-lg border border-app-border bg-white">
                  {linkRows.length === 0 && (
                    <li className="px-3 py-2 text-xs text-app-muted">
                      No links yet. Paste one below.
                    </li>
                  )}
                  {linkRows.map((l) => (
                    <li key={l.id} className="flex items-center gap-2 px-3 py-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${hostnameOf(l.url)}&sz=64`}
                        alt=""
                        width={16}
                        height={16}
                        className="rounded"
                      />
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 truncate text-sm text-app-ink hover:underline"
                      >
                        {l.label ?? hostnameOf(l.url)}
                      </a>
                      <span className="text-[11px] text-app-muted truncate max-w-[140px]">
                        {hostnameOf(l.url)}
                      </span>
                      <button
                        onClick={() => removeLink(l.id)}
                        className="text-app-muted hover:text-app-ink"
                        aria-label="Remove link"
                      >
                        <X size={14} strokeWidth={1.75} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col md:flex-row gap-2">
                  <Input
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void addLink();
                      }
                    }}
                    placeholder="Paste a URL…"
                    className="md:flex-1"
                  />
                  <Input
                    value={linkLabel}
                    onChange={(e) => setLinkLabel(e.target.value)}
                    placeholder="Optional label"
                    className="md:w-40"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={addLink}
                    disabled={!linkInput.trim()}
                  >
                    Add
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-xs text-app-muted">
                Save the post first, then attach links.
              </p>
            )}
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
