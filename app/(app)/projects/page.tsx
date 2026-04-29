import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { serializeProject } from "@/lib/db/serializers";
import { ProjectsGrid } from "@/components/projects/projects-grid";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const rows = await db
    .select()
    .from(projects)
    .orderBy(asc(projects.position), asc(projects.createdAt));

  return <ProjectsGrid initialProjects={rows.map(serializeProject)} />;
}
