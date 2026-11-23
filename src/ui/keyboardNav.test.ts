import { describe, expect, it } from 'vitest';
import { nextRadioIndex, verticalTarget } from './keyboardNav';

describe('nextRadioIndex', () => {
  it('moves forward with Right and Down, wrapping at the end', () => {
    expect(nextRadioIndex(0, 'ArrowRight', 3)).toBe(1);
    expect(nextRadioIndex(2, 'ArrowDown', 3)).toBe(0);
  });

  it('moves back with Left and Up, wrapping at the start', () => {
    expect(nextRadioIndex(1, 'ArrowLeft', 3)).toBe(0);
    expect(nextRadioIndex(0, 'ArrowUp', 3)).toBe(2);
  });

  it('jumps to the ends with Home and End', () => {
    expect(nextRadioIndex(1, 'Home', 3)).toBe(0);
    expect(nextRadioIndex(1, 'End', 3)).toBe(2);
  });

  it('ignores other keys and empty groups', () => {
    expect(nextRadioIndex(0, 'Enter', 3)).toBeNull();
    expect(nextRadioIndex(0, 'ArrowRight', 0)).toBeNull();
  });
});

describe('verticalTarget', () => {
  it('moves one row down or up', () => {
    expect(verticalTarget(0, 'ArrowDown', 4)).toBe(1);
    expect(verticalTarget(3, 'ArrowUp', 4)).toBe(2);
  });

  it('stops at the first and last row instead of wrapping', () => {
    expect(verticalTarget(0, 'ArrowUp', 4)).toBeNull();
    expect(verticalTarget(3, 'ArrowDown', 4)).toBeNull();
  });

  it('ignores horizontal keys so the caret still moves', () => {
    expect(verticalTarget(1, 'ArrowLeft', 4)).toBeNull();
    expect(verticalTarget(1, 'ArrowRight', 4)).toBeNull();
  });
});
