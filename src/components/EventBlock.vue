<script setup lang="ts">
import { computed } from 'vue';
import type { TimelineEvent } from '../types/booking';
import { timeToMinutes } from '../utils/time';
import { Clock, User } from 'lucide-vue-next';

const props = defineProps<{
  event: TimelineEvent;
  openingTime: string;
  pixelsPerMinute: number;
  columnWidth: number;
}>();

// Calculate position offsets based on parameters
const startMins = computed(() => timeToMinutes(props.event.startTime));
const endMins = computed(() => timeToMinutes(props.event.endTime));
const openingMins = computed(() => timeToMinutes(props.openingTime));

const topVal = computed(() => {
  const result = (startMins.value - openingMins.value) * props.pixelsPerMinute;
  return result >= 0 ? result : 0;
});

const heightVal = computed(() => {
  const diff = endMins.value - startMins.value;
  return diff > 0 ? diff * props.pixelsPerMinute : 30; // Min height safeguard
});

// Style configurations depending on status/types
const themeColors = computed(() => {
  const s = props.event.status;
  
  if (props.event.type === 'order') {
    switch (s) {
      case 'New':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30',
          indicator: 'bg-emerald-400',
          text: 'text-emerald-400',
          hoverBg: 'hover:bg-emerald-500/20'
        };
      case 'Bill':
        return {
          bg: 'bg-indigo-500/10 border-indigo-500/30',
          indicator: 'bg-indigo-400',
          text: 'text-indigo-400',
          hoverBg: 'hover:bg-indigo-500/20'
        };
      case 'Closed':
        return {
          bg: 'bg-gray-500/10 border-gray-500/20',
          indicator: 'bg-gray-400',
          text: 'text-gray-400',
          hoverBg: 'hover:bg-gray-500/15'
        };
      case 'Banquet':
        return {
          bg: 'bg-purple-500/10 border-purple-500/30',
          indicator: 'bg-purple-400',
          text: 'text-purple-400',
          hoverBg: 'hover:bg-purple-500/20'
        };
      default:
        return {
          bg: 'bg-gray-500/10 border-gray-500/30',
          indicator: 'bg-gray-400',
          text: 'text-gray-400',
          hoverBg: 'hover:bg-gray-500/20'
        };
    }
  } else {
    // Reservations
    switch (s) {
      case 'Новая':
        return {
          bg: 'bg-amber-500/10 border-amber-500/40',
          indicator: 'bg-amber-400',
          text: 'text-amber-400',
          hoverBg: 'hover:bg-amber-500/20'
        };
      case 'Заявка':
        return {
          bg: 'bg-blue-500/10 border-blue-500/30',
          indicator: 'bg-blue-400',
          text: 'text-blue-400',
          hoverBg: 'hover:bg-blue-500/20'
        };
      case 'Живая очередь':
        return {
          bg: 'bg-orange-500/10 border-orange-500/35',
          indicator: 'bg-orange-400',
          text: 'text-orange-400',
          hoverBg: 'hover:bg-orange-500/20'
        };
      case 'Открыт':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30',
          indicator: 'bg-emerald-400',
          text: 'text-emerald-400',
          hoverBg: 'hover:bg-emerald-500/20'
        };
      case 'Закрыт':
        return {
          bg: 'bg-gray-500/10 border-gray-500/25',
          indicator: 'bg-gray-400',
          text: 'text-gray-400',
          hoverBg: 'hover:bg-gray-500/15'
        };
      default:
        return {
          bg: 'bg-gray-500/10 border-gray-500/30',
          indicator: 'bg-gray-400',
          text: 'text-gray-400',
          hoverBg: 'hover:bg-gray-500/20'
        };
    }
  }
});
</script>

<template>
  <div
    :style="{
      top: `${topVal}px`,
      height: `${heightVal}px`,
      width: 'calc(100% - 6px)',
      left: '3px'
    }"
    class="absolute rounded-lg border px-3 py-1.5 flex flex-col justify-between overflow-hidden shadow-sm transition-all duration-150 backdrop-blur-xs select-none hover:scale-[1.01] hover:shadow-md cursor-pointer group"
    :class="[themeColors.bg, themeColors.hoverBg]"
  >
    <!-- Card Top Header Row -->
    <div class="flex items-start justify-between gap-1.5 min-w-0">
      <h4 class="text-[11px] font-bold tracking-tight text-white line-clamp-1 truncate min-w-0">
        {{ event.title }}
      </h4>
      <div 
        class="w-1.5 h-1.5 rounded-full shrink-0 mt-1" 
        :class="themeColors.indicator" 
        :title="event.status"
      ></div>
    </div>

    <!-- Details Column (Hides gracefully on small vertical cards) -->
    <div v-if="heightVal > 50" class="flex flex-col gap-0.5 mt-1 text-[10px] text-gray-400 leading-tight">
      <div class="flex items-center gap-1">
        <Clock class="w-2.5 h-2.5 shrink-0 text-gray-500" />
        <span class="font-medium tracking-wide">
          {{ event.startTime }} - {{ event.endTime }}
        </span>
      </div>
      <div v-if="event.numPeople" class="flex items-center gap-1 mt-0.5">
        <User class="w-2.5 h-2.5 shrink-0 text-gray-500" />
        <span class="truncate">
          {{ event.numPeople }} чел
        </span>
      </div>
    </div>

    <!-- Status Subtitle or tag description (Only for larger cards) -->
    <div 
      v-if="heightVal > 75 && event.subtitle" 
      class="text-[9px] font-medium tracking-wide mt-1.5 pt-1 border-t border-white/5 opacity-80 uppercase leading-none"
      :class="themeColors.text"
    >
      {{ event.subtitle }}
    </div>
  </div>
</template>
