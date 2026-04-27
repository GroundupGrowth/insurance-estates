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
import { TASK_COLUMNS, PRIORITY_OPTIONS } from "@/lib/constants";
import type { Task, TaskPriority, TaskStatus } from "@/lib/supabase/types";

interface TaskDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Partial<Task> | null;
  onSave: (patch: Partial<Task>) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}

export function TaskDrawer({ open, onOpenChange, task, onSave, onDelete }: TaskDrawerProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title ?? "");
      setDescription(task.description ?? "");
      setStatus((task.status as TaskStatus) ?? "todo");
      setPriority((task.priority as TaskPriority) ?? "medium");
      setDueDate(task.due_date ?? "");
      setConfirmDelete(false);
    }
  }, [task]);

  const flush = (patch: Partial<Task>) => {
    void onSave(patch);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="p-0">
        <SheetHeader>
          <SheetTitle>{task?.id ? "Edit task" : "New task"}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              autoFocus={!task?.id}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => title !== (task?.title ?? "") && flush({ title })}
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
                description !== (task?.description ?? "") && flush({ description })
              }
              placeholder="More detail, links, acceptance criteria…"
              className="min-h-[120px]"
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

          <div className="space-y-2">
            <Label htmlFor="task-due">Due date</Label>
            <Input
              id="task-due"
              type="date"
              value={dueDate ?? ""}
              onChange={(e) => setDueDate(e.target.value)}
              onBlur={() =>
                (dueDate || null) !== (task?.due_date ?? null) &&
                flush({ due_date: dueDate || null })
              }
            />
          </div>
        </div>

        {onDelete && task?.id && (
          <SheetFooter>
            {confirmDelete ? (
              <div className="flex w-full items-center justify-between gap-2">
                <span className="text-xs text-app-muted">Delete this task?</span>
                <div className="flex gap-2">
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
