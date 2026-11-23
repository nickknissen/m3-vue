<script setup lang="ts">
import { computed, nextTick, ref, useId, useTemplateRef, watch } from 'vue';
import { clampListWidth, LIST_WIDTH, listPaneKey, loadListPane, saveListPane, type ListPane, type ListWidth } from '../ui/listPane';
import MdIcon from './MdIcon.vue';

/**
 * A list beside the open item (list-detail), with a divider between them: drag it (or use the
 * arrow keys, Home and End) to make the list wider or narrower, double-click it for the initial
 * width, and use its button to hide or show the list. The width and whether the list is hidden
 * are kept in localStorage under `storageKey`. An app that keeps them itself (to reset them, say)
 * binds `v-model:pane` instead.
 *
 * Without `split` (smaller windows), only the item shows.
 */
const props = withDefaults(
  defineProps<{
    split: boolean;
    storageKey?: string;
    /** The list's accessible name. */
    listLabel: string;
    width?: ListWidth;
    resizeLabel?: string;
    collapseLabel?: string;
    expandLabel?: string;
  }>(),
  { width: () => LIST_WIDTH, resizeLabel: 'Resize the list', collapseLabel: 'Hide the list', expandLabel: 'Show the list' },
);

const listId = useId();
const storage = (() => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
})();
const model = defineModel<ListPane>('pane');
const local = ref<ListPane>(props.storageKey ? loadListPane(storage, props.storageKey, props.width) : { width: props.width.initial, collapsed: false });
watch(local, (p) => {
  if (props.storageKey) saveListPane(storage, props.storageKey, p, props.width);
});
const pane = computed<ListPane>({
  get: () => model.value ?? local.value,
  set: (p) => {
    local.value = p;
    model.value = p;
  },
});

const toggle = useTemplateRef<HTMLButtonElement>('toggle');
let resizeStart: { x: number; width: number } | null = null;

function onKeydown(event: KeyboardEvent) {
  const next = listPaneKey(pane.value, event.key, props.width);
  if (!next) return;
  event.preventDefault();
  pane.value = next;
  // The handle goes with the list, so focus moves to the button that brings it back.
  if (next.collapsed) void nextTick(() => toggle.value?.focus());
}

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0) return;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  resizeStart = { x: event.clientX, width: pane.value.width };
}

function onPointerMove(event: PointerEvent) {
  if (!resizeStart) return;
  pane.value = { width: clampListWidth(resizeStart.width + event.clientX - resizeStart.x, props.width), collapsed: false };
}

function onPointerUp() {
  resizeStart = null;
}
</script>

<template>
  <div
    class="list-detail"
    :class="{ split, 'list-collapsed': split && pane.collapsed }"
    :style="split ? { '--list-width': `${pane.width}px` } : undefined"
  >
    <template v-if="split">
      <aside v-show="!pane.collapsed" :id="listId" class="list-detail-list" :aria-label="listLabel">
        <slot name="list" />
      </aside>
      <div class="pane-divider">
        <button
          ref="toggle"
          type="button"
          class="nav-button pane-toggle"
          :aria-label="pane.collapsed ? expandLabel : collapseLabel"
          :title="pane.collapsed ? expandLabel : collapseLabel"
          :aria-controls="listId"
          :aria-expanded="!pane.collapsed"
          @click="pane = { ...pane, collapsed: !pane.collapsed }"
        >
          <MdIcon :name="pane.collapsed ? 'left_panel_open' : 'left_panel_close'" />
        </button>
        <div
          v-if="!pane.collapsed"
          class="pane-handle"
          role="separator"
          tabindex="0"
          aria-orientation="vertical"
          :aria-controls="listId"
          :aria-label="resizeLabel"
          :title="resizeLabel"
          :aria-valuemin="width.min"
          :aria-valuemax="width.max"
          :aria-valuenow="pane.width"
          @keydown="onKeydown"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @dblclick="pane = { width: width.initial, collapsed: false }"
        ></div>
      </div>
    </template>
    <div class="list-detail-item">
      <slot />
    </div>
  </div>
</template>
