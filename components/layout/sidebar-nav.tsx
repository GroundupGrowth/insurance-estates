"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, KanbanSquare, Megaphone, Lightbulb, FolderKanban, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/tasks", label: "Tasks", icon: KanbanSquare },
  { href: "/socials", label: "Socials", icon: Megaphone },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/brainstorm", label: "Brainstorm", icon: Lightbulb },
  { href: "/projects", label: "Projects", icon: FolderKanban },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() ?? "";
  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150",
              active
                ? "bg-app-active text-app-ink"
                : "text-app-subtle hover:bg-app-hover",
            )}
          >
            <Icon size={18} strokeWidth={1.75} />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
