import { ACCENTS, accentPalette, harmonizedColors, paletteProperties, TOKEN_PROPERTIES, type Accent, type CustomColor } from './palette';

export type { Accent, CustomColor };

/** Light or dark: follow the system, or pin one. */
export type Theme = 'system' | 'light' | 'dark';

export const THEMES: readonly Theme[] = ['system', 'light', 'dark'];

/** style.css's default --surface, for the browser chrome when no accent overrides it. */
const SURFACE = { light: '#f9f9ff', dark: '#111318' } as const;

export function loadTheme(storage: Pick<Storage, 'getItem'> | null, key: string): Theme {
  const value = storage?.getItem(key);
  return THEMES.includes(value as Theme) ? (value as Theme) : 'system';
}

/** Keeps the theme under `key`; the default (system) removes it. */
export function saveTheme(storage: Pick<Storage, 'setItem' | 'removeItem'>, key: string, theme: Theme): void {
  try {
    if (theme === 'system') storage.removeItem(key);
    else storage.setItem(key, theme);
  } catch {
    // Storage full or blocked: the theme still applies for this session.
  }
}

export function loadAccent(storage: Pick<Storage, 'getItem'> | null, key: string): Accent {
  const value = storage?.getItem(key);
  return ACCENTS.includes(value as Accent) ? (value as Accent) : 'default';
}

/** Keeps the accent under `key`; the default removes it. */
export function saveAccent(storage: Pick<Storage, 'setItem' | 'removeItem'>, key: string, accent: Accent): void {
  try {
    if (accent === 'default') storage.removeItem(key);
    else storage.setItem(key, accent);
  } catch {
    // Storage full or blocked: the colour still applies for this session.
  }
}

/**
 * Picks the scheme with `data-theme` on the root (style.css follows it, including the light-dark()
 * a build lowers), sets the colour tokens from the accent's generated palette, or back to
 * style.css's for the default, and sets each `theme-color` meta to the matching surface.
 * `colors`, the app's own colours keyed by custom property, are set on the root too, harmonized
 * with the accent (see harmonizedColors): pass the same ones on every call.
 */
export function applyTheme(doc: Document, theme: Theme, accent: Accent = 'default', colors: Readonly<Record<string, CustomColor>> = {}): void {
  const root = doc.documentElement;
  const style = root.style;
  const palette = accentPalette(accent);
  if (theme === 'system') delete root.dataset.theme;
  else root.dataset.theme = theme;
  for (const property of TOKEN_PROPERTIES) style.removeProperty(property);
  if (palette) for (const [property, value] of paletteProperties(palette)) style.setProperty(property, value);
  for (const [property, c] of Object.entries(harmonizedColors(accent, colors))) style.setProperty(property, `light-dark(${c.light}, ${c.dark})`);
  for (const meta of doc.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    const scheme = theme === 'system' ? (meta.media.includes('dark') ? 'dark' : 'light') : theme;
    meta.content = palette ? palette[scheme].surface : SURFACE[scheme];
  }
}
