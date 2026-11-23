import { shallowRef } from 'vue';

export interface ConfirmOptions {
  title: string;
  body: string;
  confirm: string;
}

export interface PendingConfirm extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

export function createConfirm() {
  const pending = shallowRef<PendingConfirm | null>(null);

  function settle(confirmed: boolean) {
    const current = pending.value;
    pending.value = null;
    current?.resolve(confirmed);
  }

  function confirm(options: ConfirmOptions): Promise<boolean> {
    settle(false);
    return new Promise((resolve) => (pending.value = { ...options, resolve }));
  }

  return { pending, confirm, settle };
}
