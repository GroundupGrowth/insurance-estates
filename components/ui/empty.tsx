import { cn } from "@/lib/utils";

interface EmptyProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function Empty({ title, description, children, className }: EmptyProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-app-border bg-white/40 px-6 py-10 text-center",
        className,
      )}
    >
      <p className="text-sm font-medium text-app-ink">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-app-muted">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
