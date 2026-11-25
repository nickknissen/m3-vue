import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadingIndicatorCss, polygon, SHAPES, spring } from './loadingIndicator';

describe('loading indicator', () => {
  it('style.css holds what the script generates', () => {
    const css = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
    expect(css).toContain(loadingIndicatorCss());
  });

  it('gives every shape the same number of points, so CSS can morph between them', () => {
    const counts = Object.values(SHAPES).map((s) => polygon(s).split(',').length);
    expect(new Set(counts).size).toBe(1);
  });

  it('keeps every shape inside its box, so turning it never clips', () => {
    for (const s of Object.values(SHAPES)) {
      for (let a = 0; a < 2 * Math.PI; a += 0.01) {
        expect(s(a)).toBeGreaterThan(0.4);
        expect(s(a)).toBeLessThanOrEqual(1.0001);
      }
    }
  });

  it('springs past the turn and settles, but never morphs past the next shape', () => {
    const values = (easing: string) => easing.slice('linear('.length, -1).split(', ').map(Number);
    const turn = values(spring(0.6, 200));
    const morph = values(spring(0.6, 200, { clamp: true }));
    expect(Math.max(...turn)).toBeGreaterThan(1.05);
    expect(Math.max(...morph)).toBe(1);
    expect(turn.at(-1)).toBe(1);
  });
});
