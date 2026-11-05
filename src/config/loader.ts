import { existsSync, readFileSync } from "fs";
import * as yaml from "js-yaml";

export interface DashboardConfig {
  layout: {
    strategy: string;
    maxCols: number;
    theme: string;
  };
  widgets: WidgetConfig[];
}

export interface WidgetConfig {
  name: string;
  type: string;
  order: number;
  refresh: number;
  params?: Record<string, unknown>;
}

export function loadConfig(path: string): DashboardConfig {
  const content = readFileSync(path, "utf-8");
  return yaml.load(content) as DashboardConfig;
}
