import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-2 mb-6 md:flex-row md:items-end md:justify-between", className)}>
      <div>
        <h1 className="text-[32px] md:text-[36px] font-semibold tracking-tight leading-tight">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-app-muted">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
