<script setup lang="ts">
import { ref, computed } from 'vue';
import type { NormalizedTable, TimelineSelection } from '../types/booking';
import { timeToMinutes, minutesToTime } from '../utils/time';
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
  selection?: TimelineSelection | null;
}>(), {
  theme: 'dark',
  selection: null
});

const emit = defineEmits<{
  (e: 'edit-event', payload: { event: any; tableId: string }): void;
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
  const gridColor = props.theme === 'light' ? 'rgba(148, 163, 184, 0.08)' : 'rgba(255, 255, 255, 0.04)';
  return {
    backgroundImage: `linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
    backgroundSize: `100% ${slotHeight}px`,
  };
});

// Calculate active selection state for this column
const isSelected = computed(() => {
  return props.selection && props.selection.tableIds.includes(props.table.id);
});

const selectionTopPx = computed(() => {
  if (!props.selection) return 0;
  return (props.selection.startMins - startMinutes.value) * props.pixelsPerMinute;
});

const selectionHeightPx = computed(() => {
  if (!props.selection) return 0;
  return (props.selection.endMins - props.selection.startMins) * props.pixelsPerMinute;
});

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
      :theme="theme"
      @click.stop="emit('edit-event', { event: positioned, tableId: table.id })"
    />

    <!-- Render selection highlight slot placeholder (Bonus feature) -->
    <div 
      v-if="isSelected && selection"
      :style="{
        top: `${selectionTopPx}px`,
        height: `${selectionHeightPx}px`,
        width: 'calc(100% - 6px)',
        left: '3px',
        zIndex: 40
      }"
      :class="[
        selection.hasConflicts
          ? 'border-rose-500 bg-rose-500/10 border-2 border-dashed'
          : 'border-amber-500 bg-amber-500/15 border-2 border-dashed',
        'absolute rounded-lg pointer-events-none flex flex-col items-center justify-center text-center p-1 animate-pulse'
      ]"
    >
      <span 
        :class="[
          selection.hasConflicts ? 'text-rose-500' : 'text-amber-500',
          'text-[9px] font-bold uppercase tracking-widest leading-none'
        ]"
      >
        {{ selection.hasConflicts ? 'КОНФЛИКТ' : 'ВЫБОР' }}
      </span>
      <span 
        :class="[
          selection.hasConflicts ? 'bg-rose-600/75' : 'bg-amber-600/60',
          'text-[10px] font-extrabold text-white font-mono mt-1 px-1.5 py-0.5 rounded leading-none shadow shadow-amber-950/30'
        ]"
      >
        {{ selection.startTime }} - {{ selection.endTime }}
      </span>
    </div>
  </div>
</template>
