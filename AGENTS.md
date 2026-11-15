# Terminal Dashboard

A configurable, flat-file-driven terminal dashboard built with Ink (React for terminals). Features liturgical calendar, system metrics, MLX-serve status, and time/office widgets.

## Architecture

### Core Design Principles

- **Modular widget architecture:** Each widget is a self-contained React component
- **Foundation widget pattern:** All widgets wrap themselves in a `FoundationWidget` that provides layout, theme, and refresh cycle management
- **Layout engine:** Pluggable layout strategies (grid, banner, etc.) with maxCols configuration. Banner layout places the first widget as a full-width top banner (25% of height) with remaining widgets in a grid below.
- **Theme system:** Dynamic theming with liturgical color support
- **Flat-file configuration:** All settings in `config.yaml`

### Project Structure

```
src/
├── app.tsx              # Main application shell
├── test-app.tsx         # Test harness for manual testing
├── config/
│   └── loader.ts        # YAML config parsing and validation
├── components/
│   ├── FoundationWidget.tsx   # Base widget wrapper (borders, theme, refresh)
│   ├── Layout.tsx             # Layout engine (grid strategy)
│   └── widgets/
│       ├── LiturgicalCalendar.tsx
│       ├── TimeOffice.tsx
│       ├── MlxStatus.tsx
│       └── SystemMetrics.tsx
├── hooks/
│   └── useRefresh.ts    # Periodic data refresh hook
├── lib/
│   ├── liturgical.ts    # Romcal integration for liturgical calendar
│   ├── mlx-status.ts    # MLX-serve API integration
│   ├── system.ts        # systeminformation package integration
│   ├── time.ts          # Time and office calculations
│   └── layout.ts        # Layout strategy implementations
├── themes/
│   ├── index.ts         # Theme registry
│   └── liturgical.ts    # Liturgical color theme
└── types/
    └── romcal.d.ts      # Romcal type declarations
```

### Key Components

- **FoundationWidget:** Provides borders, theme colors, and layout positioning for all widgets. Uses React Context to pass theme and layout info to children.
- **useRefresh Hook:** Manages periodic data fetching with configurable intervals. Uses `useCallback` to prevent infinite re-renders.
- **Layout Engine:** Computes widget positions based on strategy (grid, banner, etc.). Handles widget wrapping when maxCols is exceeded.
- **Theme System:** Registered themes return color palettes. Liturgical theme uses romcal to determine today's liturgical color.

## Configuration

```yaml
layout:
  strategy: grid
  # Options: grid, banner
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
  - name: "Image Widget"
    type: image
    order: 5
    params:
      path: ./assets/logo.png
      width: 40
      preserveAspectRatio: true
    refresh: 0
```

### Image Widget Configuration

The `image` widget renders an image using the `terminal-image` package. Available params:

- `path` (string, required): File path to the image (supports PNG, JPG, GIF, BMP, TIFF, etc.)
- `width` (number): Target width in character cells. If not set, image renders at its intrinsic width.
- `height` (number): Target height in character cells.
- `preserveAspectRatio` (boolean): Maintain the image's original aspect ratio when scaling (default: false).
- `preferNativeRender` (boolean): Use the terminal's native image rendering protocol if supported (Kitty, iTerm2); falls back to Unicode art otherwise. Set to false for consistent appearance across terminals.

Note: `refresh: 0` is recommended for static images. Use periodic refresh (e.g., `refresh: 2`) to animate GIFs. Layout dimensions are specified in character cells, not pixels.

Dependencies used by this widget: `terminal-image` for rendering, `sharp` for image processing (transitive).

### Widget Day-of-Week Visibility

Widgets can be configured to show or hide on specific days of the week using `daysShown` and `daysHidden` fields. ISO weekday numbers are used (1=Monday, 2=Tuesday, ..., 6=Saturday, 7=Sunday).

**Named placeholders:**
- `weekdays` — Monday through Friday ([1,2,3,4,5])
- `weekends` — Saturday and Sunday ([6,7])
- `all` — Every day ([1,2,3,4,5,6,7])

**Precedence rules:**
- If `daysShown` is specified, the widget appears only on those days
- If only `daysHidden` is specified, the widget appears on all other days
- If both are specified, `daysShown` takes precedence
- If neither is specified, the widget appears every day

**Example — weekday-only system metrics:**
```yaml
widgets:
  - name: "System Metrics"
    type: system
    order: 1
    daysShown: [weekdays]
    refresh: 5
```

**Example — hide MLX status on weekends:**
```yaml
widgets:
  - name: "MLX Status"
    type: mlx
    order: 2
    daysHidden: [weekends]
    refresh: 30
```

**Example — mixed usage:**
```yaml
widgets:
  - name: "Sunday Special"
    type: image
    order: 3
    daysShown: [weekdays, 7]  # Mon-Fri plus Sunday
    params:
      path: ./assets/sunday.png
    refresh: 0
```

## Build and Test

### Prerequisites

- Node.js 22+
- npm

### Install Dependencies

```bash
npm install
```

### Build

```bash
npm run build
```

Compiles TypeScript to JavaScript in `dist/`.

### Run

```bash
npm start
```

### Test

Manual testing with the test harness:

```bash
npx tsx src/test-app.tsx --once
```

The `--once` flag makes the app render once and exit (useful for automated testing).

### Development

Hot-reload with nodemon:

```bash
npm run dev
```

## Dependencies

- **ink:** React for terminals
- **romcal:** Liturgical calendar computation
- **systeminformation:** System metrics
- **js-yaml:** YAML parsing
- **@mishieck/ink-titled-box:** Titled borders for widget headers (installed via --legacy-peer-deps)

## Pagination

When more widgets are configured than can fit on one screen (`maxCols × maxRows`), the dashboard splits them across multiple pages. Only the current page's widgets are rendered.

Keyboard navigation:
- `←` or `h` — Previous page
- `→` or `l` — Next page
- `q` — Quit (always)

Page indicator appears in the footer when `totalPages > 1`.

## Known Issues

- Widget content may be truncated in narrow terminals
- MLX-serve status requires the MLX-serve API to be running
- @mishieck/ink-titled-box is installed with --legacy-peer-deps due to a peer dependency mismatch with ink@8