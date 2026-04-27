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
import type { Task, TaskStatus } from "@/lib/types";
import {
  createTask,
  updateTask,
  deleteTask as deleteTaskAction,
  reorderTasks,
} from "@/lib/actions/tasks";
import { TaskColumn } from "./task-column";
import { TaskDialog } from "./task-dialog";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

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

  useEffect(() => {
    if (initialFilter) {
      const el = document.getElementById(`column-${initialFilter}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [initialFilter]);

  const openNew = (status: TaskStatus = "todo") => {
    setOpenTask({ status, priority: "medium" });
    setDialogOpen(true);
  };

  const openExisting = (task: Task) => {
    setOpenTask(task);
    setDialogOpen(true);
  };

  const persistTask = async (patch: Partial<Task>) => {
    const id = openTask?.id;
    if (!id) {
      const status = (openTask?.status as TaskStatus) ?? "todo";
      try {
        const created = await createTask({
          title: patch.title ?? openTask?.title ?? "Untitled",
          description: patch.description ?? openTask?.description ?? null,
          status,
          priority: (patch.priority ?? openTask?.priority ?? "medium") ?? "medium",
          due_date: patch.due_date ?? openTask?.due_date ?? null,
        });
        setTasks((cur) => [...cur, created]);
        setOpenTask(created);
      } catch {
        toast({ title: "Couldn't create task", variant: "destructive" });
      }
      return;
    }

    setTasks((cur) => cur.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    setOpenTask((cur) => (cur ? { ...cur, ...patch } : cur));
    try {
      await updateTask(id, patch);
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
      router.refresh();
    }
  };

  const deleteTask = async () => {
    const id = openTask?.id;
    if (!id) return;
    const prev = tasks;
    setTasks((cur) => cur.filter((t) => t.id !== id));
    try {
      await deleteTaskAction(id);
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
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
      targetStatus = overIdStr;
      targetIndex = grouped[targetStatus].length;
    } else {
      const overTask = tasks.find((t) => t.id === overIdStr);
      if (!overTask) return;
      targetStatus = overTask.status;
      targetIndex = grouped[targetStatus].findIndex((t) => t.id === overIdStr);
    }

    const sourceStatus = activeTask.status;

    const nextGroups: Record<TaskStatus, Task[]> = {
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

    const affected: Task[] = [];
    const origById = new Map(tasks.map((t) => [t.id, t]));
    const reassign = (status: TaskStatus) => {
      nextGroups[status] = nextGroups[status].map((t, i) => {
        const orig = origById.get(t.id);
        if (!orig || orig.position !== i || orig.status !== status) {
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

    try {
      await reorderTasks(
        affected.map((t) => ({
          id: t.id,
          status: t.status,
          position: t.position,
        })),
      );
    } catch {
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

      <TaskDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setOpenTask(null);
        }}
        task={openTask}
        onSave={persistTask}
        onDelete={openTask?.id ? deleteTask : undefined}
      />
    </>
  );
}
