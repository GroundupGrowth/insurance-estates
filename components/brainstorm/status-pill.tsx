import { IDEA_STATUS_TINT } from "@/lib/constants";
import type { IdeaStatus } from "@/lib/types";

export function IdeaStatusPill({ status }: { status: IdeaStatus | null }) {
  const s = status ?? "raw";
  const tint = IDEA_STATUS_TINT[s];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
      style={{ backgroundColor: tint.bg, color: tint.text }}
    >
      {s}
    </span>
  );
}
