<script setup lang="ts">
import { ref } from 'vue';
import type { NormalizedTable, TimelineSelection } from '../types/booking';
import TableHeader from './TableHeader.vue';
import TimeAxis from './TimeAxis.vue';
import TableColumn from './TableColumn.vue';
import CurrentTimeLine from './CurrentTimeLine.vue';

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
  pixelsPerMinute: 2, // 2px per minute means 60px for 30 minutes
  columnWidth: 190,   // Width of each table column track
  theme: 'dark',
  selection: null
});

const emit = defineEmits<{
  (e: 'pointerdown', event: PointerEvent): void;
  (e: 'pointermove', event: PointerEvent): void;
  (e: 'pointerup', event: PointerEvent): void;
  (e: 'pointercancel', event: PointerEvent): void;
}>();

const timelineScrollContainer = ref<HTMLDivElement | null>(null);
</script>

<template>
  <div 
    :class="[
      theme === 'light' ? 'bg-white border-slate-200 shadow-xl' : 'bg-[#0e1012] border-[#2d3139] shadow-2xl',
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
      <!-- Sticky headers at the top of scrolling view -->
      <TableHeader
        :tables="tables"
        :column-width="columnWidth"
        :theme="theme"
      />

      <!-- Core timeline body track -->
      <div class="relative flex">
        
        <!-- Sticky left-0 Time Axis -->
        <TimeAxis
          :opening-time="openingTime"
          :closing-time="closingTime"
          :pixels-per-minute="pixelsPerMinute"
          :theme="theme"
          class="sticky left-0 z-20"
        />

        <!-- Table Columns grid wrapper with Pointer event capturing -->
        <div 
          class="flex relative cursor-crosshair select-none touch-none"
          @pointerdown="emit('pointerdown', $event)"
          @pointermove="emit('pointermove', $event)"
          @pointerup="emit('pointerup', $event)"
          @pointercancel="emit('pointercancel', $event)"
        >
          <!-- Pulse current timeline indicator -->
          <CurrentTimeLine
            :current-time="currentTime"
            :opening-time="openingTime"
            :closing-time="closingTime"
            :pixels-per-minute="pixelsPerMinute"
          />

          <!-- Columns rendering -->
          <TableColumn
            v-for="table in tables"
            :key="table.id"
            :table="table"
            :opening-time="openingTime"
            :closing-time="closingTime"
            :timezone="timezone"
            :pixels-per-minute="pixelsPerMinute"
            :column-width="columnWidth"
            :theme="theme"
            :selection="selection"
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
