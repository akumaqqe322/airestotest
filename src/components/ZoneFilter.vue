<script setup lang="ts">
import { Layers } from 'lucide-vue-next';
import type { TableZone } from '../types/booking';

const props = defineProps<{
  zones: TableZone[];
  selectedZone: TableZone | 'Все зоны';
}>();

const emit = defineEmits<{
  (e: 'update:selectedZone', value: TableZone | 'Все зоны'): void;
}>();
</script>

<template>
  <div class="flex items-center gap-2 bg-[#14161d] p-1.5 rounded-xl border border-[#2d3139] overflow-x-auto scrollbar-none max-w-full">
    <div class="flex items-center gap-2 px-3 text-gray-500 border-r border-[#2d3139] shrink-0">
      <Layers class="w-4 h-4 text-amber-500" />
      <span class="text-xs font-semibold uppercase tracking-wider hidden sm:inline">Залы</span>
    </div>

    <div class="flex items-center gap-1.5 shrink-0">
      <button
        @click="emit('update:selectedZone', 'Все зоны')"
        :class="[
          'px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all duration-150',
          selectedZone === 'Все зоны'
            ? 'bg-[#2d3139] text-white border border-[#3f4550]'
            : 'bg-transparent text-gray-400 hover:bg-[#1b1e26] hover:text-white border border-transparent'
        ]"
      >
        Все залы
      </button>

      <button
        v-for="zone in zones"
        :key="zone"
        @click="emit('update:selectedZone', zone)"
        :class="[
          'px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all duration-150',
          selectedZone === zone
            ? 'bg-[#2d3139] text-white border border-[#3f4550]'
            : 'bg-transparent text-gray-400 hover:bg-[#1b1e26] hover:text-white border border-transparent'
        ]"
      >
        {{ zone }}
      </button>
    </div>
  </div>
</template>
