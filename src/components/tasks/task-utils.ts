export const getInitials = (value?: string | null) => {
  if (!value) return "NV";
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "NV";
  if (parts.length === 1) {
    const [first] = parts;
    return first.slice(0, 2).toUpperCase();
  }
  const first = parts[0]?.[0];
  const last = parts[parts.length - 1]?.[0];
  return `${first ?? ""}${last ?? ""}`.toUpperCase();
};

