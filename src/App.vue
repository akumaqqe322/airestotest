<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import type { BookingResponse, TableZone } from './types/booking';
import { getBookingData } from './services/bookingApi';
import { normalizeTables } from './utils/timeline';
import { getCurrentTimeInTimezone, timeToMinutes, minutesToTime } from './utils/time';

// Components
import AppHeader from './components/AppHeader.vue';
import DateSwitcher from './components/DateSwitcher.vue';
import ZoneFilter from './components/ZoneFilter.vue';
import BookingTimeline from './components/BookingTimeline.vue';

// Lucide Icons
import { AlertCircle, Clock } from 'lucide-vue-next';

// State
const bookingData = ref<BookingResponse | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const selectedDay = ref('2025-04-04');
const selectedZones = ref<TableZone[]>([]);

// Selection bonus state
const selectedSlot = ref<{ tableId: string; tableName: string; startMins: number; endMins: number } | null>(null);

// Dark/Light Theme bonus state
const theme = ref<'dark' | 'light'>((localStorage.getItem('airesto-theme') as 'dark' | 'light') || 'dark');

watch(theme, (newTheme) => {
  localStorage.setItem('airesto-theme', newTheme);
});

// Timezone-aware clock states
const currentRestaurantTime = ref('12:00');
const isManualOverride = ref(false);
const manualTimeInput = ref('14:45');

// Resolve actual current clock value
const effectiveCurrentTime = computed(() => {
  return isManualOverride.value ? manualTimeInput.value : currentRestaurantTime.value;
});

let timeIntervalId: any = null;

// Real clock sync routine
function syncRestaurantTime() {
  if (bookingData.value?.restaurant?.timezone) {
    currentRestaurantTime.value = getCurrentTimeInTimezone(bookingData.value.restaurant.timezone);
  }
}

// Fetch helper with API parameter injection
async function loadData(dateStr: string) {
  try {
    isLoading.value = true;
    error.value = null;
    const res = await getBookingData(dateStr);
    bookingData.value = res;
    
    // On first load, initialize selectedZones to all zones
    const zones = Array.from(new Set(res.tables.map(t => t.zone))) as TableZone[];
    if (selectedZones.value.length === 0) {
      selectedZones.value = zones;
    }
    
    syncRestaurantTime();
  } catch (err: any) {
    error.value = err?.message || 'Не удалось загрузить данные бронирования';
  } finally {
    isLoading.value = false;
  }
}

// Automatically query database/mocks on date transitions
watch(selectedDay, (newDay) => {
  // Clear any existing slot selection on date change
  selectedSlot.value = null;
  loadData(newDay);
});

onMounted(async () => {
  await loadData(selectedDay.value);
  
  // Real clock ticking updates every 30 seconds
  timeIntervalId = setInterval(() => {
    syncRestaurantTime();
  }, 30000);
});

onUnmounted(() => {
  if (timeIntervalId) {
    clearInterval(timeIntervalId);
  }
});

// Dynamic configuration of zones fetched from raw data
const availableZones = computed((): TableZone[] => {
  if (!bookingData.value) return [];
  const zones = new Set(bookingData.value.tables.map(t => t.zone));
  return Array.from(zones) as TableZone[];
});

// Normalize, parse and filter tables matching chosen zones
const filteredTables = computed(() => {
  if (!bookingData.value) return [];
  const normalized = normalizeTables(bookingData.value.tables);
  return normalized.filter(t => selectedZones.value.includes(t.zone));
});

// Subheaders Stats compute
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

// Selection time modifier input callbacks
function handleStartMinsChange(timeStr: string) {
  if (!selectedSlot.value) return;
  const startMins = timeToMinutes(timeStr);
  const closingMins = timeToMinutes(bookingData.value?.restaurant?.closing_time || '23:40');
  const endMins = Math.min(closingMins, startMins + (selectedSlot.value.endMins - selectedSlot.value.startMins));
  
  selectedSlot.value = {
    ...selectedSlot.value,
    startMins,
    endMins
  };
}

function handleEndMinsChange(timeStr: string) {
  if (!selectedSlot.value) return;
  const endMins = timeToMinutes(timeStr);
  const startMins = Math.max(
    timeToMinutes(bookingData.value?.restaurant?.opening_time || '11:00'), 
    Math.min(endMins - 15, selectedSlot.value.startMins)
  );
  
  selectedSlot.value = {
    ...selectedSlot.value,
    startMins,
    endMins
  };
}

