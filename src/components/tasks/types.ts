export type ProjectMemberOption = {
  readonly value: string;
  readonly label: string;
  readonly description?: string;
  readonly status?: string | null;
  readonly role?: string | null;
};

export type MilestoneFilterOption = {
  readonly value: string;
  readonly label: string;
  readonly progressPercent: number | null;
  readonly status?: string | null;
  readonly dueDateDisplay?: string | null;
};

