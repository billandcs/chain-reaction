export function formatDateUtc(date?: Date | string | number | null) {
  if (!date) return "None";
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

export function formatTimeUtc(date?: Date | string | number | null) {
  if (!date) return "None";
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(date));
}

export function formatDateTimeUtc(date?: Date | string | number | null) {
  if (!date) return "None";
  return `${formatDateUtc(date)} ${formatTimeUtc(date)} UTC`;
}

export function formatMonthDayUtc(date: Date | string | number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  }).format(new Date(date));
}
