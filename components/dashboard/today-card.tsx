"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { PriorityDot } from "@/components/tasks/priority-dot";
import { createClient } from "@/lib/supabase/client";
import { Empty } from "@/components/ui/empty";
import type { Task } from "@/lib/supabase/types";
import { toast } from "@/components/ui/use-toast";

export function TodayCard({ tasks }: { tasks: Task[] }) {
  const [items, setItems] = useState(tasks);
  const supabase = createClient();

  if (items.length === 0) {
    return (
      <Empty
        title="Nothing urgent."
        description="Pick something from the board to start your day."
      />
    );
  }

  const toggle = async (id: string, checked: boolean) => {
    if (!checked) return;
    const prev = items;
    setItems((cur) => cur.filter((t) => t.id !== id));
    const { error } = await supabase
      .from("tasks")
      .update({ status: "done" })
      .eq("id", id);
    if (error) {
      toast({ title: "Couldn't mark done", variant: "destructive" });
      setItems(prev);
    }
  };

  return (
    <ul className="flex flex-col divide-y divide-app-border">
      {items.map((t) => (
        <li key={t.id} className="flex items-center gap-3 py-3">
          <Checkbox
            id={`today-${t.id}`}
            onCheckedChange={(c) => toggle(t.id, Boolean(c))}
          />
          <label
            htmlFor={`today-${t.id}`}
            className="flex flex-1 items-center justify-between gap-3 cursor-pointer"
          >
            <span className="flex items-center gap-2 min-w-0">
              <PriorityDot priority={t.priority} />
              <span className="truncate text-sm text-app-ink">{t.title}</span>
            </span>
            {t.due_date && (
              <span className="text-[11px] text-app-muted shrink-0">
                {format(parseISO(t.due_date), "MMM d")}
              </span>
            )}
          </label>
        </li>
      ))}
    </ul>
  );
}
