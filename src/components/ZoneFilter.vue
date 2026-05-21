<script setup lang="ts">
import { Layers } from 'lucide-vue-next';
import type { TableZone } from '../types/booking';

const props = defineProps<{
  zones: TableZone[];
  selectedZones: TableZone[];
}>();

const emit = defineEmits<{
  (e: 'update:selectedZones', value: TableZone[]): void;
}>();

function isSelected(zone: TableZone): boolean {
  return props.selectedZones.includes(zone);
}

function toggleZone(zone: TableZone) {
  let newList = [...props.selectedZones];
  if (newList.includes(zone)) {
    newList = newList.filter(z => z !== zone);
  } else {
    newList.push(zone);
  }
  emit('update:selectedZones', newList);
}

function selectAll() {
  emit('update:selectedZones', [...props.zones]);
}
</script>

<template>
  <div class="flex items-center gap-2 bg-[#14161d] p-1.5 rounded-xl border border-[#2d3139] overflow-x-auto scrollbar-none max-w-full">
    <div class="flex items-center gap-2 px-3 text-gray-500 border-r border-[#2d3139] shrink-0">
      <Layers class="w-4 h-4 text-amber-500" />
      <span class="text-xs font-semibold uppercase tracking-wider hidden sm:inline">Залы</span>
    </div>

    <div class="flex items-center gap-1.5 shrink-0">
      <button
        @click="selectAll"
        class="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer bg-[#1b1e26] border border-[#2d3139] text-[#e2e8f0] hover:text-amber-500 hover:border-amber-500 transition-all duration-150 mr-1"
      >
        Все залы
      </button>

      <button
        v-for="zone in zones"
        :key="zone"
        @click="toggleZone(zone)"
        :class="[
          'px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer border transition-all duration-150',
          isSelected(zone)
            ? 'bg-amber-500 text-black border-amber-500 font-bold shadow-md shadow-amber-500/10'
            : 'bg-transparent text-gray-400 border-transparent hover:bg-[#1b1e26] hover:text-white'
        ]"
      >
        {{ zone }}
      </button>
    </div>
  </div>
</template>
