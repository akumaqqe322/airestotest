<script setup lang="ts">
import type { NormalizedTable } from '../types/booking';

withDefaults(defineProps<{
  tables: NormalizedTable[];
  columnWidth: number;
  theme?: 'dark' | 'light';
}>(), {
  theme: 'dark'
});
</script>

<template>
  <div 
    :class="[
      theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-[#14161d] border-[#2d3139]',
      'flex border-b border-zinc-800 select-none shrink-0 sticky top-0 z-30 transition-colors'
    ]"
  >
    <!-- Extra spacing offset matching the left TimeAxis (70px) -->
    <div 
      :class="[theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-[#14161d] border-[#2d3139]', 'shrink-0 sticky left-0 z-40 border-r']" 
      style="width: 70px;"
    ></div>

    <!-- Active Table Headers -->
    <div class="flex">
      <div
        v-for="table in tables"
        :key="table.id"
        :style="{ width: `${columnWidth}px` }"
        :class="[
          theme === 'light' 
            ? 'border-slate-200 bg-slate-100 hover:bg-slate-200/50' 
            : 'border-[#2d3139] bg-[#14161d] hover:bg-[#1b1e26]',
          'shrink-0 border-r px-4 py-2 flex flex-col justify-center transition-all select-none'
        ]"
      >
        <div :class="[theme === 'light' ? 'text-slate-900 font-extrabold' : 'text-slate-100 font-black', 'text-sm tracking-tight leading-none']">
          #{{ table.number }}
        </div>
        <div class="text-[10px] text-slate-400 mt-1 flex flex-wrap items-center gap-1.5 leading-none shrink-0 font-medium font-sans">
          <span>{{ table.capacity }} чел</span>
          <span class="text-slate-500">•</span>
          <span class="truncate">{{ table.zone }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
