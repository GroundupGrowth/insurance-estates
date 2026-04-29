"use client";

import { useState } from "react";
import { ExternalLink, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { ProjectDialog } from "./project-dialog";
import { createProject, updateProject, deleteProject } from "@/lib/actions/projects";
import {
  ASSIGNEE_COLOR,
  PROJECT_STATUS_TINT,
} from "@/lib/constants";
import type { Project, Assignee } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";

interface Props {
  initialProjects: Project[];
}

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "?";
};

const hostnameOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export function ProjectsGrid({ initialProjects }: Props) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openProject, setOpenProject] = useState<Partial<Project> | null>(null);

  const openNew = () => {
    setOpenProject(null);
    setDialogOpen(true);
  };

  const openExisting = (p: Project) => {
    setOpenProject(p);
    setDialogOpen(true);
  };

  const persist = async (patch: Partial<Project>) => {
    const id = openProject?.id;
    if (!id) {
      try {
        const created = await createProject({
          name: patch.name ?? "Untitled project",
          topic: patch.topic ?? null,
          description: patch.description ?? null,
          owner: patch.owner ?? null,
          url: patch.url ?? null,
          color: patch.color,
          notes: patch.notes ?? null,
          status: patch.status,
        });
        setProjects((cur) => [...cur, created]);
        setOpenProject(created);
      } catch {
        toast({ title: "Couldn't create project", variant: "destructive" });
      }
      return;
    }

    setProjects((cur) => cur.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    setOpenProject((cur) => (cur ? { ...cur, ...patch } : cur));
    try {
      await updateProject(id, patch);
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  const remove = async () => {
    const id = openProject?.id;
    if (!id) return;
    const prev = projects;
    setProjects((cur) => cur.filter((p) => p.id !== id));
    try {
      await deleteProject(id);
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
      setProjects(prev);
    }
  };

  return (
    <>
      <PageHeader
        title="Projects"
        description="One project per topic. Assign an owner so it's clear who's driving."
        actions={
          <Button onClick={openNew}>
            <Plus size={16} strokeWidth={2} />
            New project
          </Button>
        }
      />

      {projects.length === 0 ? (
        <Empty
          title="No projects yet."
          description="Create your first one — topic, owner, and a short description is enough to start."
        >
          <Button onClick={openNew}>
            <Plus size={16} strokeWidth={2} />
            New project
          </Button>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => {
            const tint = PROJECT_STATUS_TINT[p.status];
            return (
              <article
                key={p.id}
                onClick={() => openExisting(p)}
                className="cursor-pointer rounded-2xl border border-app-border bg-white p-6 transition-colors duration-150 hover:bg-app-hover"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
                    style={{ backgroundColor: p.color }}
                    aria-hidden
                  >
                    {initials(p.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-app-ink truncate">
                      {p.name}
                    </h3>
                    {p.topic && (
                      <p className="text-xs text-app-muted truncate">{p.topic}</p>
                    )}
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide shrink-0"
                    style={{ backgroundColor: tint.bg, color: tint.text }}
                  >
                    {p.status}
                  </span>
                </div>

                {p.description && (
                  <p className="text-sm leading-relaxed text-app-subtle line-clamp-3">
                    {p.description}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-3 text-[11px] text-app-muted">
                  {p.owner && (
                    <span className="inline-flex items-center gap-1">
                      <span
                        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-semibold text-white"
                        style={{
                          backgroundColor:
                            ASSIGNEE_COLOR[p.owner as Assignee] ?? "#3D3A33",
                        }}
                      >
                        {p.owner === "Team" ? "TM" : p.owner[0]}
                      </span>
                      {p.owner}
                    </span>
                  )}
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="ml-auto inline-flex items-center gap-1 hover:text-app-ink truncate max-w-[180px]"
                    >
                      {hostnameOf(p.url)}
                      <ExternalLink size={11} strokeWidth={1.75} />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setOpenProject(null);
        }}
        project={openProject}
        onSave={persist}
        onDelete={openProject?.id ? remove : undefined}
      />
    </>
  );
}
