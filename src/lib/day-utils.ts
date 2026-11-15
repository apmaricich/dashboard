import { DayEntry, WidgetConfig } from "../config/loader.js";

/**
 * Expand a day set specification into a sorted array of ISO weekday numbers (1-7).
 * Handles named placeholders: "weekdays" (1-5), "weekends" (6-7), "all" (1-7).
 * Supports mixed arrays: ["weekdays", 7] expands to [1,2,3,4,5,7].
 */
export function expandDaySet(entries: DayEntry[]): number[] {
  const days = new Set<number>();

  for (const entry of entries) {
    if (typeof entry === "number") {
      days.add(entry);
    } else if (entry === "weekdays") {
      for (let i = 1; i <= 5; i++) {
        days.add(i);
      }
    } else if (entry === "weekends") {
      days.add(6);
      days.add(7);
    } else if (entry === "all") {
      for (let i = 1; i <= 7; i++) {
        days.add(i);
      }
    }
  }

  return [...days].sort((a, b) => a - b);
}

/**
 * Determine if a widget should be shown today based on its daysShown/daysHidden config.
 * Uses ISO weekdays (1=Monday...7=Sunday). If neither field is set, shows every day.
 * daysShown takes precedence over daysHidden if both are set.
 */
export function shouldShowWidget(widget: WidgetConfig): boolean {
  // get current day: js getDay() returns 0=Sun, 1=Mon, ... 6=Sat
  // convert to ISO: 0→7, 1→1, 2→2, ... 6→6
  const jsDay = new Date().getDay();
  const isoDay = jsDay === 0 ? 7 : jsDay;

  if (widget.daysShown !== undefined) {
    // Only show on specified days (empty array means never show)
    if (widget.daysShown.length === 0) return false;
    const shownDays = expandDaySet(widget.daysShown);
    return shownDays.includes(isoDay);
  }

  if (widget.daysHidden && widget.daysHidden.length > 0) {
    // Hide on specified days
    const hiddenDays = expandDaySet(widget.daysHidden);
    return !hiddenDays.includes(isoDay);
  }

  // Show every day
  return true;
}
