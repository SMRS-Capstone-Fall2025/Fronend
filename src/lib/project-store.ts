import { addDays, formatISO, subDays } from "date-fns";
import { create, type GetState, type SetState } from "zustand";
import {
  BoardColumnKey,
  FeedbackMessage,
  FeedbackThread,
  Milestone,
  MilestoneStatus,
  ProjectMetadata,
  ProjectModalKey,
  ProjectSnapshot,
  ProjectStore,
  SubmissionAsset,
  Submission,
  Task,
  TaskChecklistItem,
  UserSummary,
} from "./project-types";

const createId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

export const boardColumns: ProjectSnapshot["columns"] = [
  {
    id: "backlog",
    title: "Backlog",
    description: "Ideas and tasks waiting for grooming",
  },
  {
    id: "inProgress",
    title: "In Progress",
    description: "Currently being worked on",
  },
  {
    id: "review",
    title: "Review",
    description: "Awaiting peer or instructor review",
  },
  {
    id: "done",
    title: "Done",
    description: "Completed tasks",
  },
];

const cloneColumns = (): ProjectSnapshot["columns"] =>
  boardColumns.map((column) => ({ ...column }));

const modalDefaults: Record<ProjectModalKey, boolean> = {
  createProject: false,
  inviteMember: false,
  createTask: false,
  submission: false,
  review: false,
};

const now = new Date();

const makeUser = (
  input: Partial<UserSummary> & { id: string }
): UserSummary => ({
  name: "Unnamed",
  email: "placeholder@example.com",
  role: "member",
  avatarColor: "#64748b",
  ...input,
});

const users: Record<string, UserSummary> = {
  u1: makeUser({
    id: "u1",
    name: "Linh Nguyen",
    email: "linh.nguyen@example.com",
    role: "leader",
    avatarColor: "#6366f1",
  }),
  u2: makeUser({
    id: "u2",
    name: "Bao Tran",
    email: "bao.tran@example.com",
    avatarColor: "#f97316",
  }),
  u3: makeUser({
    id: "u3",
    name: "Hoa Pham",
    email: "hoa.pham@example.com",
    avatarColor: "#10b981",
  }),
  u4: makeUser({
    id: "u4",
    name: "Prof. An",
    email: "an.prof@example.com",
    role: "teacher",
    avatarColor: "#0ea5e9",
  }),
};

const buildChecklist = (labels: string[]): TaskChecklistItem[] =>
  labels.map((label, index) => ({
    id: `chk-${index}`,
    label,
    completed: index === labels.length - 1,
  }));

const tasks: Record<string, Task> = {
  t1: {
    id: "t1",
    projectId: "p1",
    title: "Define research backlog",
    description:
      "Gather requirements from stakeholders and outline initial research backlog.",
    status: "backlog",
    assigneeId: "u2",
    reporterId: "u1",
    priority: "high",
    tags: ["planning", "research"],
    dueDate: formatISO(addDays(now, 3)),
    checklist: buildChecklist([
      "Interview stakeholders",
      "Synthesize notes",
      "Draft backlog",
    ]),
    attachments: [],
    createdAt: formatISO(subDays(now, 4)),
    updatedAt: formatISO(subDays(now, 1)),
  },
  t2: {
    id: "t2",
    projectId: "p1",
    title: "Design experiment protocols",
    description:
      "Create repeatable protocols for testing the hypothesis across focus groups.",
    status: "inProgress",
    assigneeId: "u3",
    reporterId: "u1",
    priority: "critical",
    tags: ["ux", "experiment"],
    checklist: buildChecklist([
      "Outline methodology",
      "Peer review with instructors",
      "Publish protocol",
    ]),
    attachments: ["https://example.com/protocol.pdf"],
    createdAt: formatISO(subDays(now, 6)),
    updatedAt: formatISO(now),
  },
  t3: {
    id: "t3",
    projectId: "p1",
    title: "Run pilot usability test",
    description: "Test protocol with 5 participants and synthesize learnings.",
    status: "review",
    assigneeId: "u2",
    reporterId: "u3",
    priority: "medium",
    tags: ["testing"],
    checklist: buildChecklist([
      "Recruit participants",
      "Conduct sessions",
      "Publish insights",
    ]),
    attachments: [],
    createdAt: formatISO(subDays(now, 2)),
    updatedAt: formatISO(now),
  },
};

