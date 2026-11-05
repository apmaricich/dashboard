export interface ThemeColors {
  primary: string;
  border: string;
  text: string;
  background: string;
  accent: string;
}

export interface Theme {
  id: string;
  colors: ThemeColors;
}

const themes: Record<string, Theme> = {};

export function registerTheme(theme: Theme) {
  themes[theme.id] = theme;
}

export function getTheme(id: string): Theme | null {
  return themes[id] ?? null;
}
