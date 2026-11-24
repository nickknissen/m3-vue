import { argbFromHex, Hct } from '@material/material-color-utilities';
import { describe, expect, it } from 'vitest';
import { ACCENTS, accentPalette, accentSwatch, paletteProperties, TOKEN_PROPERTIES } from './palette';

const hue = (hex: string) => Hct.fromInt(argbFromHex(hex)).hue;
const tone = (hex: string) => Hct.fromInt(argbFromHex(hex)).tone;

describe('accentPalette', () => {
  it('leaves the default accent to the stylesheet', () => {
    expect(accentPalette('default')).toBeNull();
  });

  it('generates every token for light and dark from the seed', () => {
    const palette = accentPalette('teal')!;
    for (const scheme of [palette.light, palette.dark]) {
      expect(Object.keys(scheme)).toHaveLength(TOKEN_PROPERTIES.length);
      for (const color of Object.values(scheme)) expect(color).toMatch(/^#[0-9a-f]{6}$/);
    }
    expect(Math.abs(hue(palette.light.primary) - hue('#00897b'))).toBeLessThan(15);
  });

  it('keeps M3 tone roles: dark primary is light, light surface is near white', () => {
    const palette = accentPalette('red')!;
    expect(tone(palette.light.primary)).toBeCloseTo(40, 0);
    expect(tone(palette.dark.primary)).toBeCloseTo(80, 0);
    expect(tone(palette.light.surface)).toBeGreaterThan(95);
    expect(tone(palette.dark.surface)).toBeLessThan(10);
  });

  it('gives each accent a distinct primary', () => {
    const primaries = ACCENTS.filter((a) => a !== 'default').map((a) => accentPalette(a)!.light.primary);
    expect(new Set(primaries).size).toBe(primaries.length);
  });
});

describe('paletteProperties', () => {
  it('pairs light and dark per custom property', () => {
    const palette = accentPalette('green')!;
    const properties = Object.fromEntries(paletteProperties(palette));
    expect(Object.keys(properties)).toEqual(TOKEN_PROPERTIES);
    expect(properties['--on-primary']).toBe(`light-dark(${palette.light['on-primary']}, ${palette.dark['on-primary']})`);
  });
});

describe('accentSwatch', () => {
  it('returns three light-dark colors for every accent', () => {
    for (const accent of ACCENTS) {
      const swatch = accentSwatch(accent);
      expect(swatch).toHaveLength(3);
      for (const color of swatch) expect(color).toMatch(/^light-dark\(#[0-9a-f]{6}, #[0-9a-f]{6}\)$/);
    }
  });
});