const milestones: Record<string, Milestone> = {
  m1: {
    id: "m1",
    projectId: "p1",
    name: "Milestone 1: Research Proposal",
    description: "Submit proposal deck and supporting documents",
    deadline: formatISO(addDays(now, 7)),
    status: "changes-requested",
    latestSubmissionId: "s1",
    createdAt: formatISO(subDays(now, 14)),
  },
  m2: {
    id: "m2",
    projectId: "p1",
    name: "Milestone 2: Pilot Results",
    description: "Summarize pilot study learnings",
    deadline: formatISO(addDays(now, 21)),
    status: "upcoming",
    createdAt: formatISO(subDays(now, 7)),
  },
};

const submissions: Record<string, Submission> = {
  s1: {
    id: "s1",
    milestoneId: "m1",
    projectId: "p1",
    submittedBy: "u1",
    submittedAt: formatISO(subDays(now, 3)),
    status: "changes-requested",
    summary: "Initial proposal draft with hypotheses and research plan.",
    assets: [
      {
        id: "asset-1",
        name: "Proposal Deck",
        url: "https://example.com/proposal.pdf",
        type: "link",
      },
      {
        id: "asset-2",
        name: "Research Canvas",
        url: "https://example.com/research-canvas",
        type: "link",
      },
    ],
    feedbackThreadIds: ["thread-1"],
  },
};

const feedbackThreads: Record<string, FeedbackThread> = {
  "thread-1": {
    id: "thread-1",
    submissionId: "s1",
    subject: "Proposal revisions",
    resolved: false,
    messages: [
      {
        id: "msg-1",
        submissionId: "s1",
        authorId: "u4",
        createdAt: formatISO(subDays(now, 2)),
        content:
          "Great structure overall. Please deepen the risk assessment and outline contingency plans.",
        requiresAction: true,
        sentiment: "warning",
        attachments: [],
      },
      {
        id: "msg-2",
        submissionId: "s1",
        authorId: "u1",
        createdAt: formatISO(subDays(now, 1)),
        content:
          "Thanks for the feedback! We've attached the revised risk matrix.",
        requiresAction: false,
        sentiment: "positive",
        attachments: [
          {
            id: "asset-3",
            name: "Risk Matrix",
            url: "https://example.com/risk-matrix",
            type: "link",
          },
        ],
      },
    ],
  },
};

const projects: Record<string, ProjectSnapshot> = {
  p1: {
    id: "p1",
    name: "UX Research for Learning Platform",
    description:
      "Validate new onboarding flows through qualitative and quantitative studies.",
    status: "active",
    createdAt: formatISO(subDays(now, 30)),
    updatedAt: formatISO(now),
    leaderId: "u1",
    memberIds: ["u1", "u2", "u3", "u4"],
    columns: cloneColumns(),
    taskIds: Object.keys(tasks),
    milestones: Object.keys(milestones),
  },
  p2: {
    id: "p2",
    name: "STEM Outreach Curriculum",
    description: "Design project-based curriculum for high schools in Hanoi.",
    status: "pending",
    createdAt: formatISO(subDays(now, 10)),
    updatedAt: formatISO(subDays(now, 2)),
    leaderId: "u1",
    memberIds: ["u1"],
    columns: cloneColumns(),
    taskIds: [],
    milestones: [],
  },
};

