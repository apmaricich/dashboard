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
    /** Optional header text */
    header?: string;
    /** Optional footer text */
    footer?: string;
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
/**
 * Default configuration used when no config file is provided.
 */
const DEFAULT_CONFIG: DashboardConfig = {
  layout: {
    strategy: "grid",
    maxCols: 3,
    theme: "liturgical",
    header: "Dashboard",
  },
  widgets: [
    {
      name: "Liturgical Calendar",
      type: "liturgical",
      order: 1,
      refresh: 3600,
    },
    {
      name: "Time & Office",
      type: "time",
      order: 2,
      refresh: 60,
    },
    {
      name: "MLX Status",
      type: "mlx",
      order: 3,
      refresh: 30,
    },
    {
      name: "System Metrics",
      type: "system",
      order: 4,
      refresh: 5,
    },
  ],
};

/**
 * Load dashboard configuration from a YAML file.
 * @param path - Path to the YAML configuration file
 * @returns Parsed DashboardConfig object, or the default if no path or file not found
 * @throws Error if the file exists but cannot be parsed
 */
export function loadConfig(path: string): DashboardConfig {
  if (!existsSync(path)) {
    return DEFAULT_CONFIG;
  }
  try {
    const content = readFileSync(path, "utf-8");
    return yaml.load(content) as DashboardConfig;
  } catch (err) {
    throw new Error(`Failed to parse config file ${path}: ${err}`);
  }
}
