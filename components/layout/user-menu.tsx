"use client";

import { Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initialFromEmail } from "@/lib/utils";

export function UserMenu({ email }: { email: string | null }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-app-hover transition-colors duration-150 focus-ring">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-app-active text-xs font-semibold text-app-ink">
            {initialFromEmail(email)}
          </span>
          <span className="flex-1 truncate text-left text-xs text-app-subtle">
            {email ?? "—"}
          </span>
          <Settings size={16} className="text-app-muted" strokeWidth={1.75} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-48">
        <form action="/api/auth/sign-out" method="post">
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full flex items-center gap-2">
              <LogOut size={14} strokeWidth={1.75} />
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
