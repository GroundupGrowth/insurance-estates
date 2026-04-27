import { Settings } from "lucide-react";
import { initialFromEmail } from "@/lib/utils";

export function UserMenu({ email }: { email: string | null }) {
  return (
    <div className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-app-active text-xs font-semibold text-app-ink">
        {initialFromEmail(email)}
      </span>
      <span className="flex-1 truncate text-left text-xs text-app-subtle">
        {email ?? "—"}
      </span>
      <Settings size={16} className="text-app-muted" strokeWidth={1.75} />
    </div>
  );
}
