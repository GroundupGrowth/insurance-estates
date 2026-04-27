import type {
  TaskStatus,
  TaskPriority,
  Assignee,
  SocialPlatform,
  SocialStatus,
  IdeaStatus,
} from "@/lib/types";

export const TASK_COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
];

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const PRIORITY_COLOR: Record<TaskPriority, string> = {
  low: "#C8C6BF",
  medium: "#D8A24A",
  high: "#C84B6E",
};

export const ASSIGNEE_OPTIONS: { value: Assignee; label: string }[] = [
  { value: "Dylan", label: "Dylan" },
  { value: "Xander", label: "Xander" },
  { value: "Emson", label: "Emson" },
  { value: "Team", label: "Team" },
  { value: "Erik", label: "Erik" },
];

export const ASSIGNEE_COLOR: Record<Assignee, string> = {
  Dylan: "#2E5A87",
  Xander: "#3F6E3A",
  Emson: "#7A5A1F",
  Team: "#3D3A33",
  Erik: "#A8345C",
};

export const PLATFORMS: { value: SocialPlatform; label: string; charLimit: number }[] = [
  { value: "instagram", label: "Instagram", charLimit: 2200 },
  { value: "facebook", label: "Facebook", charLimit: 63206 },
  { value: "youtube", label: "YouTube", charLimit: 5000 },
  { value: "linkedin", label: "LinkedIn", charLimit: 3000 },
];

export const SOCIAL_STATUSES: { value: SocialStatus; label: string }[] = [
  { value: "idea", label: "Idea" },
  { value: "drafting", label: "Drafting" },
  { value: "ready", label: "Ready" },
  { value: "scheduled", label: "Scheduled" },
  { value: "posted", label: "Posted" },
];

export const SOCIAL_STATUS_TINT: Record<
  SocialStatus,
  { bg: string; text: string; chip: string }
> = {
  idea: { bg: "#EDEAE3", text: "#3D3A33", chip: "#C8C6BF" },
  drafting: { bg: "#F5ECDA", text: "#7A5A1F", chip: "#D8A24A" },
  ready: { bg: "#E2ECF5", text: "#2E5A87", chip: "#7DA8D6" },
  scheduled: { bg: "#FCE7EF", text: "#A8345C", chip: "#FF5B8A" },
  posted: { bg: "#E5EFE2", text: "#3F6E3A", chip: "#7DAE73" },
};

export const IDEA_STATUSES: { value: IdeaStatus; label: string }[] = [
  { value: "raw", label: "Raw" },
  { value: "exploring", label: "Exploring" },
  { value: "greenlit", label: "Greenlit" },
  { value: "parked", label: "Parked" },
  { value: "killed", label: "Killed" },
];

export const IDEA_STATUS_TINT: Record<IdeaStatus, { bg: string; text: string }> = {
  raw: { bg: "#EDEAE3", text: "#3D3A33" },
  exploring: { bg: "#E2ECF5", text: "#2E5A87" },
  greenlit: { bg: "#E5EFE2", text: "#3F6E3A" },
  parked: { bg: "#EDEAE3", text: "#3D3A33" },
  killed: { bg: "#F5DCDC", text: "#8A3A3A" },
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};
