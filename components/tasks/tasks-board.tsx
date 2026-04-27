"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { TASK_COLUMNS } from "@/lib/constants";
import type { Task, TaskStatus } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import { TaskColumn } from "./task-column";
import { TaskDrawer } from "./task-drawer";
import { TaskCard } from "./task-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { toast } from "@/components/ui/use-toast";

const isStatus = (id: string): id is TaskStatus =>
  TASK_COLUMNS.some((c) => c.id === id);

interface BoardProps {
  initialTasks: Task[];
  initialFilter?: string | null;
}

export function TasksBoard({ initialTasks, initialFilter }: BoardProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [openTask, setOpenTask] = useState<Partial<Task> | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  // Group tasks by status, ordered by position
  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };
    for (const t of tasks) map[t.status]?.push(t);
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.position - b.position));
    return map;
  }, [tasks]);

  // Highlight initial filter (link from dashboard pills)
  useEffect(() => {
    if (initialFilter) {
      const el = document.getElementById(`column-${initialFilter}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [initialFilter]);

  const openNew = (status: TaskStatus = "todo") => {
    setOpenTask({ status, priority: "medium" });
    setDrawerOpen(true);
  };

  const openExisting = (task: Task) => {
    setOpenTask(task);
    setDrawerOpen(true);
  };

  const persistTask = async (patch: Partial<Task>) => {
    const id = openTask?.id;
    if (!id) {
      // create
      const status = (openTask?.status as TaskStatus) ?? "todo";
      const colTasks = grouped[status];
      const nextPos = (colTasks[colTasks.length - 1]?.position ?? -1) + 1;

      const insertPayload = {
        title: patch.title ?? openTask?.title ?? "Untitled",
        description: patch.description ?? openTask?.description ?? null,
        status,
        priority: (patch.priority ?? openTask?.priority ?? "medium") as Task["priority"],
        due_date: patch.due_date ?? openTask?.due_date ?? null,
        position: nextPos,
      };

      const { data, error } = await supabase
        .from("tasks")
        .insert(insertPayload)
        .select()
        .single();
      if (error || !data) {
        toast({ title: "Couldn't create task", variant: "destructive" });
        return;
      }
      setTasks((cur) => [...cur, data as Task]);
      setOpenTask(data as Task);
      return;
    }

    // optimistic update
    setTasks((cur) => cur.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    setOpenTask((cur) => (cur ? { ...cur, ...patch } : cur));
    const { error } = await supabase.from("tasks").update(patch).eq("id", id);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      router.refresh();
    }
  };

  const deleteTask = async () => {
    const id = openTask?.id;
    if (!id) return;
    const prev = tasks;
    setTasks((cur) => cur.filter((t) => t.id !== id));
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      setTasks(prev);
    }
  };

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    const activeTask = tasks.find((t) => t.id === activeIdStr);
    if (!activeTask) return;

    let targetStatus: TaskStatus = activeTask.status;
    let targetIndex: number;

    if (isStatus(overIdStr)) {
      // Dropped onto a column
      targetStatus = overIdStr;
      targetIndex = grouped[targetStatus].length;
    } else {
      // Dropped onto a task
      const overTask = tasks.find((t) => t.id === overIdStr);
      if (!overTask) return;
      targetStatus = overTask.status;
      targetIndex = grouped[targetStatus].findIndex((t) => t.id === overIdStr);
    }

    const sourceStatus = activeTask.status;

    let nextGroups: Record<TaskStatus, Task[]> = {
      backlog: [...grouped.backlog],
      todo: [...grouped.todo],
      in_progress: [...grouped.in_progress],
      review: [...grouped.review],
      done: [...grouped.done],
    };

    if (sourceStatus === targetStatus) {
      const sourceIndex = nextGroups[sourceStatus].findIndex((t) => t.id === activeIdStr);
      nextGroups[sourceStatus] = arrayMove(
        nextGroups[sourceStatus],
        sourceIndex,
        targetIndex,
      );
    } else {
      nextGroups[sourceStatus] = nextGroups[sourceStatus].filter(
        (t) => t.id !== activeIdStr,
      );
      const moved: Task = { ...activeTask, status: targetStatus };
      nextGroups[targetStatus] = [
        ...nextGroups[targetStatus].slice(0, targetIndex),
        moved,
        ...nextGroups[targetStatus].slice(targetIndex),
      ];
    }

    // Reassign positions per affected column.
    const affected: Task[] = [];
    const reassign = (status: TaskStatus) => {
      nextGroups[status] = nextGroups[status].map((t, i) => {
        if (t.position !== i || t.status !== status) {
          const updated = { ...t, position: i, status };
          affected.push(updated);
          return updated;
        }
        return t;
      });
    };
    reassign(sourceStatus);
    if (sourceStatus !== targetStatus) reassign(targetStatus);

    const newTasks: Task[] = ([] as Task[]).concat(
      nextGroups.backlog,
      nextGroups.todo,
      nextGroups.in_progress,
      nextGroups.review,
      nextGroups.done,
    );

    const previous = tasks;
    setTasks(newTasks);

    // Persist
    const updates = affected.map((t) =>
      supabase
        .from("tasks")
        .update({ status: t.status, position: t.position })
        .eq("id", t.id),
    );
    const results = await Promise.all(updates);
    const failed = results.find((r) => r.error);
    if (failed) {
      toast({ title: "Couldn't save board changes", variant: "destructive" });
      setTasks(previous);
    }
  };

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Drag cards between columns. Click any card to edit."
        actions={
          <Button onClick={() => openNew()}>
            <Plus size={16} strokeWidth={2} />
            New task
          </Button>
        }
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin md:grid md:grid-cols-5 md:gap-4 md:overflow-visible">
          {TASK_COLUMNS.map((col) => (
            <div key={col.id} id={`column-${col.id}`}>
              <TaskColumn
                id={col.id}
                label={col.label}
                tasks={grouped[col.id]}
                onOpen={openExisting}
              />
            </div>
          ))}
        </div>
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} onOpen={() => {}} /> : null}
        </DragOverlay>
      </DndContext>

      <TaskDrawer
        open={drawerOpen}
        onOpenChange={(o) => {
          setDrawerOpen(o);
          if (!o) setOpenTask(null);
        }}
        task={openTask}
        onSave={persistTask}
        onDelete={openTask?.id ? deleteTask : undefined}
      />
    </>
  );
}