export const useProjectStore = create<ProjectStore>(
  (set: SetState<ProjectStore>, get: GetState<ProjectStore>) => ({
    projects,
    tasks,
    users,
    milestones,
    submissions,
    feedbackThreads,
    activeProjectId: "p1",
    activeTaskId: undefined,
    modalState: { ...modalDefaults },

    createProject: (
      input: Pick<ProjectMetadata, "name" | "description"> & {
        dueDate?: string;
        assets?: SubmissionAsset[];
      }
    ) => {
      const id = createId();
      const metadata: ProjectMetadata = {
        id,
        name: input.name,
        description: input.description,
        status: "pending",
        createdAt: formatISO(new Date()),
        updatedAt: formatISO(new Date()),
        leaderId: "u1",
        memberIds: ["u1"],
        dueDate: input.dueDate,
        assets: input.assets ?? [],
      };

      set((state: ProjectStore) => ({
        projects: {
          ...state.projects,
          [id]: {
            ...metadata,
            columns: cloneColumns(),
            taskIds: [],
            milestones: [],
          },
        },
      }));

      if (input.dueDate) {
        get().createMilestone(id, {
          name: "Initial deadline",
          description: "Project-level deadline",
          deadline: input.dueDate,
        });
      }

      return id;
    },

    approveProject: (projectId: string) => {
      set((state: ProjectStore) => {
        const project = state.projects[projectId];
        if (!project) return state;
        return {
          projects: {
            ...state.projects,
            [projectId]: {
              ...project,
              status: "active",
              updatedAt: formatISO(new Date()),
            },
          },
        };
      });
    },

    inviteMember: (projectId: string, user: UserSummary) => {
      set((state: ProjectStore) => {
        const project = state.projects[projectId];
        if (!project) return state;
        const memberIds = project.memberIds.includes(user.id)
          ? project.memberIds
          : [...project.memberIds, user.id];

        return {
          projects: {
            ...state.projects,
            [projectId]: {
              ...project,
              memberIds,
              updatedAt: formatISO(new Date()),
            },
          },
          users: {
            ...state.users,
            [user.id]: { ...user },
          },
        };
      });
    },

    updateTaskStatus: (
      taskId: string,
      status: BoardColumnKey
    ) => {
      set((state: ProjectStore) => {
        const task = state.tasks[taskId];
        if (!task) return state;
        const project = state.projects[task.projectId];
        if (!project) return state;

        const updatedTask: Task = {
          ...task,
          status,
          updatedAt: formatISO(new Date()),
        };

        const ordered = state.projects[project.id].taskIds
          .filter((id: string) => id !== taskId)
          .concat(taskId);

        return {
          tasks: {
            ...state.tasks,
            [taskId]: updatedTask,
          },
          projects: {
            ...state.projects,
            [project.id]: {
              ...project,
              taskIds: ordered,
            },
          },
        };
      });
    },

    createTask: (
      projectId: string,
      input: Partial<Omit<Task, "id" | "projectId" | "createdAt" | "updatedAt">>
    ) => {
      const id = createId();
      const baseTask: Task = {
        id,
        projectId,
        title: input.title ?? "Untitled task",
        description:
          input.description ??
          "Describe the task objectives, constraints, and success metrics.",
        status: input.status ?? "backlog",
        assigneeId: input.assigneeId,
        reporterId:
          input.reporterId ?? get().projects[projectId]?.leaderId ?? "u1",
        priority: input.priority ?? "medium",
        tags: input.tags ?? [],
        dueDate: input.dueDate,
        checklist: input.checklist ?? [],
        attachments: input.attachments ?? [],
        createdAt: formatISO(new Date()),
        updatedAt: formatISO(new Date()),
      };

      set((state: ProjectStore) => {
        const project = state.projects[projectId];
        if (!project) return state;
        return {
          tasks: {
            ...state.tasks,
            [id]: baseTask,
          },
          projects: {
            ...state.projects,
            [projectId]: {
              ...project,
              taskIds: [...project.taskIds, id],
              updatedAt: formatISO(new Date()),
            },
          },
        };
      });

      return id;
    },

    updateTask: (
      taskId: string,
      input: Partial<Omit<Task, "id" | "projectId" | "createdAt" | "updatedAt">>
    ) => {
      set((state: ProjectStore) => {
        const task = state.tasks[taskId];
        if (!task) return state;
        const updated: Task = {
          ...task,
          ...input,
          updatedAt: formatISO(new Date()),
        };
        return {
          tasks: {
            ...state.tasks,
            [taskId]: updated,
          },
        };
      });
    },

    selectProject: (projectId: string) => {
      set({ activeProjectId: projectId, activeTaskId: undefined });
    },

    setActiveTask: (taskId?: string) => {
      set({ activeTaskId: taskId });
    },

    setModalState: (key: ProjectModalKey, value: boolean) => {
      set((state: ProjectStore) => ({
        modalState: {
          ...state.modalState,
          [key]: value,
        },
      }));
    },

    createMilestone: (
      projectId: string,
      input: Pick<Milestone, "name" | "description" | "deadline">
    ) => {
      const id = createId();
      const milestone: Milestone = {
        id,
        projectId,
        name: input.name,
        description: input.description,
        deadline: input.deadline,
        status: "upcoming",
        createdAt: formatISO(new Date()),
      };

      set((state: ProjectStore) => {
        const project = state.projects[projectId];
        if (!project) return state;
        return {
          milestones: {
            ...state.milestones,
            [id]: milestone,
          },
          projects: {
            ...state.projects,
            [projectId]: {
              ...project,
              milestones: [...project.milestones, id],
              updatedAt: formatISO(new Date()),
            },
          },
        };
      });

      return id;
    },

    submitMilestone: (
      milestoneId: string,
      submissionInput: Pick<Submission, "summary" | "assets">
    ) => {
      const milestone = get().milestones[milestoneId];
      if (!milestone) return createId();
      const id = createId();

      const submission: Submission = {
        id,
        milestoneId,
        projectId: milestone.projectId,
        submittedBy: get().projects[milestone.projectId]?.leaderId ?? "u1",
        submittedAt: formatISO(new Date()),
        status: "submitted",
        summary: submissionInput.summary,
        assets: submissionInput.assets,
        feedbackThreadIds: [],
      };

      set((state: ProjectStore) => {
        const project = state.projects[milestone.projectId];
        if (!project) return state;
        const milestoneRecord = state.milestones[milestoneId];
        if (!milestoneRecord) return state;
        return {
          submissions: {
            ...state.submissions,
            [id]: submission,
          },
          milestones: {
            ...state.milestones,
            [milestoneId]: {
              ...milestoneRecord,
              status: "submitted",
              latestSubmissionId: id,
            },
          },
          projects: {
            ...state.projects,
            [project.id]: { ...project },
          },
        };
      });

      return id;
    },

    addFeedbackMessage: (
      threadId: string,
      message: Pick<
        FeedbackMessage,
        "content" | "attachments" | "sentiment" | "requiresAction"
      > & { authorId: string }
    ) => {
      set((state: ProjectStore) => {
        const thread = state.feedbackThreads[threadId];
        if (!thread) return state;
        const newMessage: FeedbackMessage = {
          id: createId(),
          submissionId: thread.submissionId,
          authorId: message.authorId,
          createdAt: formatISO(new Date()),
          content: message.content,
          requiresAction: message.requiresAction,
          sentiment: message.sentiment,
          attachments: message.attachments,
        };
        return {
          feedbackThreads: {
            ...state.feedbackThreads,
            [threadId]: {
              ...thread,
              messages: [...thread.messages, newMessage],
              resolved: !message.requiresAction,
            },
          },
        };
      });
    },

    upsertFeedbackThread: (submissionId: string, subject: string) => {
      const existing = (
        Object.values(get().feedbackThreads) as FeedbackThread[]
      ).find(
        (thread) =>
          thread.submissionId === submissionId && thread.subject === subject
      );
      if (existing) return existing.id;
      const id = createId();
      const newThread: FeedbackThread = {
        id,
        submissionId,
        subject,
        messages: [],
        resolved: false,
      };

      set((state: ProjectStore) => {
        const submission = state.submissions[submissionId];
        if (!submission) return state;
        return {
          feedbackThreads: {
            ...state.feedbackThreads,
            [id]: newThread,
          },
          submissions: {
            ...state.submissions,
            [submissionId]: {
              ...submission,
              feedbackThreadIds: [...submission.feedbackThreadIds, id],
            },
          },
        };
      });

      return id;
    },

    setMilestoneStatus: (milestoneId: string, status: MilestoneStatus) => {
      set((state: ProjectStore) => {
        const milestone = state.milestones[milestoneId];
        if (!milestone) return state;
        return {
          milestones: {
            ...state.milestones,
            [milestoneId]: { ...milestone, status },
          },
        };
      });
    },
  })
);