// Create slot action callback (bonus task)
function handleCreateBooking() {
  if (!selectedSlot.value || !bookingData.value) return;
  
  const { tableId, startMins, endMins, tableName } = selectedSlot.value;
  const startStr = minutesToTime(startMins);
  const endStr = minutesToTime(endMins);
  
  // Console log parameters exactly as required by specifications
  console.log('=== CREATE BOOKING ===');
  console.log('Table ID:', tableId);
  console.log('Table Name:', tableName);
  console.log('Start Time:', startStr);
  console.log('End Time:', endStr);
  console.log('======================');
  
  // Render and append the newly created booking locally in current state
  const targetTable = bookingData.value.tables.find(t => t.id === tableId);
  if (targetTable) {
    targetTable.reservations.push({
      id: Date.now(),
      name_for_reservation: "Бронь AI Studio",
      num_people: targetTable.capacity || 4,
      phone_number: "+7 (999) 555-44-33",
      status: "Новая",
      seating_time: `${selectedDay.value}T${startStr}:00.000000+10:00`,
      end_time: `${selectedDay.value}T${endStr}:00.000000+10:00`
    });
    
    // Trigger reactivity update via reassignment
    bookingData.value = { ...bookingData.value };
  }
  
  // Dismiss selection
  selectedSlot.value = null;
}
</script>

