"use client";

import { format, parseISO } from "date-fns";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/lib/types";
import { PriorityDot } from "./priority-dot";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onOpen: (task: Task) => void;
}

export function TaskCard({ task, onOpen }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? "transform 150ms ease",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Allow drag without immediately opening on accidental drag start.
        if (isDragging) return;
        // Only open on actual click events, not drag.
        if ((e.target as HTMLElement).closest("[data-no-open]")) return;
        onOpen(task);
      }}
      className={cn(
        "cursor-grab active:cursor-grabbing rounded-xl border border-app-border bg-white p-4 transition-all duration-150 hover:bg-app-hover",
        isDragging && "opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[15px] font-medium leading-snug text-app-ink line-clamp-2">
          {task.title}
        </p>
        <PriorityDot priority={task.priority} />
      </div>
      {task.description && (
        <p className="mt-1.5 text-xs text-app-muted line-clamp-1">{task.description}</p>
      )}
      {task.due_date && (
        <p className="mt-3 text-[11px] text-app-muted">
          {format(parseISO(task.due_date), "MMM d")}
        </p>
      )}
    </div>
  );
}
