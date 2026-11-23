/**
 * The list in a list-detail layout (MdListDetail): its width, set by dragging the divider or
 * with the keyboard, and whether it's hidden. Kept per app in storage, under a key it chooses.
 */

/** How wide the list can be, in CSS pixels, and how wide it starts. */
export interface ListWidth {
  min: number;
  max: number;
  initial: number;
}

export const LIST_WIDTH: ListWidth = { min: 240, max: 480, initial: 340 };

export interface ListPane {
  width: number;
  collapsed: boolean;
}

/** One arrow key press moves the divider this far. */
const STEP = 16;

export function clampListWidth(width: number, limits: ListWidth = LIST_WIDTH): number {
  return Math.round(Math.min(limits.max, Math.max(limits.min, width)));
}

/** The list as stored (`340`, or `340c` when hidden), or the initial width when there's nothing usable. */
export function loadListPane(storage: Pick<Storage, 'getItem'> | null, key: string, limits: ListWidth = LIST_WIDTH): ListPane {
  let stored: string | null = null;
  try {
    stored = storage?.getItem(key) ?? null;
  } catch {
    // Storage blocked: start from the initial width.
  }
  const match = /^(\d+)(c?)$/.exec(stored ?? '');
  return match ? { width: clampListWidth(Number(match[1]), limits), collapsed: match[2] === 'c' } : { width: limits.initial, collapsed: false };
}

/** Stores the list, or forgets it when it's back to the initial layout. */
export function saveListPane(storage: Pick<Storage, 'setItem' | 'removeItem'> | null, key: string, pane: ListPane, limits: ListWidth = LIST_WIDTH): void {
  try {
    if (pane.width === limits.initial && !pane.collapsed) storage?.removeItem(key);
    else storage?.setItem(key, `${pane.width}${pane.collapsed ? 'c' : ''}`);
  } catch {
    // Storage full or blocked: the layout still applies for this session.
  }
}

/** The divider's keys: arrows resize, Home and End go to the narrowest and widest, Enter hides or shows the list. */
export function listPaneKey(pane: ListPane, key: string, limits: ListWidth = LIST_WIDTH): ListPane | null {
  switch (key) {
    case 'ArrowLeft':
      return { width: clampListWidth(pane.width - STEP, limits), collapsed: false };
    case 'ArrowRight':
      return { width: clampListWidth(pane.width + STEP, limits), collapsed: false };
    case 'Home':
      return { width: limits.min, collapsed: false };
    case 'End':
      return { width: limits.max, collapsed: false };
    case 'Enter':
      return { ...pane, collapsed: !pane.collapsed };
    default:
      return null;
  }
}
