import React from "react";
import {
  render,
  useApp,
  useInput,
  useWindowSize,
  useStdin,
  Box,
  Text,
} from "ink";
import { readFileSync } from "fs";
import { loadConfig, DashboardConfig } from "./config/loader.js";
import { getTheme, Theme } from "./themes/index.js";
import { getLayoutStrategy, LayoutResult } from "./lib/layout.js";
import Layout from "./components/Layout.js";
import CallupOverlay from "./components/CallupOverlay.js";
import { useCallup } from "./hooks/useCallup.js";

// Read version from package.json (from project root)
const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
const APP_VERSION = pkg.version;

/**
 * Main dashboard component.
 */
const Dashboard = ({ config }: { config: DashboardConfig }) => {
  const app = useApp();
  const { columns, rows } = useWindowSize();
  const { isRawModeSupported } = useStdin();
  const [theme, setTheme] = React.useState<Theme>(
    getTheme(config.layout.theme, { date: new Date() })
  );
  const [layout, setLayout] = React.useState<LayoutResult[]>([]);
  const [configLoaded, setConfigLoaded] = React.useState(false);

  const callup = useCallup();

  React.useEffect(() => {
    setConfigLoaded(true);
  }, []);

  // Compute layout when terminal size changes
  React.useEffect(() => {
    if (!configLoaded) return;

    const computeLayout = () => {
      const strategy = getLayoutStrategy(config.layout.strategy);
      const layoutResults = strategy.compute(
        config.widgets,
        columns,
        rows - 1, // Reserve row for header and footer
        {
          maxCols: config.layout.maxCols,
        }
      );
      setLayout(layoutResults);
    };

    computeLayout();
  }, [app, config, configLoaded, columns, rows]);

  // Handle keyboard shortcuts
  if (isRawModeSupported) {
    useInput((input, key) => {
      if (input === "q") {
        app.exit();
      } else {
        callup.handleInput(input, key);
      }
    });
  }

  if (!configLoaded) {
    return (
      <Box>
        <Text>Loading dashboard configuration...</Text>
      </Box>
    );
  }

  // Callup data from hook
  const {
    open: callupOpen,
    query: callupQuery,
    selected: callupSelected,
    activeWidget,
    select: callupSelect,
    displayResults: filteredResults,
    activeWidgetComponent,
  } = callup;

  return (
    <Box flexDirection="column" height={rows}>
      <Box height={1}>
        <Text bold color="cyan">{config.layout.header}</Text>
        <Box flexGrow={1} />
        <Text color="gray">[c]allup [q]uit</Text>
      </Box>
      {callupOpen ? (
        <CallupOverlay
          query={callupQuery}
          results={filteredResults}
          selected={callupSelected}
          activeWidgetType={activeWidget}
          activeWidgetComponent={activeWidgetComponent}
          onQueryChange={() => {}}
          onSelect={callupSelect}
        />
      ) : (
        <Box backgroundColor={theme.colors.background} flexGrow={1}>
          <Layout
            widgets={config.widgets}
            layout={layout}
            theme={theme}
            columns={columns}
            rows={rows}
          />
        </Box>
      )}
      <Box height={1}>
        <Text bold color="cyan">{config.layout.footer}</Text>
        <Box flexGrow={1} />
        <Text color="gray">v{APP_VERSION}</Text>
      </Box>
    </Box>
  );
};

/**
 * Application entry point.
 */
async function main() {
  // Load configuration
  let configPath = "config.yaml";
  if (process.argv.includes("--config")) {
    const idx = process.argv.indexOf("--config");
    if (idx + 1 < process.argv.length) {
      configPath = process.argv[idx + 1];
    }
  }

  let config: DashboardConfig;
  try {
    config = loadConfig(configPath);
  } catch (err) {
    console.error(`Failed to load configuration: ${err}`);
    process.exit(1);
  }

  const { waitUntilExit } = render(<Dashboard config={config} />);

  // Support --once flag for testing (render once and exit)
  if (process.argv.includes("--once")) {
    setTimeout(() => {
      process.exit(0);
    }, 500);
  }

  await waitUntilExit();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
