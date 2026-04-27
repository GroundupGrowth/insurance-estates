import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        description="One project for now. Placeholder until we expand."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <article className="rounded-2xl border border-app-border bg-white p-6">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: "#2E5A87" }}
              aria-hidden
            >
              I&amp;E
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-app-ink truncate">
                Insurance and Estates
              </h3>
              <a
                href="https://insuranceandestates.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-app-muted hover:text-app-ink"
              >
                insuranceandestates.com
                <ExternalLink size={12} strokeWidth={1.75} />
              </a>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-app-subtle">
            Long-term financial strategy firm specializing in Infinite Banking,
            whole life policy design, and wealth legacy planning.
          </p>
          <div className="mt-4 flex items-center gap-3 text-[11px] text-app-muted">
            <span className="inline-flex items-center gap-1">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: "#2E5A87" }}
              />
              Brand color
            </span>
          </div>
        </article>
      </div>
    </>
  );
}
