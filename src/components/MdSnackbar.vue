<script setup lang="ts">
import { useSnackbarHost } from '../ui/snackbar';

/**
 * Where `snackbar()` shows: mount it once in the app shell. The live region is always in the
 * page, so screen readers announce each one.
 */
const { current, act, pause, resume } = useSnackbarHost();
</script>

<template>
  <div role="status">
    <Transition name="snackbar">
      <div v-if="current" :key="current.id" class="snackbar" @pointerenter="pause" @pointerleave="resume" @focusin="pause" @focusout="resume">
        <span class="snackbar-text">{{ current.text }}</span>
        <button v-if="current.action" type="button" class="snackbar-action" @click="act">{{ current.action }}</button>
      </div>
    </Transition>
  </div>
</template>
