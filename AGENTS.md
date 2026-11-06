# Terminal Dashboard

A configurable, flat-file-driven terminal dashboard built with Ink (React for terminals). Features liturgical calendar, system metrics, MLX-serve status, and time/office widgets.

## Architecture

### Core Design Principles

- **Modular widget architecture:** Each widget is a self-contained React component
- **Foundation widget pattern:** All widgets wrap themselves in a `FoundationWidget` that provides layout, theme, and refresh cycle management
- **Layout engine:** Pluggable layout strategies (grid, spiral, etc.) with maxCols configuration
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
- **Layout Engine:** Computes widget positions based on strategy (grid, etc.). Handles widget wrapping when maxCols is exceeded.
- **Theme System:** Registered themes return color palettes. Liturgical theme uses romcal to determine today's liturgical color.

## Configuration

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

## Known Issues

- Widget content may be truncated in narrow terminals
- MLX-serve status requires the MLX-serve API to be running
- @mishieck/ink-titled-box is installed with --legacy-peer-deps due to a peer dependency mismatch with ink@8