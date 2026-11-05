export interface TimeInfo {
  now: Date;
  hour24: number;
  hour12: number;
  ampm: string;
}

export function getTimeInfo(): TimeInfo {
  const now = new Date();
  const h = now.getHours();
  return {
    now,
    hour24: h,
    hour12: h % 12 || 12,
    ampm: h < 12 ? "AM" : "PM",
  };
}
