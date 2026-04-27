"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task, TaskStatus } from "@/lib/supabase/types";
import { TaskCard } from "./task-card";
import { cn } from "@/lib/utils";

interface TaskColumnProps {
  id: TaskStatus;
  label: string;
  tasks: Task[];
  onOpen: (task: Task) => void;
}

export function TaskColumn({ id, label, tasks, onOpen }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { columnId: id } });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-2xl border border-app-border bg-white p-6 transition-colors duration-150 min-w-[280px] w-[280px] md:w-auto md:min-w-0",
        isOver && "bg-app-hover",
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-app-ink">{label}</h3>
        <span className="rounded-full bg-app-active px-2 py-0.5 text-[11px] font-medium text-app-subtle">
          {tasks.length}
        </span>
      </div>
      <SortableContext
        id={id}
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 min-h-[60px]">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onOpen={onOpen} />
          ))}
          {tasks.length === 0 && (
            <p className="rounded-xl border border-dashed border-app-border px-3 py-4 text-center text-xs text-app-muted">
              Drop tasks here
            </p>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
