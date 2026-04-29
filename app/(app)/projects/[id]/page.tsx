import { notFound } from "next/navigation";
import { eq, and, asc, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  projects,
  tasks,
  ideas,
  socialPosts,
  comments,
  activity,
} from "@/lib/db/schema";
import {
  serializeProject,
  serializeTask,
  serializeIdea,
  serializeSocialPost,
  serializeComment,
  serializeActivity,
} from "@/lib/db/serializers";
import { ProjectWorkspace } from "@/components/projects/project-workspace";

export const dynamic = "force-dynamic";

export default async function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [projectRow] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!projectRow) notFound();

  const [taskRows, ideaRows, postRows, commentRows, activityRows] = await Promise.all([
    db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, id))
      .orderBy(asc(tasks.status), asc(tasks.position)),
    db
      .select()
      .from(ideas)
      .where(eq(ideas.projectId, id))
      .orderBy(desc(ideas.updatedAt)),
    db
      .select()
      .from(socialPosts)
      .where(eq(socialPosts.projectId, id))
      .orderBy(asc(socialPosts.scheduledFor)),
    db
      .select()
      .from(comments)
      .where(and(eq(comments.parentType, "project"), eq(comments.parentId, id)))
      .orderBy(asc(comments.createdAt)),
    db
      .select()
      .from(activity)
      .where(and(eq(activity.parentType, "project"), eq(activity.parentId, id)))
      .orderBy(asc(activity.createdAt)),
  ]);

  return (
    <ProjectWorkspace
      project={serializeProject(projectRow)}
      tasks={taskRows.map(serializeTask)}
      ideas={ideaRows.map(serializeIdea)}
      posts={postRows.map(serializeSocialPost)}
      initialComments={commentRows.map(serializeComment)}
      initialActivity={activityRows.map(serializeActivity)}
    />
  );
}
