import type {
  Task as TaskRow,
  SocialPost as SocialPostRow,
  Idea as IdeaRow,
  IdeaLink as IdeaLinkRow,
  SocialLink as SocialLinkRow,
  SocialChannel as SocialChannelRow,
  SocialCompetitor as SocialCompetitorRow,
  Project as ProjectRow,
  Comment as CommentRow,
  Activity as ActivityRow,
} from "./schema";
import type {
  Task,
  SocialPost,
  Idea,
  IdeaLink,
  SocialLink,
  SocialChannel,
  SocialCompetitor,
  Project,
  Comment,
  ActivityEvent,
  ParentType,
  TaskStatus,
  TaskPriority,
  Assignee,
  SocialPlatform,
  SocialStatus,
  IdeaStatus,
  ProjectStatus,
} from "@/lib/types";

const isoOrNow = (d: Date | string | null | undefined) => {
  if (!d) return new Date().toISOString();
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
};

const isoOrNull = (d: Date | string | null | undefined) => {
  if (!d) return null;
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
};

export function serializeTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    status: row.status as TaskStatus,
    priority: (row.priority ?? null) as TaskPriority | null,
    assignee: (row.assignee ?? null) as Assignee | null,
    project_id: row.projectId ?? null,
    due_date: row.dueDate ?? null,
    position: row.position,
    created_at: isoOrNow(row.createdAt),
    updated_at: isoOrNow(row.updatedAt),
  };
}

export function serializeSocialPost(row: SocialPostRow): SocialPost {
  return {
    id: row.id,
    platform: row.platform as SocialPlatform,
    title: row.title,
    caption: row.caption ?? null,
    hook: row.hook ?? null,
    cta: row.cta ?? null,
    hashtags: row.hashtags ?? null,
    media_notes: row.mediaNotes ?? null,
    status: row.status as SocialStatus,
    scheduled_for: isoOrNull(row.scheduledFor),
    posted_at: isoOrNull(row.postedAt),
    project_id: row.projectId ?? null,
    created_at: isoOrNow(row.createdAt),
    updated_at: isoOrNow(row.updatedAt),
  };
}

export function serializeIdea(row: IdeaRow): Idea {
  return {
    id: row.id,
    title: row.title,
    body: row.body ?? null,
    status: (row.status ?? "raw") as IdeaStatus,
    tags: row.tags ?? [],
    project_id: row.projectId ?? null,
    created_at: isoOrNow(row.createdAt),
    updated_at: isoOrNow(row.updatedAt),
  };
}

export function serializeIdeaLink(row: IdeaLinkRow): IdeaLink {
  return {
    id: row.id,
    idea_id: row.ideaId,
    url: row.url,
    label: row.label ?? null,
    created_at: isoOrNow(row.createdAt),
  };
}

export function serializeSocialLink(row: SocialLinkRow): SocialLink {
  return {
    id: row.id,
    post_id: row.postId,
    url: row.url,
    label: row.label ?? null,
    created_at: isoOrNow(row.createdAt),
  };
}

export function serializeSocialChannel(row: SocialChannelRow): SocialChannel {
  return {
    platform: row.platform as SocialPlatform,
    drive_url: row.driveUrl ?? null,
    account_url: row.accountUrl ?? null,
    notes: row.notes ?? null,
    updated_at: isoOrNow(row.updatedAt),
  };
}

export function serializeSocialCompetitor(row: SocialCompetitorRow): SocialCompetitor {
  return {
    id: row.id,
    platform: row.platform as SocialPlatform,
    name: row.name,
    url: row.url ?? null,
    notes: row.notes ?? null,
    position: row.position,
    created_at: isoOrNow(row.createdAt),
  };
}

export function serializeProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    topic: row.topic ?? null,
    description: row.description ?? null,
    owner: row.owner ?? null,
    url: row.url ?? null,
    color: row.color ?? "#2E5A87",
    notes: row.notes ?? null,
    status: row.status as ProjectStatus,
    position: row.position,
    created_at: isoOrNow(row.createdAt),
    updated_at: isoOrNow(row.updatedAt),
  };
}

export function serializeComment(row: CommentRow): Comment {
  return {
    id: row.id,
    parent_type: row.parentType as ParentType,
    parent_id: row.parentId,
    author: row.author ?? null,
    body: row.body,
    created_at: isoOrNow(row.createdAt),
  };
}

export function serializeActivity(row: ActivityRow): ActivityEvent {
  let meta: Record<string, unknown> | null = null;
  if (row.meta) {
    try {
      meta = JSON.parse(row.meta) as Record<string, unknown>;
    } catch {
      meta = null;
    }
  }
  return {
    id: row.id,
    parent_type: row.parentType as ParentType,
    parent_id: row.parentId,
    actor: row.actor ?? null,
    action: row.action,
    meta,
    created_at: isoOrNow(row.createdAt),
  };
}
