<script setup lang="ts">
import { computed } from 'vue';
import { generateTimeTicks, minutesToTime } from '../utils/time';

const props = withDefaults(defineProps<{
  openingTime: string;
  closingTime: string;
  pixelsPerMinute: number;
  intervalMinutes?: number;
  theme?: 'dark' | 'light';
}>(), {
  intervalMinutes: 30,
  theme: 'dark'
});

// Generate minutes representation for our ticks
const timeTicks = computed(() => {
  return generateTimeTicks(props.openingTime, props.closingTime, props.intervalMinutes);
});

// Converts a tick in minutes to a readable clock "HH:MM"
function formatTick(tickMinutes: number): string {
  return minutesToTime(tickMinutes);
}

// Compute dynamic height for a single 35-minute block
const blockHeight = computed(() => {
  return `${props.intervalMinutes * props.pixelsPerMinute}px`;
});
</script>

<template>
  <div 
    :class="[
      theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-[#111315] border-[#2d3139] text-[#718096]',
      'relative select-none border-r transition-colors'
    ]"
    style="width: 70px;"
  >
    <!-- Time Ticks Column -->
    <div class="flex flex-col">
      <div
        v-for="tick in timeTicks"
        :key="tick"
        :style="{ height: blockHeight }"
        class="relative flex items-center justify-end pr-3.5 text-[10px] font-mono font-bold"
      >
        <!-- Horizontal line helper inside time axis -->
        <div 
          :class="[theme === 'light' ? 'bg-slate-200' : 'bg-[#2d3139]', 'absolute -right-[1px] w-1.5 h-[1px]']"
        ></div>
        <span>{{ formatTick(tick) }}</span>
      </div>
    </div>
  </div>
</template>
