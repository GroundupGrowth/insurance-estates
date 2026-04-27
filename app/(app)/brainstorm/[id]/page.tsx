import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ideas, ideaLinks } from "@/lib/db/schema";
import { serializeIdea, serializeIdeaLink } from "@/lib/db/serializers";
import { IdeaEditor } from "@/components/brainstorm/idea-editor";

export const dynamic = "force-dynamic";

export default async function IdeaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [ideaRow] = await db.select().from(ideas).where(eq(ideas.id, id)).limit(1);
  if (!ideaRow) notFound();

  const linkRows = await db
    .select()
    .from(ideaLinks)
    .where(eq(ideaLinks.ideaId, id))
    .orderBy(asc(ideaLinks.createdAt));

  return (
    <IdeaEditor
      initialIdea={serializeIdea(ideaRow)}
      initialLinks={linkRows.map(serializeIdeaLink)}
    />
  );
}
