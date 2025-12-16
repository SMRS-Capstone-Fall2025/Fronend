const defaultDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
});

const defaultDateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export type DateFormatterLike = Pick<Intl.DateTimeFormat, "format">;

export function parseDateValue(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (!trimmed.includes("T") && trimmed.length === 10) {
    const [year, month, day] = trimmed.split("-").map(Number);
    if ([year, month, day].some((part) => Number.isNaN(part))) return undefined;
    const result = new Date(year, (month ?? 1) - 1, day);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
}

export function formatDateOnly(date: Date): string {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, "0");
  const day = String(normalized.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateDisplay(
  value?: string | null,
  formatter: DateFormatterLike = defaultDateFormatter
): string | undefined {
  const date = parseDateValue(value ?? undefined);
  if (!date) return undefined;
  return formatter.format(date);
}

export function formatDateTimeDisplay(
  value?: string | null,
  formatter: DateFormatterLike = defaultDateTimeFormatter
): string | undefined {
  const date = parseDateValue(value ?? undefined);
  if (!date) return undefined;
  return formatter.format(date);
}
