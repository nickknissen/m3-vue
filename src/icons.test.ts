import { describe, expect, it, vi } from 'vitest';
import { icon, iconMarkup, PACKAGE_ICONS, registerIcons, type IconName } from './icons';

const svg = (d: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="${d}"/></svg>`;

describe('icons', () => {
  it("holds bare path markup for the package's own icons", () => {
    for (const [name, styles] of Object.entries(PACKAGE_ICONS)) {
      for (const markup of styles) expect(markup, name).toMatch(/^<path d="[^"]+"\/>$/);
    }
  });

  it('draws an icon the app registered, outlined or filled', () => {
    registerIcons({ test_icon: icon(svg('M1'), svg('M2')) });
    expect(iconMarkup('test_icon' as IconName)).toBe('<path d="M1"/>');
    expect(iconMarkup('test_icon' as IconName, true)).toBe('<path d="M2"/>');
  });

  it('uses the outlined style when there is no filled one', () => {
    expect(icon(svg('M3'))).toEqual(['<path d="M3"/>', '<path d="M3"/>']);
  });

  it('draws nothing for a name that was never registered', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(iconMarkup('no_such_icon' as IconName)).toBe('');
    warn.mockRestore();
  });
});
