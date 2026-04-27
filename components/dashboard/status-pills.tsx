import Link from "next/link";

interface StatusPillsProps {
  counts: { open: number; inProgress: number; completed: number };
}

const pills = [
  {
    key: "open",
    label: "Open",
    bg: "#FCE7EF",
    text: "#A8345C",
    href: "/tasks?status=todo",
  },
  {
    key: "inProgress",
    label: "In progress",
    bg: "#EDEAE3",
    text: "#3D3A33",
    href: "/tasks?status=in_progress",
  },
  {
    key: "completed",
    label: "Completed",
    bg: "#E5EFE2",
    text: "#3F6E3A",
    href: "/tasks?status=done",
  },
] as const;

export function StatusPills({ counts }: StatusPillsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {pills.map((p) => (
        <Link
          key={p.key}
          href={p.href}
          className="rounded-full px-5 py-3 text-sm font-medium transition-opacity duration-150 hover:opacity-90 inline-flex items-center gap-3"
          style={{ backgroundColor: p.bg, color: p.text }}
        >
          <span>{p.label}</span>
          <span className="tabular-nums text-base font-semibold">
            {counts[p.key as keyof typeof counts]}
          </span>
        </Link>
      ))}
    </div>
  );
}
