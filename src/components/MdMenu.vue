<script setup lang="ts">
import { useId, useTemplateRef } from 'vue';
import type { IconName } from '../icons';
import { usePopoverMenu } from '../ui/popoverMenu';
import MdIcon from './MdIcon.vue';

defineProps<{ label: string; items: readonly { id: string; label: string; icon: IconName }[] }>();
const emit = defineEmits<{ select: [id: string] }>();

const menuId = `${useId()}-menu`;
const trigger = useTemplateRef<HTMLButtonElement>('trigger');
const menu = useTemplateRef<HTMLDivElement>('menu');

const { open, close, onToggle, onItemKeydown, onTriggerKeydown } = usePopoverMenu(trigger, menu, '[role="menuitem"]', () => 0);

function choose(id: string) {
  close();
  trigger.value?.focus();
  emit('select', id);
}
</script>

<template>
  <button
    ref="trigger"
    type="button"
    class="nav-button"
    aria-haspopup="menu"
    :aria-label="label"
    :title="label"
    :aria-expanded="open"
    :aria-controls="menuId"
    :popovertarget="menuId"
    @keydown="onTriggerKeydown"
  >
    <MdIcon name="more_vert" />
  </button>
  <div :id="menuId" ref="menu" popover class="menu" role="menu" :aria-label="label" @toggle="onToggle">
    <button
      v-for="(item, index) in items"
      :key="item.id"
      type="button"
      role="menuitem"
      class="menu-item"
      tabindex="-1"
      @click="choose(item.id)"
      @keydown="onItemKeydown($event, index)"
    >
      <MdIcon :name="item.icon" class="menu-icon" />
      {{ item.label }}
    </button>
  </div>
</template>
