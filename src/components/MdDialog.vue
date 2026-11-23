<script setup lang="ts">
import { nextTick, ref, useTemplateRef, watch } from 'vue';
import type { ConfirmOptions, PendingConfirm } from '../ui/confirm';

const props = withDefaults(defineProps<{ pending: PendingConfirm | null; cancelLabel?: string }>(), { cancelLabel: 'Cancel' });
const emit = defineEmits<{ settle: [confirmed: boolean] }>();

const dialog = useTemplateRef<HTMLDialogElement>('dialog');
const shown = ref<ConfirmOptions | null>(null);

watch(
  () => props.pending,
  async (pending) => {
    if (pending) {
      shown.value = pending;
      await nextTick();
      if (!dialog.value?.open) dialog.value?.showModal();
    } else {
      dialog.value?.close();
    }
  },
);

function onBackdrop(event: MouseEvent) {
  if (event.target === dialog.value) emit('settle', false);
}
</script>

<template>
  <dialog ref="dialog" class="dialog" aria-labelledby="dialog-title" aria-describedby="dialog-body" @cancel.prevent="emit('settle', false)" @click="onBackdrop">
    <div v-if="shown" class="dialog-content">
      <h2 id="dialog-title" class="dialog-title">{{ shown.title }}</h2>
      <p id="dialog-body" class="dialog-body">{{ shown.body }}</p>
      <div class="dialog-actions">
        <button type="button" autofocus @click="emit('settle', false)">{{ cancelLabel }}</button>
        <button type="button" @click="emit('settle', true)">{{ shown.confirm }}</button>
      </div>
    </div>
  </dialog>
</template>
