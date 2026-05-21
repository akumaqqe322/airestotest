<script setup lang="ts">
import { Calendar } from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  availableDays: string[];
  selectedDay: string;
  theme?: 'dark' | 'light';
}>(), {
  theme: 'dark'
});

const emit = defineEmits<{
  (e: 'update:selectedDay', value: string): void;
}>();

/**
 * Custom Russian date formatter for the buttons
 * Example: "2025-04-04" -> "Пт, 4 апр"
 */
function formatDay(dateStr: string): { dayNum: string; month: string; weekday: string } {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return { dayNum: dateStr, month: '', weekday: '' };
    }
    
    const weekdays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const months = [
      'янв', 'фев', 'мар', 'апр', 'май', 'июн',
      'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
    ];
    
    return {
      dayNum: String(date.getDate()),
      month: months[date.getMonth()],
      weekday: weekdays[date.getDay()]
    };
  } catch (e) {
    return { dayNum: dateStr, month: '', weekday: '' };
  }
}
</script>

<template>
  <div 
    :class="[
      theme === 'light' ? 'bg-white border-[#e2e8f0]' : 'bg-[#14161d] border-[#2d3139]',
      'flex items-center gap-3 p-1.5 rounded-xl border overflow-x-auto scrollbar-none max-w-full transition-colors duration-200'
    ]"
  >
    <div :class="[theme === 'light' ? 'border-slate-200' : 'border-[#2d3139]', 'flex items-center gap-2 px-3 text-gray-500 border-r']">
      <Calendar class="w-4 h-4 text-amber-500" />
      <span class="text-xs font-semibold uppercase tracking-wider hidden sm:inline">Дата</span>
    </div>
    
    <div class="flex items-center gap-2">
      <button
        v-for="day in availableDays"
        :key="day"
        @click="emit('update:selectedDay', day)"
        :class="[
          'flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-all duration-150 cursor-pointer min-w-[70px]',
          selectedDay === day
            ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/10'
            : (theme === 'light' ? 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200' : 'bg-transparent text-gray-400 hover:bg-[#1b1e26] hover:text-white')
        ]"
      >
        <span class="text-[10px] uppercase font-bold tracking-wider opacity-85">
          {{ formatDay(day).weekday }}
        </span>
        <span class="text-base font-bold leading-none my-0.5">
          {{ formatDay(day).dayNum }}
        </span>
        <span class="text-[9px] font-medium opacity-80">
          {{ formatDay(day).month }}
        </span>
      </button>
    </div>
  </div>
</template>
