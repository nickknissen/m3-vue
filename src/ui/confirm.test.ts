import { describe, expect, it } from 'vitest';
import { createConfirm } from './confirm';

const options = { title: 'Delete workout?', body: 'Gone for good.', confirm: 'Delete' };

describe('createConfirm', () => {
  it('exposes the request until it is settled', async () => {
    const { pending, confirm, settle } = createConfirm();
    const answer = confirm(options);
    expect(pending.value?.title).toBe('Delete workout?');
    settle(true);
    expect(pending.value).toBeNull();
    await expect(answer).resolves.toBe(true);
  });

  it('resolves false when cancelled', async () => {
    const { confirm, settle } = createConfirm();
    const answer = confirm(options);
    settle(false);
    await expect(answer).resolves.toBe(false);
  });

  it('cancels an open request when a new one starts', async () => {
    const { pending, confirm } = createConfirm();
    const first = confirm(options);
    void confirm({ ...options, title: 'Clear all data?' });
    await expect(first).resolves.toBe(false);
    expect(pending.value?.title).toBe('Clear all data?');
  });

  it('ignores settling when nothing is open', () => {
    const { pending, settle } = createConfirm();
    settle(true);
    expect(pending.value).toBeNull();
  });
});
