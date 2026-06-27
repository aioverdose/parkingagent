export function minutesFromMidnight(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function timesOverlap(
  a: number,
  b: number,
  toleranceMinutes: number = 15,
): boolean {
  return Math.abs(a - b) <= toleranceMinutes;
}

export function windowsOverlap(
  arrStart: number,
  arrEnd: number,
  depStart: number,
  depEnd: number,
  toleranceMinutes: number = 10,
): boolean {
  const arrivalCenter = arrStart + (arrEnd - arrStart) / 2;
  const departureCenter = depStart + (depEnd - depStart) / 2;
  return Math.abs(arrivalCenter - departureCenter) <= toleranceMinutes;
}

export function vehicleCompatible(
  a?: { type?: string | null; size?: string | null } | null,
  b?: { type?: string | null; size?: string | null } | null,
): boolean {
  if (!a || !b) return true;
  if (b.type && a.type && b.type !== a.type) return false;
  if (b.size && a.size && b.size !== a.size) return false;
  return true;
}

export function anonymousMemberId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return `Member #${Math.abs(hash).toString(16).toUpperCase().padStart(4, "0").slice(0, 4)}`;
}

export function describeSchedulePattern(
  daysOfWeek: number[],
  arrivalStart: number,
  arrivalEnd: number,
): string {
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = daysOfWeek.length === 5 && [1, 2, 3, 4, 5].every((d) => daysOfWeek.includes(d))
    ? "Mon-Fri"
    : daysOfWeek.map((d) => dayLabels[d]).join(", ");
  return `${days || "Any day"} ${formatMinutes(arrivalStart)}-${formatMinutes(arrivalEnd)}`;
}

export function computeNextOccurrence(
  daysOfWeek: number[],
  frequency: "daily" | "weekly" | "biweekly",
  referenceDate: Date = new Date(),
): string {
  const validDays = daysOfWeek.length > 0 ? daysOfWeek : [referenceDate.getDay()];
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);

  const maxDays = frequency === "biweekly" ? 14 : 7;
  for (let offset = 0; offset <= maxDays; offset++) {
    const candidate = new Date(start);
    candidate.setDate(start.getDate() + offset);
    if (!validDays.includes(candidate.getDay())) continue;
    if (frequency === "biweekly" && offset > 0 && offset % 14 !== 0 && !validDays.includes(referenceDate.getDay())) continue;
    return candidate.toISOString();
  }

  const fallback = new Date(start);
  fallback.setDate(start.getDate() + (frequency === "biweekly" ? 14 : 7));
  return fallback.toISOString();
}
