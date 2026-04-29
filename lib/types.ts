export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type Assignee = "Dylan" | "Xander" | "Emson" | "Team" | "Erik";

export type SocialPlatform = "instagram" | "facebook" | "youtube" | "linkedin";
export type SocialStatus = "idea" | "drafting" | "ready" | "scheduled" | "posted";

export type IdeaStatus = "raw" | "exploring" | "greenlit" | "parked" | "killed";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
  assignee: Assignee | null;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  title: string;
  caption: string | null;
  hook: string | null;
  cta: string | null;
  hashtags: string | null;
  media_notes: string | null;
  status: SocialStatus;
  scheduled_for: string | null;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Idea {
  id: string;
  title: string;
  body: string | null;
  status: IdeaStatus;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface IdeaLink {
  id: string;
  idea_id: string;
  url: string;
  label: string | null;
  created_at: string;
}

export interface SocialLink {
  id: string;
  post_id: string;
  url: string;
  label: string | null;
  created_at: string;
}

export interface SocialChannel {
  platform: SocialPlatform;
  drive_url: string | null;
  account_url: string | null;
  notes: string | null;
  updated_at: string;
}

export interface SocialCompetitor {
  id: string;
  platform: SocialPlatform;
  name: string;
  url: string | null;
  notes: string | null;
  position: number;
  created_at: string;
}
