<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PositionedTimelineEvent } from '../types/booking';
import { Clock, User, Phone, Layers, Bookmark } from 'lucide-vue-next';
import { ORDER_STATUS_LABELS } from '../constants/labels';
import { HOVER_DETAILS_DELAY_MS } from '../constants/timeline';

const props = withDefaults(defineProps<{
  event: PositionedTimelineEvent;
  theme?: 'dark' | 'light';
}>(), {
  theme: 'dark'
});

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const isHovered = ref(false);
const showDetails = ref(false);
let hoverTimer: ReturnType<typeof setTimeout> | null = null;

function handlePointerEnter() {
  isHovered.value = true;
  if (hoverTimer) clearTimeout(hoverTimer);
  hoverTimer = setTimeout(() => {
    if (isHovered.value) {
      showDetails.value = true;
    }
  }, HOVER_DETAILS_DELAY_MS);
}

function handlePointerLeave() {
  if (hoverTimer) {
    clearTimeout(hoverTimer);
    hoverTimer = null;
  }
  isHovered.value = false;
  showDetails.value = false;
}

function handleFocus() {
  isHovered.value = true;
  if (hoverTimer) clearTimeout(hoverTimer);
  hoverTimer = setTimeout(() => {
    if (isHovered.value) {
      showDetails.value = true;
    }
  }, HOVER_DETAILS_DELAY_MS);
}

function handleBlur() {
  handlePointerLeave();
}

const isCompact = computed(() => {
  return props.event.heightPx < 44;
});

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
          bg: isDark ? 'bg-zinc-900/80 backdrop-blur-[1px]' : 'bg-white/80 backdrop-blur-[1px]',
          borderL: 'border-l-cyan-500',
          badgeBg: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
          textClass: 'text-cyan-400',
          accentBorder: 'border-cyan-500/30',
          progressBarBg: 'bg-cyan-500'
        };
      case 'Bill':
        return {
          bg: isDark ? 'bg-zinc-900/80 backdrop-blur-[1px]' : 'bg-white/80 backdrop-blur-[1px]',
          borderL: 'border-l-amber-500',
          badgeBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          textClass: 'text-amber-400',
          accentBorder: 'border-amber-500/30',
          progressBarBg: 'bg-amber-500'
        };
      case 'Closed':
        return {
          bg: isDark ? 'bg-zinc-950/65' : 'bg-slate-200/75',
          borderL: 'border-l-slate-400',
          badgeBg: 'bg-slate-400/10 text-slate-400 border-slate-400/20',
          textClass: 'text-slate-400',
          accentBorder: 'border-slate-500/20',
          progressBarBg: 'bg-slate-400'
        };
      case 'Banquet':
        return {
          bg: isDark ? 'bg-zinc-900/80 backdrop-blur-[1px]' : 'bg-white/80 backdrop-blur-[1px]',
          borderL: 'border-l-purple-500',
          badgeBg: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
          textClass: 'text-purple-400',
          accentBorder: 'border-purple-500/30',
          progressBarBg: 'bg-purple-500'
        };
      default:
        return {
          bg: isDark ? 'bg-zinc-900/80 backdrop-blur-[1px]' : 'bg-white/80 backdrop-blur-[1px]',
          borderL: 'border-l-slate-500',
          badgeBg: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
          textClass: 'text-slate-400',
          accentBorder: 'border-slate-500/20',
          progressBarBg: 'bg-slate-500'
        };
    }
  } else {
    // Reservations
    switch (s) {
      case 'Живая очередь':
        return {
          bg: isDark ? 'bg-zinc-900/80' : 'bg-white/80',
          borderL: 'border-l-blue-500',
          badgeBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          textClass: 'text-blue-400',
          accentBorder: 'border-blue-500/30',
          progressBarBg: 'bg-blue-500'
        };
      case 'Новая':
        return {
          bg: isDark ? 'bg-zinc-900/80' : 'bg-white/80',
          borderL: 'border-l-orange-500',
          badgeBg: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
          textClass: 'text-orange-400',
          accentBorder: 'border-orange-500/30',
          progressBarBg: 'bg-orange-500'
        };
      case 'Заявка':
        return {
          bg: isDark ? 'bg-[#151720]/80' : 'bg-white/80',
          borderL: 'border-l-yellow-500',
          badgeBg: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
          textClass: 'text-yellow-400',
          accentBorder: 'border-yellow-500/30',
          progressBarBg: 'bg-yellow-500'
        };
      case 'Открыт':
        return {
          bg: isDark ? 'bg-zinc-900/80' : 'bg-white/80',
          borderL: 'border-l-emerald-500',
          badgeBg: 'bg-emerald-500/10 text-emerald-505 border-emerald-500/20',
          textClass: 'text-emerald-400',
          accentBorder: 'border-emerald-500/30',
          progressBarBg: 'bg-emerald-500'
        };
      case 'Закрыт':
        return {
          bg: isDark ? 'bg-zinc-950/65' : 'bg-slate-200/75',
          borderL: 'border-l-slate-400',
          badgeBg: 'bg-slate-400/10 text-slate-400 border-slate-400/20',
          textClass: 'text-slate-400',
          accentBorder: 'border-slate-500/20',
          progressBarBg: 'bg-slate-400'
        };
      default:
        return {
          bg: isDark ? 'bg-zinc-900/80' : 'bg-white/80',
          borderL: 'border-l-slate-500',
          badgeBg: 'bg-slate-500/10 text-slate-505 border-slate-500/20',
          textClass: 'text-slate-500',
          accentBorder: 'border-slate-500/20',
          progressBarBg: 'bg-slate-500'
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
      zIndex: showDetails ? 100 : (isHovered ? 40 : event.zIndex)
    }"
    @pointerenter="handlePointerEnter"
    @pointerleave="handlePointerLeave"
    @focus="handleFocus"
    @blur="handleBlur"
    @click="emit('click', $event)"
    tabindex="0"
    :class="[
      themeColors.bg,
      themeColors.borderL,
      theme === 'light' 
        ? 'border-slate-200/50 border-r border-t border-b hover:bg-slate-50/95 hover:border-slate-300' 
        : 'border-zinc-800/40 border-r border-t border-b hover:bg-zinc-800/95 hover:border-zinc-700',
      isHovered ? 'shadow-md border-opacity-100 ring-1 ring-white/5' : 'shadow-none',
      isCompact ? 'px-1 py-0.5' : 'px-1.5 py-1',
      'event-block absolute border-l-[3px] rounded-r-md flex flex-col justify-between select-none cursor-pointer overflow-hidden transition-all duration-150 focus:outline-none'
    ]"
  >
    <!-- Progress Indicator for Hover Intent -->
    <div 
      v-if="isHovered && !showDetails"
      class="event-hover-progress absolute top-0 left-0 right-0 h-0.5"
      :class="themeColors.progressBarBg"
      :style="{ '--hover-delay': `${HOVER_DETAILS_DELAY_MS}ms` }"
    ></div>

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
      v-if="showDetails"
      :class="[
        theme === 'light' ? 'bg-white border-slate-300 text-slate-800 shadow-xl' : 'bg-[#181a22] border-zinc-700 text-slate-100 shadow-2xl',
        'absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 rounded-xl border p-3.5 z-[100] cursor-default text-left select-text animate-fade-in pointer-events-none'
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

<style scoped>
.event-hover-progress {
  animation: hoverProgress var(--hover-delay) linear forwards;
}

@keyframes hoverProgress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@media (prefers-reduced-motion: reduce) {
  .event-hover-progress {
    animation: none !important;
    transform: scaleX(1) !important;
  }
}
</style>

