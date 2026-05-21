<script setup lang="ts">
import { ref, computed } from 'vue';
import type { NormalizedTable } from '../types/booking';
import { timeToMinutes, minutesToTime, clamp } from '../utils/time';
import { layoutEventsForColumn } from '../utils/timeline';
import EventBlock from './EventBlock.vue';

const props = withDefaults(defineProps<{
  table: NormalizedTable;
  openingTime: string;
  closingTime: string;
  timezone: string;
  pixelsPerMinute: number;
  columnWidth: number;
  theme?: 'dark' | 'light';
  selectedSlot?: { tableId: string; tableName: string; startMins: number; endMins: number } | null;
}>(), {
  theme: 'dark',
  selectedSlot: null
});

const emit = defineEmits<{
  (e: 'select-slot', slot: { tableId: string; tableName: string; startMins: number; endMins: number }): void;
}>();

const columnRef = ref<HTMLDivElement | null>(null);

// Calculate total height of the column container based on operating bounds
const startMinutes = computed(() => timeToMinutes(props.openingTime));
const endMinutes = computed(() => timeToMinutes(props.closingTime));

const totalDurationMinutes = computed(() => {
  const duration = endMinutes.value - startMinutes.value;
  return duration > 0 ? duration : 0;
});

const columnHeight = computed(() => {
  return `${totalDurationMinutes.value * props.pixelsPerMinute}px`;
});

// Grid background styles to draw 30-minute interval linear indicators
const gridBackgroundStyle = computed(() => {
  const slotHeight = 30 * props.pixelsPerMinute; // 30 minutes
  const gridColor = props.theme === 'light' ? 'rgba(148, 163, 184, 0.15)' : 'rgba(45, 49, 57, 0.4)';
  return {
    backgroundImage: `linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
    backgroundSize: `100% ${slotHeight}px`,
  };
});

// Calculate active selection state for this block
const hasActiveSelection = computed(() => {
  return props.selectedSlot && props.selectedSlot.tableId === props.table.id;
});

const selectionTopPx = computed(() => {
  if (!props.selectedSlot) return 0;
  return (props.selectedSlot.startMins - startMinutes.value) * props.pixelsPerMinute;
});

const selectionHeightPx = computed(() => {
  if (!props.selectedSlot) return 0;
  return (props.selectedSlot.endMins - props.selectedSlot.startMins) * props.pixelsPerMinute;
});

// Click handler to select new slot segments contextually
function handleTrackClick(e: MouseEvent) {
  if (!columnRef.value) return;
  const rect = columnRef.value.getBoundingClientRect();
  const y = e.clientY - rect.top;
  
  const openingMins = startMinutes.value;
  const closingMins = endMinutes.value;
  
  // Calculate relative minutes clicked
  const clickedMins = (y / props.pixelsPerMinute) + openingMins;
  
  // Round to nearest 15 minute segment
  const roundedMins = Math.round(clickedMins / 15) * 15;
  const clampedStart = clamp(roundedMins, openingMins, closingMins - 30);
  
  // Default booking window suggestion: 90 minutes (1.5 Hours)
  const clampedEnd = clamp(clampedStart + 90, openingMins + 30, closingMins);

  emit('select-slot', {
    tableId: props.table.id,
    tableName: props.table.number,
    startMins: clampedStart,
    endMins: clampedEnd
  });
}

// Call the collision-lane sorting & layout function
const positionedEvents = computed(() => {
  return layoutEventsForColumn(
    props.table.events,
    props.openingTime,
    props.closingTime,
    props.timezone,
    props.pixelsPerMinute,
    props.columnWidth
  );
});
</script>

<template>
  <div
    ref="columnRef"
    @click="handleTrackClick"
    :style="{ 
      width: `${columnWidth}px`, 
      height: columnHeight,
      ...gridBackgroundStyle
    }"
    :class="[
      theme === 'light' 
        ? 'border-slate-200 bg-slate-50/20 hover:bg-slate-100/10' 
        : 'border-[#2d3139]/40 bg-[#111315]/10 hover:bg-[#151820]/10',
      'relative shrink-0 border-r select-none cursor-crosshair transition-all duration-150'
    ]"
  >
    <!-- Render Absolutely Positioned Event Blocks -->
    <EventBlock
      v-for="positioned in positionedEvents"
      :key="positioned.id"
      :event="positioned"
      @click.stop
    />

    <!-- Render selection highlight slot placeholder (Bonus feature) -->
    <div 
      v-if="hasActiveSelection"
      :style="{
        top: `${selectionTopPx}px`,
        height: `${selectionHeightPx}px`,
        width: 'calc(100% - 6px)',
        left: '3px',
        zIndex: 40
      }"
      class="absolute rounded-lg border-2 border-dashed border-amber-500 bg-amber-500/15 pointer-events-none flex flex-col items-center justify-center text-center p-1 animate-pulse"
    >
      <span class="text-[9px] font-bold text-amber-500 uppercase tracking-widest leading-none">ВЫБОР</span>
      <span class="text-[10px] font-extrabold text-white font-mono mt-1 bg-amber-600/60 px-1.5 py-0.5 rounded leading-none shadow shadow-amber-950/30">
        {{ minutesToTime(selectedSlot?.startMins || 0) }} - {{ minutesToTime(selectedSlot?.endMins || 0) }}
      </span>
    </div>
  </div>
</template>
