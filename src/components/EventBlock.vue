<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PositionedTimelineEvent } from '../types/booking';
import { Clock, User, Phone, Layers, Bookmark } from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  event: PositionedTimelineEvent;
  theme?: 'dark' | 'light';
}>(), {
  theme: 'dark'
});

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const isCurrentlyHovered = ref(false);

const isCompact = computed(() => {
  return props.event.heightPx < 44;
});

const ORDER_STATUS_LABELS: Record<string, string> = {
  New: 'Новый заказ',
  Bill: 'Счёт',
  Closed: 'Закрыт',
  Banquet: 'Банкет'
};

const displayStatus = computed(() => {
  if (props.event.type === 'order') {
    return ORDER_STATUS_LABELS[props.event.status] || props.event.status;
  }
  return props.event.status;
});


// Style configurations depending on status/types
const themeColors = computed(() => {
  const s = props.event.status;
  const isDark = props.theme === 'dark';
  
  if (props.event.type === 'order') {
    switch (s) {
      case 'New':
        return {
          bg: isDark ? 'bg-zinc-900' : 'bg-slate-50',
          borderL: 'border-l-cyan-500',
          badgeBg: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
          textClass: 'text-cyan-400',
          accentBorder: 'border-cyan-500/30'
        };
      case 'Bill':
        return {
          bg: isDark ? 'bg-zinc-900' : 'bg-slate-50',
          borderL: 'border-l-amber-500',
          badgeBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          textClass: 'text-amber-400',
          accentBorder: 'border-amber-500/30'
        };
      case 'Closed':
        return {
          bg: isDark ? 'bg-zinc-900' : 'bg-slate-100',
          borderL: 'border-l-slate-400',
          badgeBg: 'bg-slate-400/10 text-slate-400 border-slate-400/20',
          textClass: 'text-slate-400',
          accentBorder: 'border-slate-500/20'
        };
      case 'Banquet':
        return {
          bg: isDark ? 'bg-zinc-900' : 'bg-slate-50',
          borderL: 'border-l-purple-500',
          badgeBg: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
          textClass: 'text-purple-400',
          accentBorder: 'border-purple-500/30'
        };
      default:
        return {
          bg: isDark ? 'bg-zinc-900' : 'bg-slate-50',
          borderL: 'border-l-slate-500',
          badgeBg: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
          textClass: 'text-slate-400',
          accentBorder: 'border-slate-500/20'
        };
    }
  } else {
    // Reservations
    switch (s) {
      case 'Живая очередь':
        return {
          bg: isDark ? 'bg-zinc-900' : 'bg-slate-50',
          borderL: 'border-l-blue-500',
          badgeBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          textClass: 'text-blue-400',
          accentBorder: 'border-blue-500/30'
        };
      case 'Новая':
        return {
          bg: isDark ? 'bg-zinc-900' : 'bg-slate-50',
          borderL: 'border-l-orange-500',
          badgeBg: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
          textClass: 'text-orange-400',
          accentBorder: 'border-orange-500/30'
        };
      case 'Заявка':
        return {
          bg: isDark ? 'bg-[#151720]' : 'bg-slate-50',
          borderL: 'border-l-yellow-500',
          badgeBg: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
          textClass: 'text-yellow-400',
          accentBorder: 'border-yellow-500/30'
        };
      case 'Открыт':
        return {
          bg: isDark ? 'bg-zinc-900' : 'bg-slate-50',
          borderL: 'border-l-emerald-500',
          badgeBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          textClass: 'text-emerald-400',
          accentBorder: 'border-emerald-500/30'
        };
      case 'Закрыт':
        return {
          bg: isDark ? 'bg-zinc-900' : 'bg-slate-100',
          borderL: 'border-l-slate-400',
          badgeBg: 'bg-slate-400/10 text-slate-400 border-slate-400/20',
          textClass: 'text-slate-400',
          accentBorder: 'border-slate-500/20'
        };
      default:
        return {
          bg: isDark ? 'bg-zinc-900' : 'bg-slate-50',
          borderL: 'border-l-slate-500',
          badgeBg: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
          textClass: 'text-slate-500',
          accentBorder: 'border-slate-500/20'
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
    @click="emit('click', $event)"
    :class="[
      themeColors.bg,
      themeColors.borderL,
      theme === 'light' 
        ? 'border-slate-200 border-r border-t border-b hover:bg-slate-100' 
        : 'border-zinc-800 border-r border-t border-b hover:bg-zinc-800',
      isCurrentlyHovered ? 'shadow-lg scale-[1.01]' : 'shadow-none',
      isCompact ? 'px-1 py-0.5' : 'px-1.5 py-1',
      'event-block absolute border-l-[3px] rounded-r-md flex flex-col justify-between select-none cursor-pointer overflow-hidden transition-all duration-150'
    ]"
  >
    <!-- Normal minimal card layout -->
    <div class="flex flex-col h-full justify-between min-w-0 w-full">
      
      <template v-if="isCompact">
        <!-- Compact Row: Status + Time side-by-side -->
        <div class="flex items-center justify-between gap-1 w-full min-w-0 h-full">
          <span 
            :class="[
              themeColors.badgeBg,
              'text-[7.5px] font-bold px-1 py-0 rounded uppercase tracking-wider truncate border leading-none shrink-0'
            ]"
          >
            {{ displayStatus }}
          </span>
          <span :class="[theme === 'light' ? 'text-slate-600' : 'text-slate-300', 'text-[8px] font-mono leading-none truncate font-bold shrink-0']">
            {{ formatDisplayTime(event.startTime) }}
          </span>
        </div>
      </template>

      <template v-else>
        <!-- Top: Status + Time Range -->
        <div class="flex items-center justify-between gap-1 min-w-0 w-full leading-none mb-0.5">
          <!-- Status Label -->
          <span 
            :class="[
              themeColors.badgeBg,
              'text-[8px] font-bold px-1 py-0.5 rounded uppercase tracking-wider truncate border leading-none shrink-0'
            ]"
          >
            {{ displayStatus }}
          </span>
          <!-- Time Range -->
          <span :class="[theme === 'light' ? 'text-slate-500' : 'text-slate-400', 'text-[9px] font-mono font-semibold shrink-0']">
            {{ formatDisplayTime(event.startTime) }}-{{ formatDisplayTime(event.endTime) }}
          </span>
        </div>

        <!-- Center: Guest Name / Order tag -->
        <div class="my-auto min-w-0 pr-0.5 w-full leading-tight">
          <h4 :class="[theme === 'light' ? 'text-slate-900 font-extrabold' : 'text-white font-extrabold', 'text-[10px] tracking-tight truncate']">
            {{ event.type === 'reservation' ? event.name : (event.status === 'Banquet' ? 'Банкет' : 'Заказ') }}
          </h4>
        </div>

        <!-- Bottom: Guest Count if space allows -->
        <div v-if="event.heightPx >= 48" class="flex items-center justify-between text-[8.5px] text-slate-400 mt-0.5 leading-none font-mono">
          <span v-if="event.type === 'reservation'" class="flex items-center gap-0.5 shrink-0 font-medium">
            <User class="w-2 h-2 shrink-0 opacity-70" />
            <span>{{ event.numPeople }} чел</span>
          </span>
          <span class="ml-auto opacity-75">
            {{ formatDisplayTime(event.endTime) }}
          </span>
        </div>
      </template>

    </div>

    <!-- Hover Details Tooltip Popover -->
    <div 
      v-if="isCurrentlyHovered"
      :class="[
        theme === 'light' ? 'bg-white border-slate-300 text-slate-800 shadow-xl' : 'bg-[#181a22] border-zinc-700 text-slate-100 shadow-2xl',
        'absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 rounded-xl border p-3.5 z-[100] cursor-default text-left select-text animate-fade-in'
      ]"
      @click.stop
    >
      <!-- Small arrow indicator -->
      <div :class="[theme === 'light' ? 'border-t-white' : 'border-t-[#181a22]', 'absolute top-full left-1/2 -translate-x-1/2 border-x-8 border-x-transparent border-t-8']"></div>

      <div class="flex items-center justify-between gap-2">
        <span class="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">
          {{ event.type === 'reservation' ? 'Бронирование' : 'Заказ' }}
        </span>
        <span 
          :class="[
            themeColors.badgeBg,
            'text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono border'
          ]"
        >
          {{ displayStatus }}
        </span>
      </div>

      <h5 :class="[theme === 'light' ? 'text-slate-900' : 'text-white', 'text-sm font-extrabold mt-2 tracking-tight leading-snug']">
        {{ event.type === 'reservation' ? event.name : (event.status === 'Banquet' ? `Банкет (Стол №${event.originalId})` : `Заказ стола №${event.originalId}`) }}
      </h5>

      <div class="space-y-2 mt-2.5 pt-2.5 border-t border-slate-700/20 text-[10px] text-gray-400 font-mono">
        <div class="flex items-center gap-2">
          <Clock class="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>{{ formatDisplayTime(event.startTime) }} - {{ formatDisplayTime(event.endTime) }}</span>
        </div>
        <div v-if="event.numPeople" class="flex items-center gap-2">
          <User class="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>Гости: <strong :class="theme === 'light' ? 'text-slate-800' : 'text-white'">{{ event.numPeople }} чел</strong></span>
        </div>
        <div v-if="event.phoneNumber" class="flex items-center gap-2">
          <Phone class="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>Тел: <strong :class="theme === 'light' ? 'text-slate-800' : 'text-white'">{{ event.phoneNumber }}</strong></span>
        </div>
        <div class="flex items-center gap-2">
          <Layers class="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>Тип: {{ event.type === 'reservation' ? 'Бронирование' : 'Заказ' }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

