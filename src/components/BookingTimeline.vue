<script setup lang="ts">
import { ref, computed, onMounted, onUpdated } from 'vue';
import type { NormalizedTable, TimelineSelection } from '../types/booking';
import TimeAxis from './TimeAxis.vue';
import TableColumn from './TableColumn.vue';
import CurrentTimeLine from './CurrentTimeLine.vue';
import { TIME_AXIS_WIDTH, TABLE_HEADER_HEIGHT, TIMELINE_COLUMN_WIDTH, TIMELINE_PIXELS_PER_MINUTE } from '../constants/timeline';
import { timeToMinutes } from '../utils/time';

const props = withDefaults(defineProps<{
  tables: NormalizedTable[];
  openingTime: string;
  closingTime: string;
  timezone: string;
  currentTime: string;
  pixelsPerMinute?: number;
  columnWidth?: number;
  theme?: 'dark' | 'light';
  selection?: TimelineSelection | null;
}>(), {
  pixelsPerMinute: TIMELINE_PIXELS_PER_MINUTE,
  columnWidth: TIMELINE_COLUMN_WIDTH,
  theme: 'dark',
  selection: null
});

const emit = defineEmits<{
  (e: 'pointerdown', event: PointerEvent): void;
  (e: 'pointermove', event: PointerEvent): void;
  (e: 'pointerup', event: PointerEvent): void;
  (e: 'pointercancel', event: PointerEvent): void;
  (e: 'edit-event', payload: { event: any; tableId: string }): void;
}>();

const timelineScrollContainer = ref<HTMLDivElement | null>(null);

// Start & end mins of restaurant
const startMinutes = computed(() => {
  if (!props.openingTime) return 0;
  return timeToMinutes(props.openingTime);
});

const endMinutes = computed(() => {
  if (!props.closingTime) return 0;
  return timeToMinutes(props.closingTime);
});

const totalDurationMinutes = computed(() => {
  const duration = endMinutes.value - startMinutes.value;
  return duration > 0 ? duration : 0;
});

const timelineHeight = computed(() => {
  return totalDurationMinutes.value * props.pixelsPerMinute;
});

// Development Alignment Check Routine
function checkAlignment() {
  if (process.env.NODE_ENV === 'production') return;
  
  props.tables.forEach((table, index) => {
    // Only check several index columns to avoid log spam (e.g. first, middle, last)
    if (index !== 0 && index !== Math.floor(props.tables.length / 2) && index !== props.tables.length - 1) {
      return;
    }
    const headerEl = document.querySelector(`[data-table-header-id="${table.id}"]`);
    const columnEl = document.querySelector(`[data-table-column-id="${table.id}"]`);
    if (headerEl && columnEl) {
      const hRect = headerEl.getBoundingClientRect();
      const cRect = columnEl.getBoundingClientRect();
      const diffLeft = Math.abs(hRect.left - cRect.left);
      const diffWidth = Math.abs(hRect.width - cRect.width);
      if (diffLeft > 1 || diffWidth > 1) {
        console.warn('Timeline alignment mismatch', {
          index,
          tableId: table.id,
          headerLeft: hRect.left,
          columnLeft: cRect.left,
          headerWidth: hRect.width,
          columnWidth: cRect.width,
          diffLeft,
          diffWidth
        });
      }
    }
  });
}

onMounted(() => {
  setTimeout(checkAlignment, 200);
});

onUpdated(() => {
  setTimeout(checkAlignment, 100);
});
</script>

