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
import { TASK_COLUMNS, PRIORITY_OPTIONS, ASSIGNEE_OPTIONS } from "@/lib/constants";
import type {
  Task,
  TaskPriority,
  TaskStatus,
  Assignee,
  Project,
  Comment,
  ActivityEvent,
} from "@/lib/types";
import { ActivityThread } from "@/components/shared/activity-thread";
import { fetchThread } from "@/lib/actions/comments";

const UNASSIGNED = "__unassigned__";
const NO_PROJECT = "__none__";

interface ProjectOption {
  id: string;
  name: string;
  color: string;
}

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Partial<Task> | null;
  projects: ProjectOption[];
  onSave: (patch: Partial<Task>) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  projects,
  onSave,
  onDelete,
}: TaskDialogProps) {
  const isNew = !task?.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assignee, setAssignee] = useState<Assignee | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [creating, setCreating] = useState(false);

  const [thread, setThread] = useState<{
    comments: Comment[];
    activity: ActivityEvent[];
  } | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title ?? "");
      setDescription(task.description ?? "");
      setStatus((task.status as TaskStatus) ?? "todo");
      setPriority((task.priority as TaskPriority) ?? "medium");
      setAssignee((task.assignee as Assignee | null) ?? null);
      setProjectId(task.project_id ?? null);
      setDueDate(task.due_date ?? "");
      setConfirmDelete(false);
      setCreating(false);
    }
  }, [task]);

  useEffect(() => {
    if (!open || !task?.id) {
      setThread(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const t = await fetchThread("task", task.id!);
        if (!cancelled) setThread(t);
      } catch {
        if (!cancelled) setThread({ comments: [], activity: [] });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, task?.id]);

  const flush = (patch: Partial<Task>) => {
    if (isNew) return;
    void onSave(patch);
  };

  const handleCreate = async () => {
    const t = title.trim();
    if (!t) return;
    setCreating(true);
    try {
      await onSave({
        title: t,
        description: description || null,
        status,
        priority,
        assignee,
        project_id: projectId,
        due_date: dueDate || null,
      });
      onOpenChange(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isNew ? "New task" : "Edit task"}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              autoFocus={isNew}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() =>
                !isNew &&
                title !== (task?.title ?? "") &&
                flush({ title })
              }
              onKeyDown={(e) => {
                if (isNew && e.key === "Enter") {
                  e.preventDefault();
                  void handleCreate();
                }
              }}
              placeholder="What needs doing?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              autosize
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() =>
                !isNew &&
                description !== (task?.description ?? "") &&
                flush({ description })
              }
              placeholder="More detail, links, acceptance criteria…"
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => {
                  const next = v as TaskStatus;
                  setStatus(next);
                  flush({ status: next });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_COLUMNS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => {
                  const next = v as TaskPriority;
                  setPriority(next);
                  flush({ priority: next });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select
                value={assignee ?? UNASSIGNED}
                onValueChange={(v) => {
                  const next = v === UNASSIGNED ? null : (v as Assignee);
                  setAssignee(next);
                  flush({ assignee: next });
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
              <Label>Project</Label>
              <Select
                value={projectId ?? NO_PROJECT}
                onValueChange={(v) => {
                  const next = v === NO_PROJECT ? null : v;
                  setProjectId(next);
                  flush({ project_id: next });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PROJECT}>No project</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                        {p.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-due">Due date</Label>
            <Input
              id="task-due"
              type="date"
              value={dueDate ?? ""}
              onChange={(e) => setDueDate(e.target.value)}
              onBlur={() =>
                !isNew &&
                (dueDate || null) !== (task?.due_date ?? null) &&
                flush({ due_date: dueDate || null })
              }
            />
          </div>

          {!isNew && task?.id && (
            <div className="space-y-2 border-t border-app-border pt-5">
              <Label className="text-xs uppercase tracking-wide text-app-muted">
                Activity
              </Label>
              {thread ? (
                <ActivityThread
                  parentType="task"
                  parentId={task.id}
                  initialComments={thread.comments}
                  initialActivity={thread.activity}
                />
              ) : (
                <p className="text-xs text-app-muted">Loading…</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {isNew ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={!title.trim() || creating}
              >
                {creating ? "Creating…" : "Create task"}
              </Button>
            </>
          ) : (
            <>
              {onDelete ? (
                confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-app-muted">Delete this task?</span>
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
