<script setup lang="ts">
import { Users } from 'lucide-vue-next';
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
      'flex border-b select-none shrink-0 sticky top-0 z-30 transition-colors'
    ]"
  >
    <!-- Extra spacing offset matching the left TimeAxis (70px) -->
    <div 
      :class="[theme === 'light' ? 'bg-slate-100' : 'bg-[#14161d]', 'shrink-0']" 
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
            ? 'border-slate-250 bg-slate-100 hover:bg-slate-200/50' 
            : 'border-[#2d3139] bg-[#14161d] hover:bg-[#1b1e26]',
          'shrink-0 border-r px-4 py-3 flex flex-col justify-center transition-all'
        ]"
      >
        <div class="flex items-center justify-between">
          <span :class="[theme === 'light' ? 'text-slate-800' : 'text-gray-200', 'text-xs font-bold tracking-wide truncate']">
            {{ table.number }}
          </span>
          <span class="text-[10px] text-amber-500 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
            <Users class="w-2.5 h-2.5" />
            {{ table.capacity }}
          </span>
        </div>
        <div class="text-[10px] text-slate-450 mt-1 flex items-center justify-between shrink-0">
          <span class="truncate">{{ table.zone }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
