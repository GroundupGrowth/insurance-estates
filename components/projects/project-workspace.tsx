"use client";

import { useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ArrowLeft, ExternalLink, Pencil } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { ActivityThread } from "@/components/shared/activity-thread";
import { ProjectDialog } from "./project-dialog";
import { updateProject, deleteProject } from "@/lib/actions/projects";
import {
  ASSIGNEE_COLOR,
  PROJECT_STATUS_TINT,
  PRIORITY_COLOR,
  TASK_STATUS_LABEL,
  SOCIAL_STATUS_TINT,
  PLATFORM_COLOR,
} from "@/lib/constants";
import type {
  Project,
  Task,
  Idea,
  SocialPost,
  Assignee,
  Comment,
  ActivityEvent,
  SocialPlatform,
} from "@/lib/types";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface Props {
  project: Project;
  tasks: Task[];
  ideas: Idea[];
  posts: SocialPost[];
  initialComments: Comment[];
  initialActivity: ActivityEvent[];
}

const PLATFORM_TAG: Record<SocialPlatform, string> = {
  instagram: "IG",
  facebook: "FB",
  youtube: "YT",
  linkedin: "LI",
};

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

export function ProjectWorkspace({
  project,
  tasks,
  ideas,
  posts,
  initialComments,
  initialActivity,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [proj, setProj] = useState<Project>(project);
  const tint = PROJECT_STATUS_TINT[proj.status];

  const persist = async (patch: Partial<Project>) => {
    const next = { ...proj, ...patch };
    setProj(next);
    try {
      await updateProject(proj.id, patch);
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  const remove = async () => {
    try {
      await deleteProject(proj.id);
      router.push("/projects");
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  return (
    <>
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-xs text-app-muted hover:text-app-ink mb-3"
      >
        <ArrowLeft size={14} strokeWidth={1.75} />
        Back to projects
      </Link>

      <PageHeader
        title={
          <span className="inline-flex items-center gap-3">
            <span
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white"
              style={{ backgroundColor: proj.color }}
              aria-hidden
            >
              {initials(proj.name)}
            </span>
            <span className="flex flex-col leading-tight">
              <span>{proj.name}</span>
              {proj.topic && (
                <span className="text-xs font-normal text-app-muted">
                  {proj.topic}
                </span>
              )}
            </span>
          </span>
        }
        description={proj.description ?? undefined}
        actions={
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
              style={{ backgroundColor: tint.bg, color: tint.text }}
            >
              {proj.status}
            </span>
            {proj.owner && (
              <span className="inline-flex items-center gap-1 text-xs text-app-muted">
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold text-white"
                  style={{ backgroundColor: ASSIGNEE_COLOR[proj.owner as Assignee] ?? "#3D3A33" }}
                >
                  {proj.owner === "Team" ? "TM" : proj.owner[0]}
                </span>
                {proj.owner}
              </span>
            )}
            {proj.url && (
              <a
                href={proj.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-app-muted hover:text-app-ink"
              >
                {hostnameOf(proj.url)}
                <ExternalLink size={11} strokeWidth={1.75} />
              </a>
            )}
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              <Pencil size={14} strokeWidth={1.75} />
              Edit
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-2xl border border-app-border bg-white p-6">
          <h2 className="text-base font-semibold text-app-ink mb-3">Tasks</h2>
          {tasks.length === 0 ? (
            <Empty
              title="No tasks yet."
              description="Assign a task to this project from the Tasks board."
            />
          ) : (
            <ul className="flex flex-col divide-y divide-app-border">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-3">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: t.priority
                        ? PRIORITY_COLOR[t.priority]
                        : "#C8C6BF",
                    }}
                  />
                  <Link
                    href={`/tasks?status=${t.status}`}
                    className="flex-1 truncate text-sm text-app-ink hover:underline"
                  >
                    {t.title}
                  </Link>
                  <span className="rounded-full bg-app-active px-2 py-0.5 text-[10px] text-app-subtle">
                    {TASK_STATUS_LABEL[t.status]}
                  </span>
                  {t.assignee && (
                    <span
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold text-white"
                      style={{
                        backgroundColor:
                          ASSIGNEE_COLOR[t.assignee as Assignee] ?? "#3D3A33",
                      }}
                      title={t.assignee}
                    >
                      {t.assignee === "Team" ? "TM" : t.assignee[0]}
                    </span>
                  )}
                  {t.due_date && (
                    <span className="text-[11px] text-app-muted shrink-0 w-20 text-right">
                      {format(parseISO(t.due_date), "MMM d")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-app-border bg-white p-6">
          <h2 className="text-base font-semibold text-app-ink mb-3">Activity</h2>
          <ActivityThread
            parentType="project"
            parentId={proj.id}
            initialComments={initialComments}
            initialActivity={initialActivity}
          />
        </section>

        <section className="lg:col-span-2 rounded-2xl border border-app-border bg-white p-6">
          <h2 className="text-base font-semibold text-app-ink mb-3">Ideas</h2>
          {ideas.length === 0 ? (
            <Empty
              title="No ideas yet."
              description="Link a brainstorm idea to this project from its editor."
            />
          ) : (
            <ul className="flex flex-col divide-y divide-app-border">
              {ideas.map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-3">
                  <Link
                    href={`/brainstorm/${i.id}`}
                    className="flex-1 truncate text-sm text-app-ink hover:underline"
                  >
                    {i.title}
                  </Link>
                  <span className="rounded-full bg-app-active px-2 py-0.5 text-[10px] text-app-subtle">
                    {i.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-app-border bg-white p-6">
          <h2 className="text-base font-semibold text-app-ink mb-3">Posts</h2>
          {posts.length === 0 ? (
            <Empty
              title="No posts yet."
              description="Link a social post to this project from the post drawer."
            />
          ) : (
            <ul className="flex flex-col divide-y divide-app-border">
              {posts.map((p) => {
                const t = SOCIAL_STATUS_TINT[p.status];
                return (
                  <li key={p.id} className="flex items-center gap-2 py-2">
                    <span
                      className="rounded-sm px-1 text-[9px] font-bold leading-tight text-white"
                      style={{ backgroundColor: PLATFORM_COLOR[p.platform] }}
                    >
                      {PLATFORM_TAG[p.platform]}
                    </span>
                    <Link
                      href={`/socials/${p.platform}`}
                      className="flex-1 truncate text-sm text-app-ink hover:underline"
                    >
                      {p.title || "Untitled"}
                    </Link>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px]"
                      style={{ backgroundColor: t.bg, color: t.text }}
                    >
                      {p.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <ProjectDialog
        open={editing}
        onOpenChange={(o) => setEditing(o)}
        project={proj}
        onSave={persist}
        onDelete={remove}
      />
    </>
  );
}
