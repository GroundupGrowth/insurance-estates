"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Link2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { IdeaStatusPill } from "./status-pill";
import { createClient } from "@/lib/supabase/client";
import type { Idea } from "@/lib/supabase/types";
import { toast } from "@/components/ui/use-toast";

interface Props {
  initialIdeas: Idea[];
  linkCounts: Record<string, number>;
}

export function BrainstormGrid({ initialIdeas, linkCounts }: Props) {
  const [ideas] = useState(initialIdeas);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const onNew = async () => {
    const { data, error } = await supabase
      .from("ideas")
      .insert({ title: "Untitled idea" })
      .select()
      .single();
    if (error || !data) {
      toast({ title: "Couldn't create idea", variant: "destructive" });
      return;
    }
    router.push(`/brainstorm/${data.id}`);
  };

  return (
    <>
      <PageHeader
        title="Brainstorm"
        description="A scratchpad for ideas, references, and rough thinking."
        actions={
          <Button onClick={onNew}>
            <Plus size={16} strokeWidth={2} />
            New idea
          </Button>
        }
      />
      {ideas.length === 0 ? (
        <Empty
          title="No ideas yet."
          description="Start one — even a rough title is fine. You can flesh it out later."
        >
          <Button onClick={onNew}>
            <Plus size={16} strokeWidth={2} />
            New idea
          </Button>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea) => (
            <Link
              key={idea.id}
              href={`/brainstorm/${idea.id}`}
              className="rounded-2xl border border-app-border bg-white p-6 transition-colors duration-150 hover:bg-app-hover"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-base font-semibold text-app-ink line-clamp-2">
                  {idea.title}
                </h3>
                <IdeaStatusPill status={idea.status} />
              </div>
              {idea.body && (
                <p className="text-xs text-app-muted line-clamp-2 leading-relaxed">
                  {idea.body}
                </p>
              )}
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                {idea.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-app-active px-2 py-0.5 text-[10px] text-app-subtle"
                  >
                    {tag}
                  </span>
                ))}
                {linkCounts[idea.id] ? (
                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-app-muted">
                    <Link2 size={12} strokeWidth={1.75} />
                    {linkCounts[idea.id]}
                  </span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
