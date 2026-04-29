import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Tile {
  label: string;
  value: number;
  href?: string;
  accent?: string;
}

interface Props {
  tiles: Tile[];
}

export function KpiRow({ tiles }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {tiles.map((t) => {
        const inner = (
          <div className="rounded-2xl border border-app-border bg-white p-5 transition-colors duration-150 hover:bg-app-hover h-full">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-app-muted">
                {t.accent && (
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: t.accent }}
                  />
                )}
                {t.label}
              </div>
              {t.href && (
                <ArrowRight
                  size={14}
                  strokeWidth={1.75}
                  className="text-app-muted"
                />
              )}
            </div>
            <p className="mt-2 text-[28px] font-semibold tracking-tight tabular-nums text-app-ink">
              {t.value}
            </p>
          </div>
        );
        return t.href ? (
          <Link key={t.label} href={t.href} className="block">
            {inner}
          </Link>
        ) : (
          <div key={t.label}>{inner}</div>
        );
      })}
    </div>
  );
}
