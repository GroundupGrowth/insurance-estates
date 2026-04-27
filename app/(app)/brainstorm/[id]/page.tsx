import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IdeaEditor } from "@/components/brainstorm/idea-editor";
import type { Idea, IdeaLink } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function IdeaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: idea }, { data: links }] = await Promise.all([
    supabase.from("ideas").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("idea_links")
      .select("*")
      .eq("idea_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (!idea) notFound();

  return (
    <IdeaEditor
      initialIdea={idea as Idea}
      initialLinks={(links ?? []) as IdeaLink[]}
    />
  );
}
