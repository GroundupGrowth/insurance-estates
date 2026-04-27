"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IDEA_STATUSES } from "@/lib/constants";
import type { Idea, IdeaLink, IdeaStatus } from "@/lib/types";
import {
  updateIdea,
  deleteIdea,
  createIdeaLink,
  deleteIdeaLink,
} from "@/lib/actions/ideas";
import { toast } from "@/components/ui/use-toast";

interface Props {
  initialIdea: Idea;
  initialLinks: IdeaLink[];
}

export function IdeaEditor({ initialIdea, initialLinks }: Props) {
  const router = useRouter();
  const [idea, setIdea] = useState<Idea>(initialIdea);
  const [links, setLinks] = useState<IdeaLink[]>(initialLinks);
  const [editingTitle, setEditingTitle] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const persist = async (patch: Partial<Idea>) => {
    setIdea((cur) => ({ ...cur, ...patch }));
    try {
      await updateIdea(idea.id, {
        title: patch.title,
        body: patch.body,
        status: patch.status ?? undefined,
        tags: patch.tags,
      });
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  const addTag = (raw: string) => {
    const tag = raw.trim().toLowerCase();
    if (!tag) return;
    if (idea.tags.includes(tag)) return;
    persist({ tags: [...idea.tags, tag] });
  };

  const removeTag = (tag: string) => {
    persist({ tags: idea.tags.filter((t) => t !== tag) });
  };

  const onTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
      setTagInput("");
    }
  };

  const addLink = async () => {
    const url = linkInput.trim();
    if (!url) return;
    const labelOverride = linkLabel.trim() || null;

    let label = labelOverride;
    if (!label) {
      try {
        const res = await fetch("/api/link-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const json = await res.json();
        label = json.title ?? null;
      } catch {
        label = null;
      }
    }

    try {
      const created = await createIdeaLink({ idea_id: idea.id, url, label });
      setLinks((cur) => [...cur, created]);
      setLinkInput("");
      setLinkLabel("");
    } catch {
      toast({ title: "Couldn't add link", variant: "destructive" });
    }
  };

  const removeLink = async (id: string) => {
    const prev = links;
    setLinks((cur) => cur.filter((l) => l.id !== id));
    try {
      await deleteIdeaLink(id);
    } catch {
      toast({ title: "Couldn't remove link", variant: "destructive" });
      setLinks(prev);
    }
  };

  const removeIdea = async () => {
    try {
      await deleteIdea(idea.id);
      router.push("/brainstorm");
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const hostnameOf = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  };

  return (
    <div className="max-w-3xl">
      <Link
        href="/brainstorm"
        className="inline-flex items-center gap-1 text-xs text-app-muted hover:text-app-ink mb-4"
      >
        <ArrowLeft size={14} strokeWidth={1.75} />
        Back to brainstorm
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        {editingTitle ? (
          <Input
            autoFocus
            defaultValue={idea.title}
            onBlur={(e) => {
              const v = e.target.value.trim() || "Untitled idea";
              persist({ title: v });
              setEditingTitle(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") setEditingTitle(false);
            }}
            className="text-[28px] md:text-[32px] font-semibold tracking-tight px-2 py-1 h-auto"
          />
        ) : (
          <h1
            onClick={() => setEditingTitle(true)}
            className="text-[28px] md:text-[32px] font-semibold tracking-tight cursor-text rounded-md px-2 py-1 -mx-2 hover:bg-app-hover transition-colors duration-150"
          >
            {idea.title}
          </h1>
        )}
        <div className="shrink-0">
          <Select
            value={idea.status ?? "raw"}
            onValueChange={(v) => persist({ status: v as IdeaStatus })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {IDEA_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <section className="mb-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-app-muted">
          Tags
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {idea.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-app-active px-2 py-0.5 text-[11px] text-app-subtle"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="text-app-muted hover:text-app-ink"
                aria-label={`Remove tag ${tag}`}
              >
                <X size={10} strokeWidth={2} />
              </button>
            </span>
          ))}
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={onTagKey}
            onBlur={() => {
              if (tagInput.trim()) {
                addTag(tagInput);
                setTagInput("");
              }
            }}
            placeholder="Add tag, comma to confirm"
            className="w-48 h-8 text-xs"
          />
        </div>
      </section>

      <section className="mb-8">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-app-muted">
          Notes
        </p>
        <Tabs defaultValue="edit">
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="edit">
            <Textarea
              autosize
              defaultValue={idea.body ?? ""}
              onBlur={(e) =>
                e.target.value !== (idea.body ?? "") &&
                persist({ body: e.target.value })
              }
              placeholder="Markdown supported. Sketch the idea, why it matters, what it could become…"
              className="min-h-[280px]"
            />
          </TabsContent>
          <TabsContent value="preview">
            <div className="rounded-lg border border-app-border bg-white p-4 min-h-[280px] prose-sm">
              {idea.body ? (
                <div className="text-sm leading-relaxed text-app-ink [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_a]:underline [&_a]:text-app-ink [&_code]:bg-app-active [&_code]:px-1 [&_code]:rounded [&_blockquote]:border-l-2 [&_blockquote]:border-app-border [&_blockquote]:pl-3 [&_blockquote]:text-app-muted">
                  <ReactMarkdown>{idea.body}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-xs text-app-muted">Nothing to preview yet.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <section className="mb-10">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-app-muted">
          Links
        </p>
        <ul className="flex flex-col divide-y divide-app-border rounded-lg border border-app-border bg-white">
          {links.length === 0 && (
            <li className="px-4 py-3 text-xs text-app-muted">
              No links yet. Paste one below.
            </li>
          )}
          {links.map((l) => (
            <li key={l.id} className="flex items-center gap-3 px-4 py-3">
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
              <span className="text-[11px] text-app-muted truncate max-w-[200px]">
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
        <div className="mt-3 flex flex-col md:flex-row gap-2">
          <Input
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addLink();
              }
            }}
            placeholder="Paste a URL…"
            className="md:flex-1"
          />
          <Input
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
            placeholder="Optional label"
            className="md:w-48"
          />
          <Button variant="secondary" onClick={addLink} disabled={!linkInput.trim()}>
            Add
          </Button>
        </div>
      </section>

      <div className="border-t border-app-border pt-6">
        {confirmDelete ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[#F5DCDC] bg-[#FCEDED] px-4 py-3">
            <p className="text-sm text-[#8A3A3A]">
              Delete this idea and its links permanently?
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={removeIdea}>
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={14} strokeWidth={1.75} />
            Delete idea
          </Button>
        )}
      </div>
    </div>
  );
}
