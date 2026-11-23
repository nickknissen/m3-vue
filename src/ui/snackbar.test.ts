import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { snackbar, useSnackbarHost } from './snackbar';

describe('snackbar', () => {
  const host = useSnackbarHost();

  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    host.act();
    vi.useRealTimers();
  });

  it('shows the text and times out after 5 s', async () => {
    const ended = snackbar('Saved');
    expect(host.current.value?.text).toBe('Saved');
    vi.advanceTimersByTime(4999);
    expect(host.current.value).not.toBeNull();
    vi.advanceTimersByTime(1);
    expect(await ended).toBe('timeout');
    expect(host.current.value).toBeNull();
  });

  it('stays 8 s with an action, and ends with it when tapped', async () => {
    const ended = snackbar('Step deleted', { action: 'Undo' });
    vi.advanceTimersByTime(7000);
    host.act();
    expect(await ended).toBe('action');
  });

  it('is replaced by the next one', async () => {
    const first = snackbar('One');
    snackbar('Two');
    expect(await first).toBe('replaced');
    expect(host.current.value?.text).toBe('Two');
  });

  it("doesn't time out while paused, and starts over on resume", async () => {
    const ended = snackbar('Saved');
    host.pause();
    vi.advanceTimersByTime(60_000);
    expect(host.current.value).not.toBeNull();
    host.resume();
    vi.advanceTimersByTime(5000);
    expect(await ended).toBe('timeout');
  });

  it('stays until its action is tapped with an Infinity duration, also after a pause', async () => {
    const ended = snackbar('Update available', { action: 'Reload', duration: Infinity });
    vi.advanceTimersByTime(24 * 60 * 60 * 1000);
    host.pause();
    host.resume();
    vi.advanceTimersByTime(60_000);
    expect(host.current.value?.text).toBe('Update available');
    host.act();
    expect(await ended).toBe('action');
  });

  it('lets a snackbar that stays be replaced', async () => {
    const stays = snackbar('Update available', { action: 'Reload', duration: Infinity });
    snackbar('Saved');
    expect(await stays).toBe('replaced');
  });
});
