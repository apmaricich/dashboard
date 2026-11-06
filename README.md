# Terminal Dashboard

A configurable, flat-file-driven terminal dashboard built with [Ink](https://github.com/vadimdemedes/ink) (React for terminals). Features liturgical calendar, system metrics, MLX-serve status, and time/office widgets.

## Features

- **Liturgical Calendar** — Current liturgical season, feast/day, rank, and liturgical color using the [romcal](https://github.com/OmniscientReading/romcal) library
- **Time & Office** — Local and UTC time with the suggested Office of the Liturgy of the Hours (Lauds, Terce, Sext, None, Vespers, Compline)
- **MLX-serve Status** — Model, state, memory usage, context length, quantization, architecture, and capabilities of your locally running MLX-serve instance
- **System Metrics** — CPU load, memory usage, and GPU utilization with visual progress bars, updated every 5 seconds

## Requirements

- Node.js 22+
- npm

## Installation

```bash
# Install dependencies
npm install

# Build
npm run build

# Run
npm start
```

## Configuration

Configuration is stored in `config.yaml`. If the file is missing, the dashboard uses sensible defaults.

```yaml
layout:
  strategy: grid
  maxCols: 3
  theme: liturgical
  # Options: liturgical, seasonal
  header: "Dashboard"
  footer: "APM"

widgets:
  - name: "Liturgical Calendar"
    type: liturgical
    order: 1
    refresh: 3600

  - name: "Time & Office"
    type: time
    order: 2
    refresh: 60

  - name: "MLX Status"
    type: mlx
    order: 3
    refresh: 30

  - name: "System Metrics"
    type: system
    order: 4
    refresh: 5
```

### Layout Configuration

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `strategy` | string | `"grid"` | Layout algorithm (`grid` currently supported) |
| `maxCols` | integer | 3 | Maximum number of columns for grid layout |
| `theme` | string | `"liturgical"` | Theme identifier (`liturgical`, `seasonal`) |
| `header` | string | `"Dashboard"` | Header text displayed at the top |
| `footer` | string | - | Optional footer text |

### Widget Configuration

Each widget object requires:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display title for the widget |
| `type` | string | Yes | Widget type identifier (see below) |
| `order` | integer | Yes | Sort order within the layout |
| `refresh` | integer | Yes | Refresh interval in seconds (0 for manual only) |
| `params` | object | No | Type-specific parameters (reserved for future use) |

## Usage

### Run the Dashboard

```bash
# Run with default config.yaml
npm start

# Run with a custom config file
node dist/app.js --config /path/to/custom.yaml

# Test mode (render once and exit)
npx tsx src/app.tsx --once
```

### Development Mode

```bash
# Hot-reload during development
npm run dev
```

### Keyboard Shortcuts

- `q` — Quit the dashboard

## Widgets

### Liturgical Calendar (`type: liturgical`)

Displays today's liturgical information:

- Current liturgical season (Advent, Christmas, Lent, Easter, Ordinary Time, etc.)
- Feast or celebration name
- Rank (Solemnity, Feast, Memorial, etc.)
- Liturgical color with a color-coded indicator

Uses the [romcal](https://github.com/OmniscientReading/romcal) library for Roman calendar calculations. Refreshes hourly (3600s) since the liturgical calendar only changes daily.

### Time & Office (`type: time`)

Displays:

- Local time
- UTC time
- The currently suggested Office of the Liturgy of the Hours with its time range:
  - **Lauds** (Morning Prayer) — 6am–9am
  - **Terce** (Mid-morning) — 9am–12pm
  - **Sext** (Midday) — 12pm–3pm
  - **None** (Afternoon) — 3pm–6pm
  - **Vespers** (Evening) — 6pm–9pm
  - **Compline** (Night) — 9pm–6am

Refreshes every 60 seconds.

### MLX Status (`type: mlx`)

Monitors the locally running [MLX-serve](https://github.com/ml-explore/mlx-serve) instance at `http://localhost:11235`:

- Active model name
- Model state (ready/unloaded)
- Memory usage (resident and on-disk)
- Context length (formatted as K or M)
- Quantization scheme
- Architecture and layer count
- Capabilities (e.g., chat, completion)

Shows a connection error message if MLX-serve is unreachable. Refreshes every 30 seconds.

### System Metrics (`type: system`)

Displays system resource usage with visual progress bars:

- **CPU** — Overall load percentage
- **Memory** — Used/total with percentage
- **GPU** — Utilization percentage (on macOS, approximated via WindowServer process)

Uses the [`systeminformation`](https://github.com/sebhildebrandt/systeminformation) package. Refreshes every 5 seconds.

## Architecture

The dashboard follows a modular, extensible architecture:

- **Foundation Widget Pattern:** All widgets wrap themselves in `FoundationWidget`, which provides borders, theme colors, layout positioning, and error boundaries. This ensures consistent widget appearance and isolates widget failures.
- **Layout Engine:** Pluggable layout strategies (currently grid) compute widget positions based on terminal dimensions. The strategy is selected via configuration.
- **Theme System:** Dynamic theming using registered theme functions. The `liturgical` theme uses romcal to determine today's liturgical color.
- **Configuration-Driven:** Flat-file YAML configuration controls layout, widgets, and their order. No code changes are needed to rearrange or customize the dashboard.
- **useRefresh Hook:** A React hook that manages periodic data fetching with configurable intervals. Uses `useCallback` to prevent infinite re-renders.

### Key Files

| File | Purpose |
|------|---------|
| `src/app.tsx` | Application entry point and main shell |
| `src/config/loader.ts` | YAML config parsing and default configuration |
| `src/components/FoundationWidget.tsx` | Base widget wrapper with theme, borders, and error handling |
| `src/components/Layout.tsx` | Widget type registry and layout rendering |
| `src/hooks/useRefresh.ts` | Periodic data refresh hook |
| `src/lib/layout.ts` | Layout strategy registry and grid implementation |
| `src/themes/index.ts` | Theme registry |

## Development

### Adding a New Widget

1. **Create the widget component** in `src/components/widgets/`:

```tsx
// src/components/widgets/MyWidget.tsx
import React, { useCallback } from "react";
import { Box, Text } from "ink";
import useRefresh from "../../hooks/useRefresh.js";
import { useWidgetContext } from "../FoundationWidget.js";

const MyWidget = () => {
  const { theme } = useWidgetContext();
  const dataFn = useCallback(async () => {
    // Fetch data...
    return { value: 42 };
  }, []);

  const { data, isLoading, error } = useRefresh(30, dataFn);

  if (isLoading) {
    return <Box><Text>Loading...</Text></Box>;
  }

  if (error) {
    return <Box><Text color="red">Error: {error}</Text></Box>;
  }

  return <Box><Text>{data.value}</Text></Box>;
};

export default MyWidget;
```

2. **Register the widget type** in `src/components/Layout.tsx`:

```tsx
import MyWidget from "./widgets/MyWidget.js";
widgetRegistry.set("my-widget", MyWidget);
```

3. **Configure in YAML:**

```yaml
widgets:
  - name: "My Widget"
    type: my-widget
    order: 5
    refresh: 30
```

### Adding a New Theme

1. **Create a theme function** in `src/themes/`:

```tsx
// src/themes/mytheme.ts
import { ThemeFunction } from "../themes/index.js";

const myTheme: ThemeFunction = ({ date }) => ({
  id: "mytheme",
  colors: {
    primary: "white",
    border: "blue",
    text: "gray",
    background: "black",
    accent: "yellow",
  },
  borderStyle: "single",
});

export default myTheme;
```

2. **Register the theme** in `src/themes/index.ts`:

```tsx
import myTheme from "./mytheme.js";
registerTheme("mytheme", myTheme);
```

### Adding a New Layout Strategy

1. **Implement the strategy interface** in `src/lib/layout.ts`:

```tsx
export function myLayoutStrategy(options?: LayoutOptions): LayoutStrategy {
  return {
    compute(widgets, containerWidth, containerHeight, layoutOptions) {
      // Compute positions and return LayoutResult[]
      return results;
    }
  };
}
```

2. **Register the strategy:**

```tsx
registerLayoutStrategy("my-layout", myLayoutStrategy());
```

## Testing

Manual testing using the test harness:

```bash
npx tsx src/test-app.tsx --once
```

The `--once` flag renders the dashboard once and exits, making it suitable for automated or quick manual testing.

## Known Issues

- Widget content may be truncated in narrow terminals
- MLX-serve status requires the MLX-serve API to be running at `http://localhost:11235`
- GPU usage on macOS is approximated via the WindowServer process CPU usage
- Only the `grid` layout strategy is currently implemented
