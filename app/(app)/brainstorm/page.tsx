import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { ideas, ideaLinks } from "@/lib/db/schema";
import { serializeIdea } from "@/lib/db/serializers";
import { BrainstormGrid } from "@/components/brainstorm/brainstorm-grid";

export const dynamic = "force-dynamic";

export default async function BrainstormPage() {
  const [ideaRows, linkRows] = await Promise.all([
    db.select().from(ideas).orderBy(desc(ideas.updatedAt)),
    db.select({ ideaId: ideaLinks.ideaId }).from(ideaLinks),
  ]);

  const linkCounts: Record<string, number> = {};
  for (const l of linkRows) {
    linkCounts[l.ideaId] = (linkCounts[l.ideaId] ?? 0) + 1;
  }

  return (
    <BrainstormGrid initialIdeas={ideaRows.map(serializeIdea)} linkCounts={linkCounts} />
  );
}
