import { PRIORITY_COLOR } from "@/lib/constants";
import type { TaskPriority } from "@/lib/supabase/types";

export function PriorityDot({ priority }: { priority: TaskPriority | null | undefined }) {
  const color = PRIORITY_COLOR[priority ?? "medium"];
  return (
    <span
      aria-hidden
      className="inline-block h-2 w-2 rounded-full shrink-0"
      style={{ backgroundColor: color }}
    />
  );
}
