<script setup lang="ts">
import { Calendar } from 'lucide-vue-next';

const props = defineProps<{
  availableDays: string[];
  selectedDay: string;
}>();

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
  <div class="flex items-center gap-3 bg-[#14161d] p-1.5 rounded-xl border border-[#2d3139] overflow-x-auto scrollbar-none max-w-full">
    <div class="flex items-center gap-2 px-3 text-gray-500 border-r border-[#2d3139]">
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
            : 'bg-transparent text-gray-400 hover:bg-[#1b1e26] hover:text-white'
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
