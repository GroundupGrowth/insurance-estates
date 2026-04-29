"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  KanbanSquare,
  Megaphone,
  Lightbulb,
  FolderKanban,
  CalendarDays,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PLATFORMS, PLATFORM_COLOR } from "@/lib/constants";

type Child = { href: string; label: string; color?: string };

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  children?: Child[];
}

const socialChildren: Child[] = PLATFORMS.map((p) => ({
  href: `/socials/${p.value}`,
  label: p.label,
  color: PLATFORM_COLOR[p.value],
}));

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/tasks", label: "Tasks", icon: KanbanSquare },
  { href: "/socials", label: "Socials", icon: Megaphone, children: socialChildren },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/brainstorm", label: "Brainstorm", icon: Lightbulb },
  { href: "/projects", label: "Projects", icon: FolderKanban },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() ?? "";
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const out: Record<string, boolean> = {};
    for (const item of navItems) {
      if (item.children) {
        out[item.href] = pathname.startsWith(item.href);
      }
    }
    return out;
  });

  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        const groupOpen = openGroups[item.href] ?? false;
        const onChild =
          !!item.children &&
          item.children.some((c) => pathname === c.href || pathname.startsWith(`${c.href}/`));
        const groupActive =
          (item.children
            ? onChild
            : pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href)));

        if (item.children) {
          const isOpen = groupOpen || onChild;
          return (
            <div key={item.href} className="flex flex-col">
              <button
                type="button"
                onClick={() => setOpenGroups((s) => ({ ...s, [item.href]: !isOpen }))}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150",
                  groupActive
                    ? "bg-app-active text-app-ink"
                    : "text-app-subtle hover:bg-app-hover",
                )}
              >
                <Icon size={18} strokeWidth={1.75} />
                <span className="flex-1 text-left font-medium">{item.label}</span>
                <ChevronDown
                  size={14}
                  strokeWidth={2}
                  className={cn(
                    "text-app-muted transition-transform duration-150",
                    isOpen ? "rotate-0" : "-rotate-90",
                  )}
                />
              </button>
              {isOpen && (
                <div className="mt-1 ml-6 flex flex-col gap-0.5 border-l border-app-border pl-2">
                  {item.children.map((c) => {
                    const childActive =
                      pathname === c.href || pathname.startsWith(`${c.href}/`);
                    return (
                      <Link
                        key={c.href}
                        href={c.href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors duration-150",
                          childActive
                            ? "bg-app-active text-app-ink"
                            : "text-app-subtle hover:bg-app-hover",
                        )}
                      >
                        {c.color && (
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: c.color }}
                          />
                        )}
                        <span>{c.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150",
              groupActive
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
