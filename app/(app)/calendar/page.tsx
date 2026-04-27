import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { socialPosts } from "@/lib/db/schema";
import { serializeSocialPost } from "@/lib/db/serializers";
import { CalendarBoard } from "@/components/calendar/calendar-board";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const rows = await db
    .select()
    .from(socialPosts)
    .orderBy(asc(socialPosts.scheduledFor));

  return <CalendarBoard posts={rows.map(serializeSocialPost)} />;
}
