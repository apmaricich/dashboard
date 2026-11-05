import { existsSync, readFileSync } from "fs";
import * as yaml from "js-yaml";

/**
 * Top-level dashboard configuration.
 * @property layout - Layout settings including strategy, column count, and theme
 * @property widgets - Ordered array of widget definitions to render
 */
export interface DashboardConfig {
  /** Layout configuration */
  layout: {
    /** Layout strategy identifier (e.g., 'grid', 'flex') */
    strategy: string;
    /** Maximum number of columns in the layout grid */
    maxCols: number;
    /** UI theme name (e.g., 'light', 'dark') */
    theme: string;
  };
  /** Array of widget configurations to render */
  widgets: WidgetConfig[];
}

/**
 * Configuration for a single dashboard widget.
 * @property name - Display name for the widget
 * @property type - Widget type identifier (e.g., 'chart', 'table', 'kpi')
 * @property order - Render order within the dashboard layout
 * @property refresh - Refresh interval in seconds
 * @property params - Optional type-specific configuration parameters
 */
export interface WidgetConfig {
  /** Human-readable display name for the widget */
  name: string;
  /** Widget type identifier determining renderer and behavior */
  type: string;
  /** Position order within the dashboard layout */
  order: number;
  /** Auto-refresh interval in seconds (0 for manual only) */
  refresh: number;
  /** Optional type-specific parameters (queries, thresholds, etc.) */
  params?: Record<string, unknown>;
}

/**
 * Load dashboard configuration from a YAML file.
 * @param path - Path to the YAML configuration file
 * @returns Parsed DashboardConfig object
 * @throws Error if file cannot be read or parsed
 */
export function loadConfig(path: string): DashboardConfig {
  if (!existsSync(path)) {
    throw new Error(`Config file not found: ${path}`);
  }
  const content = readFileSync(path, "utf-8");
  return yaml.load(content) as DashboardConfig;
}
