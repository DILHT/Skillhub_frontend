export interface SectionedNotifications<T> {
  title: string;
  data: T[];
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfDay = (d: Date) => {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
};

const getBucket = (createdAt: string | Date, now: Date): string => {
  const date = new Date(createdAt);
  const today = startOfDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  const diffDays = Math.floor(
    (today.getTime() - startOfDay(date).getTime()) / 86400000
  );
  if (diffDays > 0 && diffDays < 7) return "This Week";

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("en-US", { month: "long" });
  }
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const BUCKET_PRIORITY = ["Today", "Yesterday", "This Week"];

export function groupNotificationsByDate<T extends { createdAt: string | Date }>(
  notifications: T[],
  now: Date = new Date()
): SectionedNotifications<T>[] {
  const map = new Map<string, T[]>();

  for (const item of notifications) {
    const bucket = getBucket(item.createdAt, now);
    if (!map.has(bucket)) map.set(bucket, []);
    map.get(bucket)!.push(item);
  }

  const priorityKeys = BUCKET_PRIORITY.filter((k) => map.has(k));
  const monthKeys = [...map.keys()]
    .filter((k) => !BUCKET_PRIORITY.includes(k))
    .sort((a, b) => {
      const aFirst = map.get(a)![0].createdAt;
      const bFirst = map.get(b)![0].createdAt;
      return new Date(bFirst).getTime() - new Date(aFirst).getTime();
    });

  return [...priorityKeys, ...monthKeys].map((title) => ({
    title,
    data: map.get(title)!,
  }));
}