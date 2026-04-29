"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { Logo } from "@/components/layout/logo";

export function MobileNav({ email }: { email: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-app-border bg-white px-4 py-3">
        <Logo size="sm" />
        <button
          onClick={() => setOpen(true)}
          className="rounded-md p-2 hover:bg-app-hover transition-colors duration-150"
          aria-label="Open menu"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>
      </header>
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/30 animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <div className="relative h-full w-[260px] bg-white border-r border-app-border flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-app-border">
              <Logo />
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-2 hover:bg-app-hover"
                aria-label="Close menu"
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>
            <div className="py-4 flex-1 overflow-y-auto">
              <SidebarNav onNavigate={() => setOpen(false)} />
            </div>
            <div className="border-t border-app-border p-3">
              <UserMenu email={email} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
