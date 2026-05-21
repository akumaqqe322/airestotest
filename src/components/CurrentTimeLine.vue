<script setup lang="ts">
import { computed } from 'vue';
import { timeToMinutes } from '../utils/time';

const props = defineProps<{
  currentTime: string; // "HH:MM"
  openingTime: string; // "11:00"
  closingTime: string; // "23:40"
  pixelsPerMinute: number;
}>();

const currentMins = computed(() => timeToMinutes(props.currentTime));
const openingMins = computed(() => timeToMinutes(props.openingTime));
const closingMins = computed(() => timeToMinutes(props.closingTime));

// Is the current time within restaurant operating bounds?
const isVisible = computed(() => {
  return currentMins.value >= openingMins.value && currentMins.value <= closingMins.value;
});

// Calculate the vertical offset
const topOffset = computed(() => {
  const result = (currentMins.value - openingMins.value) * props.pixelsPerMinute;
  return result >= 0 ? result : 0;
});
</script>

<template>
  <div
    v-if="isVisible"
    :style="{ top: `${topOffset}px` }"
    class="absolute left-0 right-0 h-[1.5px] bg-rose-500 z-20 pointer-events-none"
  >
    <!-- Left marker node -->
    <div class="absolute left-0 -translate-y-1/2 -translate-x-[4px] w-2.5 h-2.5 bg-rose-500 rounded-full border border-black shadow"></div>
    <div class="absolute left-0 -translate-y-1/2 -translate-x-[4px] w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping opacity-75"></div>
    
    <!-- Pulse Line decoration -->
    <div class="w-full h-full bg-rose-500/20 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
  </div>
</template>
