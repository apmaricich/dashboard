import { existsSync, readFileSync } from "fs";
import * as yaml from "js-yaml";

/**
 * Top-level dashboard configuration.
 * @property layout - Layout settings including strategy, column count, and theme
 * @property widgets - Ordered array of widget definitions to render
 */
/**
 * Theme refresh configuration.
 * Exactly one of intervalHours or atHour should be specified.
 */
export interface ThemeRefreshConfig {
  /** Refresh theme every N hours */
  intervalHours?: number;
  /** Refresh theme at a specific hour of day (24h format) */
  atHour?: number;
}

export interface DashboardConfig {
  /** Layout configuration */
  layout: {
    /** Layout strategy identifier (e.g., 'grid', 'flex') */
    strategy: string;
    /** Maximum number of columns in the layout grid */
    maxCols: number;
    /** Maximum number of rows in the layout grid (default: 2) */
    maxRows?: number;
    /** UI theme name (e.g., 'light', 'dark') */
    theme: string;
    /** Optional header text */
    header?: string;
    /** Optional footer text */
    footer?: string;
    /** Optional theme refresh configuration */
    themeRefresh?: ThemeRefreshConfig;
  };
  /** Array of widget configurations to render */
  widgets: WidgetConfig[];
  /** Maximum widgets that fit on a single page (computed from maxCols * maxRows) */
  maxWidgetsPerPage: number;
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
  /** When true, center the widget content within its box */
  center?: boolean;
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
    maxRows: 2,
    theme: "liturgical",
    header: "Dashboard",
  },
  maxWidgetsPerPage: 6,
  widgets: [
    {
      name: "Liturgical Calendar",
      type: "liturgical",
      order: 1,
      refresh: 3600,
      params: { showProgress: true },
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
    const raw = yaml.load(content) as DashboardConfig;

    // Compute maxWidgetsPerPage from maxCols * maxRows
    const maxRows = raw.layout?.maxRows ?? 2;
    const maxCols = raw.layout?.maxCols ?? 3;

    if (!Number.isInteger(maxRows) || maxRows <= 0) {
      throw new Error("layout.maxRows must be a positive integer");
    }
    if (!Number.isInteger(maxCols) || maxCols <= 0) {
      throw new Error("layout.maxCols must be a positive integer");
    }

    return {
      ...raw,
      layout: { ...raw.layout, maxRows },
      maxWidgetsPerPage: maxCols * maxRows,
    };
  } catch (err) {
    throw new Error(`Failed to parse config file ${path}: ${err}`);
  }
}
