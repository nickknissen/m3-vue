<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { iconMarkup, type IconName } from '../icons';

// Declared at runtime: the SFC compiler can't follow IconName, which each app extends.
const props = defineProps({
  name: { type: String as PropType<IconName>, required: true },
  filled: Boolean,
});

const markup = computed(() => iconMarkup(props.name, props.filled));
</script>

<template>
  <svg class="symbol" viewBox="0 -960 960 960" aria-hidden="true" v-html="markup"></svg>
</template>
