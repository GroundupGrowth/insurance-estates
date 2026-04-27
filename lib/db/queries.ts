import "server-only";
import { db } from "./index";
import { allowedEmails } from "./schema";
import { eq, sql } from "drizzle-orm";

export async function isAllowedEmail(email: string | null | undefined) {
  if (!email) return false;
  const rows = await db
    .select({ email: allowedEmails.email })
    .from(allowedEmails)
    .where(eq(sql`lower(${allowedEmails.email})`, email.toLowerCase()))
    .limit(1);
  return rows.length > 0;
}
