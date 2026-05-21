<script setup lang="ts">
import { ref } from 'vue';
import type { NormalizedTable } from '../types/booking';
import TableHeader from './TableHeader.vue';
import TimeAxis from './TimeAxis.vue';
import TableColumn from './TableColumn.vue';
import CurrentTimeLine from './CurrentTimeLine.vue';

const props = withDefaults(defineProps<{
  tables: NormalizedTable[];
  openingTime: string;
  closingTime: string;
  currentTime: string;
  pixelsPerMinute?: number;
  columnWidth?: number;
}>(), {
  pixelsPerMinute: 2, // 2px per minute means 60px for 30 minutes
  columnWidth: 190    // Width of each table column track
});

const timelineScrollContainer = ref<HTMLDivElement | null>(null);
</script>

<template>
  <div class="relative flex flex-col flex-1 min-h-0 bg-[#0e1012] border border-[#2d3139] rounded-xl overflow-hidden shadow-2xl">
    
    <!-- Timeline scroll container -->
    <div 
      ref="timelineScrollContainer"
      class="flex-1 overflow-auto bg-[#111315] scrollbar-thin outline-none"
    >
      <!-- Sticky headers at the top of scrolling view -->
      <TableHeader
        :tables="tables"
        :column-width="columnWidth"
      />

      <!-- Core timeline body track -->
      <div class="relative flex">
        
        <!-- Sticky left-0 Time Axis -->
        <TimeAxis
          :opening-time="openingTime"
          :closing-time="closingTime"
          :pixels-per-minute="pixelsPerMinute"
          class="sticky left-0 z-20"
        />

        <!-- Table Columns grid wrapper -->
        <div class="flex relative">
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
            :pixels-per-minute="pixelsPerMinute"
            :column-width="columnWidth"
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
  background: #111315;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #2d3139;
  border-radius: 4px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #3f4550;
}
</style>
