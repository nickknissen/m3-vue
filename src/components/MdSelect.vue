<script setup lang="ts" generic="T extends string | number">
import { computed, useId, useTemplateRef } from 'vue';
import { usePopoverMenu } from '../ui/popoverMenu';
import MdIcon from './MdIcon.vue';

const model = defineModel<T>({ required: true });
const props = defineProps<{ options: readonly { value: T; label: string }[]; labelledby: string }>();

const id = useId();
const menuId = `${id}-menu`;
const valueId = `${id}-value`;
const trigger = useTemplateRef<HTMLButtonElement>('trigger');
const menu = useTemplateRef<HTMLDivElement>('menu');

const selectedIndex = computed(() => props.options.findIndex((o) => o.value === model.value));
const selectedLabel = computed(() => props.options[selectedIndex.value]?.label ?? '');

const { open, close, onToggle, onItemKeydown, onTriggerKeydown } = usePopoverMenu(trigger, menu, '[role="option"]', () => selectedIndex.value);

function choose(value: T) {
  model.value = value;
  close();
  trigger.value?.focus();
}
</script>

<template>
  <button
    :id="id"
    ref="trigger"
    type="button"
    class="select-trigger"
    aria-haspopup="listbox"
    :aria-expanded="open"
    :aria-controls="menuId"
    :aria-labelledby="`${labelledby} ${valueId}`"
    :popovertarget="menuId"
    @keydown="onTriggerKeydown"
  >
    <span :id="valueId">{{ selectedLabel }}</span>
    <MdIcon name="arrow_drop_down" class="select-arrow" />
  </button>
  <div :id="menuId" ref="menu" popover class="menu" role="listbox" :aria-labelledby="labelledby" @toggle="onToggle">
    <button
      v-for="(option, index) in options"
      :key="option.value"
      type="button"
      role="option"
      class="menu-item"
      :aria-selected="index === selectedIndex"
      tabindex="-1"
      @click="choose(option.value)"
      @keydown="onItemKeydown($event, index)"
    >
      <MdIcon name="check" class="menu-check" />
      {{ option.label }}
    </button>
  </div>
</template>
