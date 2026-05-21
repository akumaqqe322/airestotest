<script setup lang="ts">
import { computed } from 'vue';
import type { NormalizedTable, TimelineEvent } from '../types/booking';
import { timeToMinutes } from '../utils/time';
import EventBlock from './EventBlock.vue';

const props = defineProps<{
  table: NormalizedTable;
  openingTime: string;
  closingTime: string;
  pixelsPerMinute: number;
  columnWidth: number;
}>();

// Calculate total height of the column container
const startMinutes = computed(() => timeToMinutes(props.openingTime));
const endMinutes = computed(() => {
  const mins = timeToMinutes(props.closingTime);
  // Ensure that if close is e.g. 23:40, we have space until midnight or 23:40
  return mins;
});

const totalDurationMinutes = computed(() => {
  const duration = endMinutes.value - startMinutes.value;
  return duration > 0 ? duration : 0;
});

const columnHeight = computed(() => {
  return `${totalDurationMinutes.value * props.pixelsPerMinute}px`;
});

// Grid background styles to draw grid line references seamlessly
const gridBackgroundStyle = computed(() => {
  const slotHeight = 30 * props.pixelsPerMinute; // 30 minutes
  return {
    backgroundImage: 'linear-gradient(to bottom, #2d3139 1px, transparent 1px)',
    backgroundSize: `100% ${slotHeight}px`,
  };
});
</script>

<template>
  <div
    :style="{ 
      width: `${columnWidth}px`, 
      height: columnHeight,
      ...gridBackgroundStyle
    }"
    class="relative shrink-0 border-r border-[#1e2128]/40 bg-[#111315]/10 select-none"
  >
    <!-- Overlay Grid Line Separators / Visual guidelines -->
    <div class="absolute inset-0 pointer-events-none"></div>

    <!-- Render Absolutely Positioned Event Blocks -->
    <EventBlock
      v-for="event in table.events"
      :key="event.id"
      :event="event"
      :opening-time="openingTime"
      :pixels-per-minute="pixelsPerMinute"
      :column-width="columnWidth"
    />
  </div>
</template>
