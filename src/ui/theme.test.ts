import { describe, expect, it } from 'vitest';
import { accentPalette } from './palette';
import { applyTheme, loadAccent, loadTheme, saveAccent, saveTheme } from './theme';

const THEME_KEY = 'app.theme';
const ACCENT_KEY = 'app.accent';

function memoryStorage(entries: Record<string, string> = {}) {
  const data = new Map(Object.entries(entries));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
}

function fakeDocument() {
  const properties = new Map<string, string>();
  const metas = [
    { media: '(prefers-color-scheme: dark)', content: '' },
    { media: '(prefers-color-scheme: light)', content: '' },
  ];
  const style = {
    setProperty: (name: string, value: string) => void properties.set(name, value),
    removeProperty: (name: string) => void properties.delete(name),
  };
  const dataset: Record<string, string> = {};
  const doc = { documentElement: { style, dataset }, querySelectorAll: () => metas } as unknown as Document;
  return { doc, properties, metas, dataset };
}

describe('theme', () => {
  it('defaults to system when nothing or something unknown is stored', () => {
    expect(loadTheme(memoryStorage(), THEME_KEY)).toBe('system');
    expect(loadTheme(memoryStorage({ [THEME_KEY]: 'sepia' }), THEME_KEY)).toBe('system');
    expect(loadTheme(null, THEME_KEY)).toBe('system');
  });

  it('round-trips light and dark under the given key', () => {
    const storage = memoryStorage();
    saveTheme(storage, THEME_KEY, 'dark');
    expect(storage.data.get(THEME_KEY)).toBe('dark');
    expect(loadTheme(storage, THEME_KEY)).toBe('dark');
    saveTheme(storage, THEME_KEY, 'light');
    expect(loadTheme(storage, THEME_KEY)).toBe('light');
  });

  it('removes the stored value when going back to system', () => {
    const storage = memoryStorage({ [THEME_KEY]: 'dark' });
    saveTheme(storage, THEME_KEY, 'system');
    expect(storage.data.has(THEME_KEY)).toBe(false);
  });

  it('keeps going when storage refuses the write', () => {
    const storage = {
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: () => {},
    };
    expect(() => saveTheme(storage, THEME_KEY, 'dark')).not.toThrow();
  });
});

describe('accent', () => {
  it('defaults when nothing or something unknown is stored', () => {
    expect(loadAccent(memoryStorage(), ACCENT_KEY)).toBe('default');
    expect(loadAccent(memoryStorage({ [ACCENT_KEY]: 'chartreuse' }), ACCENT_KEY)).toBe('default');
    expect(loadAccent(null, ACCENT_KEY)).toBe('default');
  });

  it('round-trips a colour and removes the stored value for default', () => {
    const storage = memoryStorage();
    saveAccent(storage, ACCENT_KEY, 'teal');
    expect(loadAccent(storage, ACCENT_KEY)).toBe('teal');
    saveAccent(storage, ACCENT_KEY, 'default');
    expect(storage.data.has(ACCENT_KEY)).toBe(false);
  });
});

describe('applyTheme', () => {
  it('overrides the colour tokens and theme-color for a generated accent', () => {
    const { doc, properties, metas } = fakeDocument();
    applyTheme(doc, 'system', 'teal');
    const palette = accentPalette('teal')!;
    expect(properties.get('--primary')).toBe(`light-dark(${palette.light.primary}, ${palette.dark.primary})`);
    expect(metas.map((m) => m.content)).toEqual([palette.dark.surface, palette.light.surface]);
  });

  it('drops the overrides when going back to default', () => {
    const { doc, properties, metas, dataset } = fakeDocument();
    applyTheme(doc, 'dark', 'red');
    applyTheme(doc, 'dark');
    expect(properties.size).toBe(0);
    expect(dataset.theme).toBe('dark');
    expect(metas.map((m) => m.content)).toEqual(['#111318', '#111318']);
  });

  it('picks the scheme with a data attribute, and none for system', () => {
    const { doc, dataset, metas } = fakeDocument();
    applyTheme(doc, 'light');
    expect(dataset.theme).toBe('light');
    applyTheme(doc, 'system');
    expect('theme' in dataset).toBe(false);
    expect(metas.map((m) => m.content)).toEqual(['#111318', '#f9f9ff']);
  });
});
