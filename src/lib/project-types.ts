export type UserRole = "leader" | "member" | "teacher";

export type BoardColumnKey = "backlog" | "inProgress" | "review" | "done";

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarColor: string;
}

export type ProjectStatus = "pending" | "active" | "archived";

export interface ProjectMetadata {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  leaderId: string;
  memberIds: string[];

  dueDate?: string;
  assets?: SubmissionAsset[];
}

export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface TaskChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: BoardColumnKey;
  assigneeId?: string;
  reporterId: string;
  priority: TaskPriority;
  tags: string[];
  dueDate?: string;
  checklist: TaskChecklistItem[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface KanbanColumnSnapshot {
  id: BoardColumnKey;
  title: string;
  description: string;
}

export type MilestoneStatus =
  | "upcoming"
  | "submitted"
  | "under-review"
  | "changes-requested"
  | "approved"
  | "graded";

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description: string;
  deadline: string;
  status: MilestoneStatus;
  latestSubmissionId?: string;
  createdAt: string;
}

export interface SubmissionAsset {
  id: string;
  name: string;
  url: string;
  type: "link" | "file";
}

export interface Submission {
  id: string;
  milestoneId: string;
  projectId: string;
  submittedBy: string;
  submittedAt: string;
  status: MilestoneStatus;
  summary: string;
  assets: SubmissionAsset[];
  feedbackThreadIds: string[];
  grade?: number;
}

export type FeedbackSentiment = "neutral" | "positive" | "warning";

export interface FeedbackMessage {
  id: string;
  submissionId: string;
  authorId: string;
  createdAt: string;
  content: string;
  requiresAction: boolean;
  sentiment: FeedbackSentiment;
  attachments: SubmissionAsset[];
}

export interface FeedbackThread {
  id: string;
  submissionId: string;
  subject: string;
  messages: FeedbackMessage[];
  resolved: boolean;
}

export interface ProjectSnapshot extends ProjectMetadata {
  columns: KanbanColumnSnapshot[];
  taskIds: string[];
  milestones: string[];
}

export interface ProjectState {
  projects: Record<string, ProjectSnapshot>;
  tasks: Record<string, Task>;
  users: Record<string, UserSummary>;
  milestones: Record<string, Milestone>;
  submissions: Record<string, Submission>;
  feedbackThreads: Record<string, FeedbackThread>;
}

export interface ProjectStore extends ProjectState {
  createProject: (
    input: Pick<ProjectMetadata, "name" | "description"> & {
      dueDate?: string;
      assets?: SubmissionAsset[];
    }
  ) => string;
  approveProject: (projectId: string) => void;
  inviteMember: (projectId: string, user: UserSummary) => void;
  updateTaskStatus: (
    taskId: string,
    status: BoardColumnKey,
    position?: number
  ) => void;
  createTask: (
    projectId: string,
    input: Partial<Omit<Task, "id" | "projectId" | "createdAt" | "updatedAt">>
  ) => string;
  updateTask: (
    taskId: string,
    input: Partial<Omit<Task, "id" | "projectId" | "createdAt" | "updatedAt">>
  ) => void;
  selectProject: (projectId: string) => void;
  setActiveTask: (taskId?: string) => void;
  setModalState: (key: ProjectModalKey, value: boolean) => void;
  createMilestone: (
    projectId: string,
    input: Pick<Milestone, "name" | "description" | "deadline">
  ) => string;
  submitMilestone: (
    milestoneId: string,
    submission: Pick<Submission, "summary" | "assets">
  ) => string;
  addFeedbackMessage: (
    threadId: string,
    message: Pick<
      FeedbackMessage,
      "content" | "attachments" | "sentiment" | "requiresAction"
    > & { authorId: string }
  ) => void;
  upsertFeedbackThread: (submissionId: string, subject: string) => string;
  setMilestoneStatus: (milestoneId: string, status: MilestoneStatus) => void;
  activeProjectId?: string;
  activeTaskId?: string;
  modalState: Record<ProjectModalKey, boolean>;
}

export type ProjectModalKey =
  | "createProject"
  | "inviteMember"
  | "createTask"
  | "submission"
  | "review";

