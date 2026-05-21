<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { BookingResponse, TableZone } from './types/booking';
import { getBookingData } from './services/bookingApi';
import { normalizeTables } from './utils/timeline';

// Components
import AppHeader from './components/AppHeader.vue';
import DateSwitcher from './components/DateSwitcher.vue';
import ZoneFilter from './components/ZoneFilter.vue';
import BookingTimeline from './components/BookingTimeline.vue';

// Lucide Icons
import { AlertCircle, Clock, Table, Calendar } from 'lucide-vue-next';

// State
const bookingData = ref<BookingResponse | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const selectedDay = ref('2025-04-04');
const selectedZone = ref<TableZone | 'Все зоны'>('Все зоны');

// A nice mock time for current timeline presentation (Vladivostok timezone indicator)
const simulatedTime = ref('14:45');

// Fetch data on mount
onMounted(async () => {
  try {
    isLoading.value = true;
    error.value = null;
    const res = await getBookingData();
    bookingData.value = res;
    
    // Auto sync states
    if (res.current_day) {
      selectedDay.value = res.current_day;
    }
  } catch (err: any) {
    error.value = err?.message || 'Не удалось загрузить данные бронирования';
  } finally {
    isLoading.value = false;
  }
});

// Calculate unique zones based on API data
const availableZones = computed((): TableZone[] => {
  if (!bookingData.value) return [];
  const zones = new Set(bookingData.value.tables.map(t => t.zone));
  return Array.from(zones) as TableZone[];
});

// Normalize and filter tables dynamically by selected zone
const filteredTables = computed(() => {
  if (!bookingData.value) return [];
  
  // Normalize raw data first
  const normalized = normalizeTables(bookingData.value.tables);
  
  if (selectedZone.value === 'Все зоны') {
    return normalized;
  }
  return normalized.filter(t => t.zone === selectedZone.value);
});

// Total counts for stats bar
const totalEventsCount = computed(() => {
  return filteredTables.value.reduce((acc, t) => acc + t.events.length, 0);
});

const reservationsCount = computed(() => {
  return filteredTables.value.reduce((acc, t) => 
    acc + t.events.filter(e => e.type === 'reservation').length, 0
  );
});

const ordersCount = computed(() => {
  return filteredTables.value.reduce((acc, t) => 
    acc + t.events.filter(e => e.type === 'order').length, 0
  );
});
</script>

<template>
  <div class="min-h-screen bg-[#0d0f11] text-[#e2e8f0] flex flex-col font-sans select-none overflow-x-hidden">
    <!-- Header -->
    <AppHeader :restaurant-name="bookingData?.restaurant?.restaurant_name" />

    <!-- Core App Workspace -->
    <main class="flex-1 flex flex-col p-4 md:p-6 gap-6 max-w-7xl mx-auto w-full min-h-0">
      
      <!-- Subheader Panel with Title & Stats -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Бронирования
            <span v-if="bookingData" class="text-xs bg-[#1b1e26] border border-[#2d3139] px-2.5 py-1 rounded-full text-gray-400 font-medium font-mono">
              {{ simulatedTime }} Asia/Vladivostok
            </span>
          </h1>
          <p class="text-xs text-gray-500 mt-1">
            Оперативная панель менеджмента залов и броней ресторана Супра
          </p>
        </div>

        <!-- Mini Stats pill -->
        <div v-if="bookingData && !isLoading" class="flex gap-2 text-xs">
          <div class="bg-[#14161d] border border-[#2d3139] px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span class="text-gray-400 font-medium">Резервы:</span>
            <span class="text-white font-bold">{{ reservationsCount }}</span>
          </div>
          <div class="bg-[#14161d] border border-[#2d3139] px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span class="text-gray-400 font-medium">Чеки:</span>
            <span class="text-white font-bold">{{ ordersCount }}</span>
          </div>
        </div>
      </div>

      <!-- Controls Row (DateSwitcher + ZoneFilter) -->
      <div v-if="bookingData && !isLoading" class="flex flex-wrap items-center gap-4 shrink-0">
        <DateSwitcher
          :available-days="bookingData.available_days"
          v-model:selected-day="selectedDay"
        />

        <ZoneFilter
          :zones="availableZones"
          v-model:selected-zone="selectedZone"
        />

        <!-- Simulated clock controls if staff needs adjustment -->
        <div class="ml-auto hidden xl:flex items-center gap-2 bg-[#14161d] p-1.5 rounded-xl border border-[#2d3139] text-xs text-gray-400">
          <Clock class="w-4 h-4 text-rose-500" />
          <span class="font-medium mr-1">Индикатор времени:</span>
          <input 
            v-model="simulatedTime" 
            type="time" 
            class="bg-[#1b1e26] text-white border border-[#2d3139] rounded px-1.5 py-0.5 outline-none font-mono text-center focus:border-rose-500 w-[70px]"
          />
        </div>
      </div>

      <!-- Loader State -->
      <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center py-20">
        <div class="relative flex items-center justify-center">
          <div class="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
        </div>
        <p class="text-xs text-gray-500 font-medium mt-4 tracking-wider uppercase animate-pulse">
          Загрузка конфигурации таймлайна...
        </p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center p-6 border border-red-500/20 bg-red-500/5 rounded-2xl max-w-md mx-auto my-12 text-center text-red-400">
        <AlertCircle class="w-10 h-10 mb-3" />
        <h3 class="text-sm font-bold tracking-wide text-white mb-1">Произошла ошибка</h3>
        <p class="text-xs text-red-400/80 mb-4">{{ error }}</p>
        <button 
          @click="window.location.reload()"
          class="bg-red-500 hover:bg-red-400 text-black font-semibold text-xs py-2 px-4 rounded-xl transition duration-150"
        >
          Повторить попытку
        </button>
      </div>

      <!-- Real Interactive Timeline View -->
      <BookingTimeline
        v-else-if="bookingData"
        :tables="filteredTables"
        :opening-time="bookingData.restaurant.opening_time"
        :closing-time="bookingData.restaurant.closing_time"
        :current-time="simulatedTime"
        :pixels-per-minute="2.2"
      />

    </main>
  </div>
</template>
