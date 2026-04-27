import { createClient } from "@/lib/supabase/server";
import { BrainstormGrid } from "@/components/brainstorm/brainstorm-grid";
import type { Idea, IdeaLink } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function BrainstormPage() {
  const supabase = await createClient();
  const [{ data: ideas }, { data: links }] = await Promise.all([
    supabase.from("ideas").select("*").order("updated_at", { ascending: false }),
    supabase.from("idea_links").select("idea_id"),
  ]);

  const linkCounts: Record<string, number> = {};
  for (const l of (links ?? []) as Pick<IdeaLink, "idea_id">[]) {
    linkCounts[l.idea_id] = (linkCounts[l.idea_id] ?? 0) + 1;
  }

  return (
    <BrainstormGrid
      initialIdeas={(ideas ?? []) as Idea[]}
      linkCounts={linkCounts}
    />
  );
}
