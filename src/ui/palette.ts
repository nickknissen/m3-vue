import { argbFromHex, DynamicScheme, Hct, hexFromArgb, SchemeTonalSpot } from '@material/material-color-utilities';

export type Accent = 'default' | 'teal' | 'green' | 'amber' | 'red' | 'purple';

const SEEDS: Record<Exclude<Accent, 'default'>, string> = {
  teal: '#00897b',
  green: '#43a047',
  amber: '#ffb300',
  red: '#e53935',
  purple: '#8e24aa',
};

export const ACCENTS: readonly Accent[] = ['default', 'teal', 'green', 'amber', 'red', 'purple'];

const TOKENS = [
  'primary',
  'on-primary',
  'primary-container',
  'on-primary-container',
  'secondary',
  'on-secondary',
  'secondary-container',
  'on-secondary-container',
  'tertiary',
  'on-tertiary',
  'tertiary-container',
  'on-tertiary-container',
  'error',
  'on-error',
  'error-container',
  'on-error-container',
  'surface',
  'on-surface',
  'on-surface-variant',
  'surface-container-lowest',
  'surface-container-low',
  'surface-container',
  'surface-container-high',
  'surface-container-highest',
  'outline',
  'outline-variant',
  'inverse-surface',
  'inverse-on-surface',
  'inverse-primary',
] as const;

export type Token = (typeof TOKENS)[number];

export interface Palette {
  light: Record<Token, string>;
  dark: Record<Token, string>;
}

const DEFAULT_SWATCH = {
  light: ['#1a5fd0', '#dae2f9', '#fad8fd'],
  dark: ['#aec6ff', '#3e4759', '#573e5c'],
};

const SWATCH_TOKENS = ['primary', 'secondary-container', 'tertiary-container'] as const;

const camel = (token: Token) => token.replace(/-(\w)/g, (_, c: string) => c.toUpperCase()) as keyof DynamicScheme;

function tokens(scheme: DynamicScheme): Record<Token, string> {
  return Object.fromEntries(TOKENS.map((token) => [token, hexFromArgb(scheme[camel(token)] as number)])) as Record<Token, string>;
}

export function accentPalette(accent: Accent): Palette | null {
  if (accent === 'default') return null;
  const source = Hct.fromInt(argbFromHex(SEEDS[accent]));
  return {
    light: tokens(new SchemeTonalSpot(source, false, 0, '2021')),
    dark: tokens(new SchemeTonalSpot(source, true, 0, '2021')),
  };
}

export function paletteProperties(palette: Palette): [string, string][] {
  return TOKENS.map((token) => [`--${token}`, `light-dark(${palette.light[token]}, ${palette.dark[token]})`]);
}

export const TOKEN_PROPERTIES: readonly string[] = TOKENS.map((token) => `--${token}`);

export function accentSwatch(accent: Accent): string[] {
  const palette = accentPalette(accent);
  const light = palette ? SWATCH_TOKENS.map((token) => palette.light[token]) : DEFAULT_SWATCH.light;
  const dark = palette ? SWATCH_TOKENS.map((token) => palette.dark[token]) : DEFAULT_SWATCH.dark;
  return light.map((color, i) => `light-dark(${color}, ${dark[i]})`);
}