<template>
  <div 
    :class="[
      theme === 'light' ? 'bg-[#f8fafc] text-[#1e293b]' : 'bg-[#0d0f11] text-[#e2e8f0]',
      'min-h-screen flex flex-col font-sans select-none overflow-x-hidden transition-colors duration-200 lg:pb-0',
      selectedSlot ? 'pb-28' : ''
    ]"
  >
    <!-- Header -->
    <AppHeader 
      :restaurant-name="bookingData?.restaurant?.restaurant_name" 
      v-model:theme="theme"
    />

    <!-- Core App Workspace -->
    <main class="flex-1 flex flex-col p-4 md:p-6 gap-6 max-w-7xl mx-auto w-full min-h-0">
      
      <!-- Subheader Panel with Title & Stats -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 
            :class="[
              theme === 'light' ? 'text-slate-900' : 'text-white',
              'text-2xl font-bold tracking-tight flex items-center gap-2.5 transition-colors'
            ]"
          >
            Бронирования
            <span 
              :class="[
                theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-[#14161d] border-[#2d3139] text-gray-400',
                'text-xs border px-3 py-1 rounded-full font-medium font-mono'
              ]"
            >
              {{ effectiveCurrentTime }} Asia/Vladivostok
            </span>
          </h1>
          <p class="text-xs text-gray-500 mt-1">
            Оперативная панель менеджмента залов и броней ресторана Супра
          </p>
        </div>

        <!-- Mini Stats pill -->
        <div v-if="bookingData && !isLoading" class="flex gap-2 text-xs shrink-0">
          <div 
            :class="[
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#14161d] border-[#2d3139]',
              'px-3 py-1.5 rounded-lg flex items-center gap-2 border shadow-sm transition-colors'
            ]"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]"></span>
            <span class="text-gray-500 font-medium">Резервы:</span>
            <span :class="[theme === 'light' ? 'text-slate-900' : 'text-white', 'font-black']">{{ reservationsCount }}</span>
          </div>
          <div 
            :class="[
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#14161d] border-[#2d3139]',
              'px-3 py-1.5 rounded-lg flex items-center gap-2 border shadow-sm transition-colors'
            ]"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-[#818cf8] shadow-[0_0_8px_rgba(129,140,248,0.3)]"></span>
            <span class="text-gray-500 font-medium">Чеки:</span>
            <span :class="[theme === 'light' ? 'text-slate-900' : 'text-white', 'font-black']">{{ ordersCount }}</span>
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
          v-model:selected-zones="selectedZones"
        />

        <!-- Optional developer time manual adjusters (shown nicely in corner) -->
        <div 
          :class="[
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#14161d] border-[#2d3139]',
            'ml-auto flex items-center gap-3 p-1.5 rounded-xl border text-xs text-gray-500 shadow-sm transition-colors'
          ]"
        >
          <label class="flex items-center gap-2 cursor-pointer font-medium hover:text-[#fbbf24] transition-colors">
            <input 
              v-model="isManualOverride" 
              type="checkbox" 
              class="w-3.5 h-3.5 rounded border-slate-300 bg-slate-50 text-amber-500 focus:ring-0 focus:ring-offset-0"
            />
            <span>Режим отладки</span>
          </label>
          <div v-if="isManualOverride" class="flex items-center gap-1.5 border-l border-slate-200 pl-2.5">
            <Clock class="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <input 
              v-model="manualTimeInput" 
              type="time" 
              class="bg-transparent text-slate-800 dark:text-white border border-transparent rounded px-1 py-0.5 outline-none font-mono text-center focus:border-rose-500 w-[68px]"
            />
          </div>
        </div>
      </div>

      <!-- Loader State -->
      <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center py-20">
        <div class="relative flex items-center justify-center">
          <div class="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
        </div>
        <p class="text-xs text-slate-400 font-medium mt-4 tracking-wider uppercase animate-pulse">
          Загрузка конфигурации таймлайна...
        </p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center p-6 border border-red-500/20 bg-red-500/5 rounded-2xl max-w-md mx-auto my-12 text-center text-red-400 animate-fade-in">
        <AlertCircle class="w-10 h-10 mb-3" />
        <h3 class="text-sm font-bold tracking-wide text-white mb-1">Произошла ошибка</h3>
        <p class="text-xs text-red-400/80 mb-4">{{ error }}</p>
        <button 
          @click="loadData(selectedDay)"
          class="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs py-2 px-4 rounded-xl transition duration-150"
        >
          Повторить попытку
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredTables.length === 0" class="flex-1 flex flex-col items-center justify-center py-24 border border-dashed border-[#2d3139] rounded-2xl bg-[#111315]/20">
        <AlertCircle class="w-8 h-8 text-gray-500 mb-2" />
        <span class="text-white font-bold text-sm">Не выбрано ни одной зоны</span>
        <span class="text-xs text-gray-500 mt-1">Используйте фильтр залов выше, чтобы отобразить столы таймлайна.</span>
      </div>

      <!-- Real Interactive Timeline View -->
      <BookingTimeline
        v-else
        :tables="filteredTables"
        :opening-time="bookingData.restaurant.opening_time"
        :closing-time="bookingData.restaurant.closing_time"
        :timezone="bookingData.restaurant.timezone"
        :current-time="effectiveCurrentTime"
        :pixels-per-minute="2.3"
        :theme="theme"
        :selected-slot="selectedSlot"
        @select-slot="(slot) => selectedSlot = slot"
      />

    </main>

    <!-- Floating Slot Creation Details Drawer (Bonus Tasks) -->
    <div 
      v-if="selectedSlot" 
      class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#14161d]/95 backdrop-blur-md border border-amber-500/40 rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center gap-4 z-50 max-w-lg w-[calc(100%-2rem)] animate-fade-in"
    >
      <div class="flex-1 flex flex-col">
        <div class="text-[9px] text-[#fbbf24] font-bold uppercase tracking-widest leading-none">Новый слот бронирования</div>
        <div class="text-sm font-extrabold text-white mt-1 truncate leading-none">
          {{ selectedSlot.tableName }}
        </div>
        <div class="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1.5 font-mono">
          <span>Слот:</span>
          <span class="text-white font-bold">
            {{ minutesToTime(selectedSlot.startMins) }} - {{ minutesToTime(selectedSlot.endMins) }}
          </span>
        </div>
      </div>

      <!-- Micro inline clock adjuster -->
      <div class="flex items-center gap-2 bg-[#1b1e26] border border-[#2d3139] px-2.5 py-1.5 rounded-xl text-xs font-mono shrink-0">
        <input 
          type="time" 
          :value="minutesToTime(selectedSlot.startMins)"
          @change="(e) => handleStartMinsChange((e.target as HTMLInputElement).value)"
          class="bg-transparent border-none text-white text-center w-[54px] focus:outline-none focus:ring-0 leading-none p-0 cursor-pointer"
        />
        <span class="text-gray-500">-</span>
        <input 
          type="time" 
          :value="minutesToTime(selectedSlot.endMins)"
          @change="(e) => handleEndMinsChange((e.target as HTMLInputElement).value)"
          class="bg-transparent border-none text-white text-center w-[54px] focus:outline-none focus:ring-0 leading-none p-0 cursor-pointer"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto shrink-0">
        <button 
          @click="selectedSlot = null"
          class="flex-1 sm:flex-none bg-transparent hover:bg-white/5 text-slate-400 hover:text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          Отмена
        </button>
        <button 
          @click="handleCreateBooking"
          class="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          Создать
        </button>
      </div>
    </div>

  </div>
</template>
