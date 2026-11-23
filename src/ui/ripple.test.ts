import { describe, expect, it } from 'vitest';
import { rippleRadius } from './ripple';

describe('rippleRadius', () => {
  it('reaches the farthest corner from the press point', () => {
    expect(rippleRadius(100, 40, 0, 0)).toBe(Math.ceil(Math.hypot(100, 40)));
    expect(rippleRadius(100, 40, 90, 30)).toBe(Math.ceil(Math.hypot(90, 30)));
  });

  it('covers half the diagonal when pressed in the centre', () => {
    expect(rippleRadius(80, 60, 40, 30)).toBe(50);
  });
});
