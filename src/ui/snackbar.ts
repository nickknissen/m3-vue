import { shallowRef } from 'vue';

/** How a snackbar ended: its action was tapped, it timed out, or another took its place. */
export type SnackbarEnd = 'action' | 'timeout' | 'replaced';

export interface ShownSnackbar {
  id: number;
  text: string;
  action?: string;
}

export interface SnackbarOptions {
  /** The button's label, such as Undo. */
  action?: string;
  /** How long it stays, in ms. `Infinity` keeps it until its action is tapped or another replaces it. */
  duration?: number;
}

const current = shallowRef<ShownSnackbar | null>(null);
let ending: ((how: SnackbarEnd) => void) | null = null;
let arm: () => void = () => {};
let timer: ReturnType<typeof setTimeout> | undefined;
let ids = 0;

/**
 * Show a snackbar (for short messages, errors and Undo), replacing any that's showing. It stays
 * 5 s, or 8 s with an action, and doesn't time out while the pointer or focus is on it, so its
 * action can still be reached. Resolves with how it ended. Shown by `MdSnackbar`.
 */
export function snackbar(text: string, options: SnackbarOptions = {}): Promise<SnackbarEnd> {
  ending?.('replaced');
  const duration = options.duration ?? (options.action ? 8000 : 5000);
  const me = { id: ++ids, text, action: options.action };
  current.value = me;
  return new Promise((resolve) => {
    ending = (how) => {
      if (current.value !== me) return;
      clearTimeout(timer);
      current.value = null;
      ending = null;
      resolve(how);
    };
    arm = () => {
      clearTimeout(timer);
      // setTimeout would fire at once for Infinity, so a snackbar that stays gets no timer.
      if (Number.isFinite(duration)) timer = setTimeout(() => ending?.('timeout'), duration);
    };
    arm();
  });
}

/** For `MdSnackbar`: what's showing, and what its button and hover do. */
export function useSnackbarHost() {
  return {
    current,
    act: () => ending?.('action'),
    pause: () => clearTimeout(timer),
    resume: () => current.value && arm(),
  };
}
