"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PLATFORMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SocialsTabs() {
  const pathname = usePathname() ?? "";
  return (
    <div className="inline-flex h-10 items-center gap-1 rounded-lg bg-[#EDEAE3] p-1 text-app-subtle">
      {PLATFORMS.map((p) => {
        const active = pathname.startsWith(`/socials/${p.value}`);
        return (
          <Link
            key={p.value}
            href={`/socials/${p.value}`}
            className={cn(
              "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150",
              active
                ? "bg-white text-app-ink shadow-sm"
                : "hover:text-app-ink",
            )}
          >
            {p.label}
          </Link>
        );
      })}
    </div>
  );
}