<template>
  <div 
    :class="[
      theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0e1012] border-[#2d3139]',
      'relative flex flex-col flex-1 min-h-0 border rounded-xl overflow-hidden'
    ]"
  >
    
    <!-- Timeline scroll container -->
    <div 
      ref="timelineScrollContainer"
      :class="[
        theme === 'light' ? 'bg-[#f8fafc]' : 'bg-[#111315]',
        'flex-1 overflow-auto scrollbar-thin outline-none'
      ]"
    >
      <!-- Single aligned grid layout of header top-left corner space, headers row, time axis, and columns body row -->
      <div 
        class="grid"
        :style="{
          gridTemplateColumns: `${TIME_AXIS_WIDTH}px repeat(${tables.length}, ${columnWidth}px)`,
          gridTemplateRows: `${TABLE_HEADER_HEIGHT}px ${timelineHeight}px`,
          width: 'max-content'
        }"
      >
        <!-- 1. Top-left sticky corner element -->
        <div 
          :class="[
            theme === 'light' 
              ? 'bg-slate-100 border-slate-200 border-b text-slate-900' 
              : 'bg-[#14161d] border-[#2d3139] border-b text-white',
            'sticky top-0 left-0 z-50 border-r flex items-center justify-center select-none shrink-0'
          ]"
          :style="{
            gridColumn: '1',
            gridRow: '1',
            width: `${TIME_AXIS_WIDTH}px`,
            height: `${TABLE_HEADER_HEIGHT}px`
          }"
        >
          <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Время</span>
        </div>

        <!-- 2. Interactive table headers grid row -->
        <div
          v-for="(table, idx) in tables"
          :key="`header-${table.id}`"
          :data-table-header-id="table.id"
          :style="{
            gridColumn: `${idx + 2}`,
            gridRow: '1',
            width: `${columnWidth}px`,
            height: `${TABLE_HEADER_HEIGHT}px`
          }"
          :class="[
            theme === 'light' 
              ? 'border-slate-200 bg-slate-100 hover:bg-slate-200/50 border-b text-slate-900' 
              : 'border-[#2d3139] bg-[#14161d] hover:bg-[#1b1e26] border-b text-slate-100',
            'sticky top-0 z-30 border-r px-2 py-1 flex flex-col justify-center transition-all select-none'
          ]"
        >
          <div class="text-[13px] font-black tracking-tight leading-none">
            #{{ table.number }}
          </div>
          <div class="text-[9.5px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-1 leading-none shrink-0 font-medium font-sans">
            <span>{{ table.capacity }} чел</span>
            <span class="text-slate-500">•</span>
            <span class="truncate">{{ table.zone }}</span>
          </div>
        </div>

        <!-- 3. Vertical time indicator column (Sticky Left) -->
        <TimeAxis
          :opening-time="openingTime"
          :closing-time="closingTime"
          :pixels-per-minute="pixelsPerMinute"
          :theme="theme"
          class="sticky left-0 z-20"
          :style="{
            gridColumn: '1',
            gridRow: '2',
            height: `${timelineHeight}px`
          }"
        />

        <!-- 4. Table column Tracks grid container supporting drag Selection -->
        <div 
          :style="{
            gridColumn: `2 / span ${tables.length}`,
            gridRow: '2',
            display: 'flex',
            position: 'relative',
            height: `${timelineHeight}px`
          }"
          class="cursor-crosshair select-none touch-none"
          @pointerdown="emit('pointerdown', $event)"
          @pointermove="emit('pointermove', $event)"
          @pointerup="emit('pointerup', $event)"
          @pointercancel="emit('pointercancel', $event)"
        >
          <!-- Absolute current continuous time sync baseline indicator -->
          <CurrentTimeLine
            :current-time="currentTime"
            :opening-time="openingTime"
            :closing-time="closingTime"
            :pixels-per-minute="pixelsPerMinute"
          />

          <!-- Body Table columns tracks rendering -->
          <TableColumn
            v-for="table in tables"
            :key="table.id"
            :data-table-column-id="table.id"
            :table="table"
            :opening-time="openingTime"
            :closing-time="closingTime"
            :timezone="timezone"
            :pixels-per-minute="pixelsPerMinute"
            :column-width="columnWidth"
            :theme="theme"
            :selection="selection"
            @edit-event="(payload) => emit('edit-event', payload)"
          />
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped adjustments for scrollbar look if needed */
.scrollbar-thin::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 4px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}
</style>
