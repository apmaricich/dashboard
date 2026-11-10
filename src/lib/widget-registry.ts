import React from "react";
import LiturgicalCalendar from "../components/widgets/LiturgicalCalendar.js";
import Office from "../components/widgets/Office.js";
import ClockWidget from "../components/widgets/ClockWidget.js";
import MlxStatus from "../components/widgets/MlxStatus.js";
import SystemMetrics from "../components/widgets/SystemMetrics.js";
import Weather from "../components/widgets/Weather.js";
import WorkDay from "../components/widgets/WorkDay.js";
import LiturgicalYearProgress from "../components/widgets/LiturgicalYearProgress.js";
import DebugWidget from "../components/DebugWidget.js";

export interface WidgetTypeEntry {
  type: string;
  name: string;
  description: string;
  component: React.ComponentType<any>;
}

const registry: Record<string, WidgetTypeEntry> = {
  debug: {
    type: "debug",
    name: "Debug",
    description: "Real-time debug log output for development.",
    component: DebugWidget,
  },
  liturgical: {
    type: "liturgical",
    name: "Liturgical Calendar",
    description: "Today's liturgical season, feast, and readings.",
    component: LiturgicalCalendar,
  },
  office: {
    type: "office",
    name: "Office of the Hours",
    description: "Current divine office with prayer timing.",
    component: Office,
  },
  time: {
    type: "time",
    name: "Clock",
    description: "Digital clock using ink-big-text for large ASCII digits.",
    component: ClockWidget,
  },
  mlx: {
    type: "mlx",
    name: "MLX Status",
    description: "MLX-serve API status, models, and GPU utilization.",
    component: MlxStatus,
  },
  system: {
    type: "system",
    name: "System Metrics",
    description: "CPU, memory, disk, and network performance metrics.",
    component: SystemMetrics,
  },
  weather: {
    type: "weather",
    name: "Weather",
    description: "Current weather with location-based data.",
    component: Weather,
  },
  workday: {
    type: "workday",
    name: "Work Day",
    description: "Work day tracker with start/end time configuration.",
    component: WorkDay,
  },
  year_progress: {
    type: "year_progress",
    name: "Liturgical Year Progress",
    description: "Liturgical year timeline showing current season position.",
    component: LiturgicalYearProgress,
  },
};

export function getAllWidgetTypes(): WidgetTypeEntry[] {
  return Object.values(registry);
}

export function getWidgetByType(typeId: string): WidgetTypeEntry | undefined {
  return registry[typeId];
}
