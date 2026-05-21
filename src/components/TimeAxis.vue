<script setup lang="ts">
import { computed } from 'vue';
import { generateTimeTicks, minutesToTime, timeToMinutes } from '../utils/time';

const props = defineProps<{
  openingTime: string; // "11:00"
  closingTime: string; // "23:40"
  pixelsPerMinute: number; // e.g. 1.5 or 2
  intervalMinutes?: number; // defaults to 30
}>();

// Generate minutes representation for our ticks
const timeTicks = computed(() => {
  const interval = props.intervalMinutes ?? 30;
  // Generate starting from opening time to closing time, rounding up to next hours if needed
  return generateTimeTicks(props.openingTime, props.closingTime, interval);
});

// Converts a tick in minutes to a readable clock "HH:MM"
function formatTick(tickMinutes: number): string {
  return minutesToTime(tickMinutes);
}

// Compute dynamic height for a single 30-minute block
const blockHeight = computed(() => {
  const interval = props.intervalMinutes ?? 30;
  return `${interval * props.pixelsPerMinute}px`;
});
</script>

<template>
  <div class="relative bg-[#111315] select-none border-r border-[#2d3139]" style="width: 70px;">
    <!-- Time Ticks Column -->
    <div class="flex flex-col">
      <div
        v-for="tick in timeTicks"
        :key="tick"
        class="relative flex items-center justify-end pr-3 text-[11px] font-mono font-medium text-gray-500"
        :style="{ height: blockHeight }"
      >
        <!-- Horizontal line helper inside time axis -->
        <div class="absolute -right-[1px] w-1.5 h-[1px] bg-[#2d3139]"></div>
        <span>{{ formatTick(tick) }}</span>
      </div>
    </div>
  </div>
</template>
