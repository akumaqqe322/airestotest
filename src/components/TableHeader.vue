<script setup lang="ts">
import { Users } from 'lucide-vue-next';
import type { NormalizedTable } from '../types/booking';

defineProps<{
  tables: NormalizedTable[];
  columnWidth: number; // e.g. 180 or 200px
}>();
</script>

<template>
  <div class="flex bg-[#14161d] border-b border-[#2d3139] select-none shrink-0 sticky top-0 z-30">
    <!-- Extra spacing offset matching the left TimeAxis (70px) -->
    <div class="shrink-0 bg-[#14161d]" style="width: 70px;"></div>

    <!-- Active Table Headers -->
    <div class="flex">
      <div
        v-for="table in tables"
        :key="table.id"
        :style="{ width: `${columnWidth}px` }"
        class="shrink-0 border-r border-[#2d3139] px-4 py-3 flex flex-col justify-center bg-[#14161d] transition-all hover:bg-[#1b1e26]"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-gray-200 tracking-wide truncate">
            {{ table.number }}
          </span>
          <span class="text-[10px] text-amber-500 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
            <Users class="w-2.5 h-2.5" />
            {{ table.capacity }}
          </span>
        </div>
        <div class="text-[10px] text-gray-500 mt-1 flex items-center justify-between shrink-0">
          <span class="truncate">{{ table.zone }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
