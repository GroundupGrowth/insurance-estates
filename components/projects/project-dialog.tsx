"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ASSIGNEE_OPTIONS,
  PROJECT_STATUSES,
  PROJECT_COLOR_PRESETS,
} from "@/lib/constants";
import type { Assignee, Project, ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Partial<Project> | null;
  onSave: (patch: Partial<Project>) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}

const UNASSIGNED = "__unassigned__";

export function ProjectDialog({ open, onOpenChange, project, onSave, onDelete }: Props) {
  const isNew = !project?.id;

  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState<Assignee | null>(null);
  const [url, setUrl] = useState("");
  const [color, setColor] = useState<string>(PROJECT_COLOR_PRESETS[0]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("active");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      setName(project?.name ?? "");
      setTopic(project?.topic ?? "");
      setDescription(project?.description ?? "");
      setOwner((project?.owner as Assignee | null) ?? null);
      setUrl(project?.url ?? "");
      setColor(project?.color ?? PROJECT_COLOR_PRESETS[0]);
      setNotes(project?.notes ?? "");
      setStatus((project?.status as ProjectStatus) ?? "active");
      setConfirmDelete(false);
      setCreating(false);
    }
  }, [open, project]);

  const flush = (patch: Partial<Project>) => {
    if (isNew) return;
    void onSave(patch);
  };

  const handleCreate = async () => {
    const n = name.trim();
    if (!n) return;
    setCreating(true);
    try {
      await onSave({
        name: n,
        topic: topic.trim() || null,
        description: description.trim() || null,
        owner,
        url: url.trim() || null,
        color,
        notes: notes.trim() || null,
        status,
      });
      onOpenChange(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isNew ? "New project" : "Edit project"}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="proj-name">Name</Label>
            <Input
              id="proj-name"
              value={name}
              autoFocus={isNew}
              onChange={(e) => setName(e.target.value)}
              onBlur={() =>
                !isNew && name.trim() !== (project?.name ?? "") && flush({ name: name.trim() })
              }
              onKeyDown={(e) => {
                if (isNew && e.key === "Enter") {
                  e.preventDefault();
                  void handleCreate();
                }
              }}
              placeholder="What's the project called?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proj-topic">Topic</Label>
            <Input
              id="proj-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onBlur={() =>
                !isNew &&
                (topic.trim() || null) !== (project?.topic ?? null) &&
                flush({ topic: topic.trim() || null })
              }
              placeholder="One-line description of the topic this project covers"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proj-desc">Description</Label>
            <Textarea
              id="proj-desc"
              autosize
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() =>
                !isNew &&
                (description.trim() || null) !== (project?.description ?? null) &&
                flush({ description: description.trim() || null })
              }
              placeholder="A few sentences. Goals, scope, anything important."
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Owner</Label>
              <Select
                value={owner ?? UNASSIGNED}
                onValueChange={(v) => {
                  const next = v === UNASSIGNED ? null : (v as Assignee);
                  setOwner(next);
                  flush({ owner: next });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                  {ASSIGNEE_OPTIONS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => {
                  const next = v as ProjectStatus;
                  setStatus(next);
                  flush({ status: next });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proj-url">URL</Label>
            <Input
              id="proj-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() =>
                !isNew &&
                (url.trim() || null) !== (project?.url ?? null) &&
                flush({ url: url.trim() || null })
              }
              placeholder="https://…"
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setColor(c);
                    flush({ color: c });
                  }}
                  className={cn(
                    "h-7 w-7 rounded-full border transition-all duration-150",
                    color === c ? "border-app-ink ring-2 ring-app-ink/20" : "border-app-border",
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Pick color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proj-notes">Notes</Label>
            <Textarea
              id="proj-notes"
              autosize
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() =>
                !isNew &&
                (notes.trim() || null) !== (project?.notes ?? null) &&
                flush({ notes: notes.trim() || null })
              }
              placeholder="Internal notes, links, references…"
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          {isNew ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreate} disabled={!name.trim() || creating}>
                {creating ? "Creating…" : "Create project"}
              </Button>
            </>
          ) : (
            <>
              {onDelete ? (
                confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-app-muted">Delete this project?</span>
                    <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>
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
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 size={14} strokeWidth={1.75} />
                    Delete
                  </Button>
                )
              ) : (
                <span />
              )}
              <Button size="sm" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
