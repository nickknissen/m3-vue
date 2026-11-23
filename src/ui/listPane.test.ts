import { describe, expect, it } from 'vitest';
import { LIST_WIDTH, listPaneKey, loadListPane, saveListPane } from './listPane';

const KEY = 'app.listPane';

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

describe('list pane', () => {
  it('defaults to the initial width, expanded', () => {
    expect(loadListPane(memoryStorage(), KEY)).toEqual({ width: LIST_WIDTH.initial, collapsed: false });
    expect(loadListPane(memoryStorage({ [KEY]: 'junk' }), KEY)).toEqual({ width: LIST_WIDTH.initial, collapsed: false });
    expect(loadListPane(null, KEY)).toEqual({ width: LIST_WIDTH.initial, collapsed: false });
  });

  it('round-trips width and collapse, clamping stored widths', () => {
    const storage = memoryStorage();
    saveListPane(storage, KEY, { width: 400, collapsed: true });
    expect(loadListPane(storage, KEY)).toEqual({ width: 400, collapsed: true });
    expect(loadListPane(memoryStorage({ [KEY]: '9999' }), KEY).width).toBe(LIST_WIDTH.max);
  });

  it('forgets the key when back to the default layout', () => {
    const storage = memoryStorage({ [KEY]: '400' });
    saveListPane(storage, KEY, { width: LIST_WIDTH.initial, collapsed: false });
    expect(storage.data.has(KEY)).toBe(false);
  });

  it('resizes with arrows, jumps with Home and End and collapses with Enter', () => {
    const pane = { width: 340, collapsed: false };
    expect(listPaneKey(pane, 'ArrowRight')).toEqual({ width: 356, collapsed: false });
    expect(listPaneKey(pane, 'ArrowLeft')).toEqual({ width: 324, collapsed: false });
    expect(listPaneKey({ width: 470, collapsed: false }, 'ArrowRight')!.width).toBe(LIST_WIDTH.max);
    expect(listPaneKey(pane, 'Home')!.width).toBe(LIST_WIDTH.min);
    expect(listPaneKey(pane, 'End')!.width).toBe(LIST_WIDTH.max);
    expect(listPaneKey(pane, 'Enter')).toEqual({ width: 340, collapsed: true });
    expect(listPaneKey(pane, 'a')).toBeNull();
  });

  it("keeps to the app's own limits", () => {
    const limits = { min: 280, max: 600, initial: 420 };
    expect(loadListPane(memoryStorage(), KEY, limits)).toEqual({ width: 420, collapsed: false });
    expect(loadListPane(memoryStorage({ [KEY]: '100' }), KEY, limits).width).toBe(280);
    expect(listPaneKey({ width: 420, collapsed: false }, 'End', limits)!.width).toBe(600);
    const storage = memoryStorage({ [KEY]: '500' });
    saveListPane(storage, KEY, { width: 420, collapsed: false }, limits);
    expect(storage.data.has(KEY)).toBe(false);
  });

  it('starts from the initial width when storage is blocked', () => {
    const blocked = { getItem: () => { throw new Error('blocked'); } };
    expect(loadListPane(blocked, KEY)).toEqual({ width: LIST_WIDTH.initial, collapsed: false });
  });
});
