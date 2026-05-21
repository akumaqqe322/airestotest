<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PositionedTimelineEvent } from '../types/booking';
import { Clock, User, Phone } from 'lucide-vue-next';

const props = defineProps<{
  event: PositionedTimelineEvent;
}>();

const isCurrentlyHovered = ref(false);

const showDetails = computed(() => {
  return !props.event.compact || isCurrentlyHovered.value;
});

// Style configurations depending on status/types
const themeColors = computed(() => {
  const s = props.event.status;
  
  if (props.event.type === 'order') {
    switch (s) {
      case 'New':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/35 hover:bg-emerald-500/20 text-emerald-400',
          bgIndicator: 'bg-emerald-400Shadow',
          textClass: 'text-emerald-400',
          borderClass: 'border-emerald-500/40'
        };
      case 'Bill':
        return {
          bg: 'bg-indigo-500/10 border-indigo-500/35 hover:bg-indigo-500/20 text-indigo-400',
          bgIndicator: 'bg-indigo-400',
          textClass: 'text-indigo-400',
          borderClass: 'border-indigo-500/30'
        };
      case 'Closed':
        return {
          bg: 'bg-gray-500/10 border-gray-500/25 hover:bg-gray-500/15 text-gray-400',
          bgIndicator: 'bg-gray-400',
          textClass: 'text-gray-400',
          borderClass: 'border-gray-500/20'
        };
      case 'Banquet':
        return {
          bg: 'bg-purple-500/10 border-purple-500/35 hover:bg-purple-500/20 text-purple-400',
          bgIndicator: 'bg-purple-400',
          textClass: 'text-purple-400',
          borderClass: 'border-purple-500/30'
        };
      default:
        return {
          bg: 'bg-gray-500/10 border-gray-500/30 hover:bg-gray-500/20 text-gray-400',
          bgIndicator: 'bg-gray-400',
          textClass: 'text-gray-400',
          borderClass: 'border-gray-500/30'
        };
    }
  } else {
    // Reservations
    switch (s) {
      case 'Новая':
        return {
          bg: 'bg-amber-500/12 border-amber-500/40 hover:bg-amber-500/22 text-amber-400',
          bgIndicator: 'bg-amber-400',
          textClass: 'text-amber-400',
          borderClass: 'border-amber-500/40'
        };
      case 'Заявка':
        return {
          bg: 'bg-sky-500/10 border-sky-500/35 hover:bg-sky-500/20 text-sky-400',
          bgIndicator: 'bg-sky-400',
          textClass: 'text-sky-400',
          borderClass: 'border-sky-500/30'
        };
      case 'Живая очередь':
        return {
          bg: 'bg-orange-500/10 border-orange-500/35 hover:bg-orange-500/20 text-orange-400',
          bgIndicator: 'bg-orange-400',
          textClass: 'text-orange-400',
          borderClass: 'border-orange-500/30'
        };
      case 'Открыт':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/35 hover:bg-emerald-500/20 text-emerald-400',
          bgIndicator: 'bg-emerald-400',
          textClass: 'text-emerald-400',
          borderClass: 'border-[#2d3139]'
        };
      case 'Закрыт':
        return {
          bg: 'bg-gray-500/12 border-gray-500/25 hover:bg-gray-500/18 text-gray-400',
          bgIndicator: 'bg-gray-500',
          textClass: 'text-gray-500',
          borderClass: 'border-gray-500/20'
        };
      default:
        return {
          bg: 'bg-gray-500/10 border-gray-500/30 hover:bg-gray-500/20 text-gray-400',
          bgIndicator: 'bg-gray-450',
          textClass: 'text-gray-400',
          borderClass: 'border-gray-500/30'
        };
    }
  }
});

// Format ISO timestamps beautifully to simple HH:MM for internal card markers
function formatDisplayTime(val: string): string {
  if (!val) return '';
  if (val.includes('T')) {
    const match = val.match(/T(\d{2}):(\d{2})/);
    if (match) return `${match[1]}:${match[2]}`;
  }
  return val;
}
</script>

<template>
  <div
    :style="{
      top: `${event.topPx}px`,
      height: `${event.heightPx}px`,
      width: `${event.widthPx}px`,
      left: `${event.leftPx}px`,
      zIndex: isCurrentlyHovered ? 100 : event.zIndex
    }"
    @mouseenter="isCurrentlyHovered = true"
    @mouseleave="isCurrentlyHovered = false"
    class="absolute rounded-lg border px-2.5 py-1.5 flex flex-col justify-between overflow-hidden shadow-md transition-all duration-150 backdrop-blur-md select-none hover:scale-[1.01] cursor-pointer group hover:bg-[#151720]/95 hover:border-amber-500/80"
    :class="[themeColors.bg, isCurrentlyHovered ? 'shadow-lg shadow-black/50 border-amber-500/85 ring-1 ring-amber-500/10' : '']"
  >
    <!-- Card Top Header Row -->
    <div class="flex items-start justify-between gap-1 min-w-0">
      <h4 class="text-[11px] font-bold tracking-tight text-white line-clamp-1 truncate min-w-0 pr-1">
        {{ event.title }}
      </h4>
      <div 
        class="w-1.5 h-1.5 rounded-full shrink-0 mt-1" 
        :class="themeColors.bgIndicator" 
        :title="event.status"
      ></div>
    </div>

    <!-- Details block (Responsive to compact & hover restructurings) -->
    <div v-if="showDetails" class="flex flex-col gap-0.5 mt-1 text-[10px] text-gray-400 leading-tight">
      <div class="flex items-center gap-1">
        <Clock class="w-2.5 h-2.5 shrink-0 text-gray-500 opacity-80" />
        <span class="font-semibold tracking-wide">
          {{ formatDisplayTime(event.startTime) }} - {{ formatDisplayTime(event.endTime) }}
        </span>
      </div>
      
      <!-- Show guests and phone numbers on expand / hover -->
      <div v-if="event.numPeople" class="flex items-center gap-1 mt-0.5">
        <User class="w-2.5 h-2.5 shrink-0 text-gray-500 opacity-80" />
        <span class="truncate">
          {{ event.numPeople }} чел
        </span>
      </div>

      <div v-if="event.phoneNumber && isCurrentlyHovered" class="flex items-center gap-1 mt-0.5 opacity-85">
        <span class="text-[9px] text-amber-500 font-mono tracking-tight select-all truncate">
          {{ event.phoneNumber }}
        </span>
      </div>
    </div>

    <!-- Compressed visual indicators for micro-tall booking intervals -->
    <div v-else class="text-[9px] text-gray-500 font-mono flex items-center gap-1 mt-0.5 leading-none shrink-0">
      <span class="font-medium text-gray-400">{{ formatDisplayTime(event.startTime) }}</span>
      <span v-if="event.numPeople" class="text-amber-500/80 font-bold">• {{ event.numPeople }}ч</span>
    </div>

    <!-- Status subtitle tag (Only for fully expanded large blocks) -->
    <div 
      v-if="event.heightPx >= 70 && showDetails" 
      class="text-[9px] font-semibold tracking-wider mt-1.5 pt-1.5 border-t border-white/5 opacity-80 uppercase leading-none truncate"
      :class="themeColors.textClass"
    >
      {{ event.status }}
    </div>
  </div>
</template>
