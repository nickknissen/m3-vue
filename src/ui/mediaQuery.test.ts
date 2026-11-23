import { describe, expect, it } from 'vitest';
import { watchMedia } from './mediaQuery';

function fakeHost(initial: boolean) {
  const listeners = new Set<(event: { matches: boolean }) => void>();
  const list = {
    matches: initial,
    addEventListener: (_: string, l: (event: { matches: boolean }) => void) => listeners.add(l),
    removeEventListener: (_: string, l: (event: { matches: boolean }) => void) => listeners.delete(l),
  };
  return {
    host: { matchMedia: () => list as unknown as MediaQueryList },
    fire: (matches: boolean) => listeners.forEach((l) => l({ matches })),
    listeners,
  };
}

describe('watchMedia', () => {
  it('reports the current match and later changes', () => {
    const { host, fire } = fakeHost(true);
    const seen: boolean[] = [];
    watchMedia(host, '(min-width: 1200px)', (m) => seen.push(m));
    fire(false);
    expect(seen).toEqual([true, false]);
  });

  it('stops listening when stopped', () => {
    const { host, listeners } = fakeHost(false);
    const stop = watchMedia(host, 'q', () => {});
    stop();
    expect(listeners.size).toBe(0);
  });

  it('reports no match without matchMedia', () => {
    const seen: boolean[] = [];
    watchMedia({}, 'q', (m) => seen.push(m));
    expect(seen).toEqual([false]);
  });
});
