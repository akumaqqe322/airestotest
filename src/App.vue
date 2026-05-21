<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import type { BookingResponse, TableZone } from './types/booking';
import { getBookingData } from './services/bookingApi';
import { normalizeTables } from './utils/timeline';
import { getCurrentTimeInTimezone } from './utils/time';
import { useTimelineSelection } from './composables/useTimelineSelection';
import { TIMELINE_PIXELS_PER_MINUTE, TIMELINE_COLUMN_WIDTH } from './constants/timeline';

// Components
import AppHeader from './components/AppHeader.vue';
import DateSwitcher from './components/DateSwitcher.vue';
import ZoneFilter from './components/ZoneFilter.vue';
import BookingTimeline from './components/BookingTimeline.vue';
import ReservationEditModal from './components/ReservationEditModal.vue';

// Lucide Icons
import { AlertCircle, Clock } from 'lucide-vue-next';

// State
const bookingData = ref<BookingResponse | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const selectedDay = ref('2025-04-04');
const selectedZones = ref<TableZone[]>([]);

// Development env check
const isDev = import.meta.env.DEV;

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
  resetSelection();
  loadData(newDay);
});

// Reset selection when selected zones changes
watch(selectedZones, () => {
  resetSelection();
}, { deep: true });

// Reset selection when filtered tables length changes
watch(() => filteredTables.value.length, () => {
  resetSelection();
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

// Setup the Drag-Selection Composable values
const openingTimeRef = computed(() => bookingData.value?.restaurant?.opening_time || '11:00');
const closingTimeRef = computed(() => bookingData.value?.restaurant?.closing_time || '23:45');

const {
  isDragging,
  activeSelection,
  resetSelection,
  updateStartTime,
  updateEndTime,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  handlePointerCancel
} = useTimelineSelection(
  filteredTables,
  openingTimeRef,
  closingTimeRef,
  selectedDay,
  TIMELINE_PIXELS_PER_MINUTE,
  TIMELINE_COLUMN_WIDTH
);

// Create slot action callback and log EXACTLY one consolidated object
function handleCreateBooking() {
  if (!activeSelection.value || !bookingData.value) return;
  
  const sel = activeSelection.value;
  
  // Console log payload EXACTLY as requested by specifications
  console.log({
    tableIds: sel.tableIds,
    tableNumbers: sel.tableNumbers,
    selectedDate: sel.selectedDate,
    startTime: sel.startTime,
    endTime: sel.endTime,
    zones: sel.zones,
    hasConflicts: sel.hasConflicts
  });
  
  // Optimistic local update adding a neutral "Новая бронь" descriptor to all selected tables with stable unique IDs
  const baseId = Date.now();
  sel.tableIds.forEach((tableId, index) => {
    const targetTable = bookingData.value?.tables.find(t => t.id === tableId);
    if (targetTable) {
      targetTable.reservations.push({
        id: baseId + index,
        name_for_reservation: "Новая бронь",
        num_people: targetTable.capacity || 4,
        phone_number: "",
        status: "Новая",
        seating_time: `${sel.selectedDate}T${sel.startTime}:00.000000+10:00`,
        end_time: `${sel.selectedDate}T${sel.endTime}:00.000000+10:00`
      });
    }
  });
  
  // Refresh layout
  bookingData.value = { ...bookingData.value };
  
  // Dismiss selection
  resetSelection();
}

// Editing state
const isEditModalOpen = ref(false);
const selectedEventToEdit = ref<any>(null);
const selectedOriginalTableId = ref('');

function handleEditEvent({ event, tableId }: { event: any; tableId: string }) {
  if (event.type !== 'reservation') return; // Only reservations are editable!
  selectedEventToEdit.value = event;
  selectedOriginalTableId.value = tableId;
  isEditModalOpen.value = true;
}

function buildTimestamp(baseIso: string, newTimeStr: string, fallbackDate: string): string {
  if (baseIso && baseIso.includes('T')) {
    const parts = baseIso.split('T');
    const datePart = parts[0];
    const afterTime = parts[1];
    const tzMatch = afterTime.match(/(?:\d{2}:\d{2}:\d{2}(?:\.\d+)?)?([+-]\d{2}:\d{2}|Z)$/);
    const tzOffset = tzMatch ? tzMatch[1] : '+10:00';
    return `${datePart}T${newTimeStr}:00.000000${tzOffset}`;
  }
  return `${fallbackDate}T${newTimeStr}:00.000050+10:00`;
}

function handleSaveReservation({ originalEventId, originalTableId, updated }: { originalEventId: string | number; originalTableId: string; updated: any }) {
  if (!bookingData.value) return;

  const sourceTable = bookingData.value.tables.find(t => t.id === originalTableId);
  if (!sourceTable) return;

  const resIndex = sourceTable.reservations.findIndex(r => r.id === originalEventId);
  if (resIndex === -1) return;

  const reservation = sourceTable.reservations[resIndex];

  // Update details
  reservation.name_for_reservation = updated.name;
  reservation.phone_number = updated.phone;
  reservation.num_people = updated.numPeople;
  reservation.status = updated.status;
  reservation.seating_time = buildTimestamp(reservation.seating_time, updated.startTime, selectedDay.value);
  reservation.end_time = buildTimestamp(reservation.end_time, updated.endTime, selectedDay.value);

  // If tableId changed, relocate the reservation
  if (updated.tableId !== originalTableId) {
    sourceTable.reservations.splice(resIndex, 1);
    const targetTable = bookingData.value.tables.find(t => t.id === updated.tableId);
    if (targetTable) {
      targetTable.reservations.push(reservation);
    }
  }

  // Refresh reactive tree
  bookingData.value = { ...bookingData.value };

  // Dismiss modal
  isEditModalOpen.value = false;
  selectedEventToEdit.value = null;
}

function handleDeleteReservation({ eventId, tableId }: { eventId: string | number; tableId: string }) {
  if (!bookingData.value) return;

  const targetTable = bookingData.value.tables.find(t => t.id === tableId);
  if (!targetTable) return;

  const resIndex = targetTable.reservations.findIndex(r => r.id === eventId);
  if (resIndex !== -1) {
    targetTable.reservations.splice(resIndex, 1);
  }

  // Refresh reactive tree
  bookingData.value = { ...bookingData.value };

  // Dismiss modal
  isEditModalOpen.value = false;
  selectedEventToEdit.value = null;
}
</script>

<template>
  <div 
    :class="[
      theme === 'light' ? 'bg-[#f8fafc] text-[#1e293b]' : 'bg-[#0d0f11] text-[#e2e8f0]',
      'min-h-screen flex flex-col font-sans select-none overflow-x-hidden transition-colors duration-200 lg:pb-0',
      activeSelection ? 'pb-28' : ''
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
          v-if="isDev"
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
        :pixels-per-minute="TIMELINE_PIXELS_PER_MINUTE"
        :theme="theme"
        :selection="activeSelection"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointercancel="handlePointerCancel"
        @edit-event="handleEditEvent"
      />

    </main>

    <!-- Floating Slot Creation Details Drawer (Bonus Tasks) -->
    <div 
      v-if="activeSelection" 
      :class="[
        activeSelection.hasConflicts 
          ? 'border-rose-500 bg-[#1a1416]/95' 
          : 'border-amber-500/40 bg-[#14161d]/95',
        'fixed bottom-6 left-1/2 -translate-x-1/2 backdrop-blur-md border rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center gap-4 z-50 max-w-lg w-[calc(100%-2rem)] animate-fade-in'
      ]"
    >
      <div class="flex-1 flex flex-col min-w-0 w-full">
        <!-- Badge -->
        <div 
          :class="[
            activeSelection.hasConflicts ? 'text-rose-400' : 'text-[#fbbf24]',
            'text-[9px] font-bold uppercase tracking-widest leading-none flex items-center gap-1.5'
          ]"
        >
          <span 
            v-if="activeSelection.hasConflicts" 
            class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"
          ></span>
          <span>
            {{ activeSelection.hasConflicts ? 'Конфликт бронирования' : 'Новый слот бронирования' }}
          </span>
        </div>

        <!-- Table numbers -->
        <div class="text-sm font-extrabold text-white mt-1 truncate leading-none">
          Столы: {{ activeSelection.tableNumbers.map(n => `№${n}`).join(', ') }}
        </div>

        <!-- Meta info -->
        <div class="text-[10px] text-slate-400 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono">
          <span>Слот:</span>
          <span class="text-white font-bold">
            {{ activeSelection.startTime }} - {{ activeSelection.endTime }}
          </span>
          <span class="text-slate-500">|</span>
          <span>Залы:</span>
          <span class="text-slate-300 font-medium">
            {{ activeSelection.zones.join(', ') }}
          </span>
        </div>

        <!-- Conflict warning text -->
        <div 
          v-if="activeSelection.hasConflicts" 
          class="text-[10px] text-rose-400 mt-2 font-medium flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-md"
        >
          <AlertCircle class="w-3.5 h-3.5 shrink-0" />
          <span>Выбранное время пересекается с существующей бронью!</span>
        </div>
      </div>

      <!-- Micro inline clock adjuster -->
      <div 
        :class="[
          activeSelection.hasConflicts ? 'border-rose-500/30 bg-[#241b1d]' : 'border-[#2d3139] bg-[#1b1e26]',
          'flex items-center gap-2 border px-2.5 py-1.5 rounded-xl text-xs font-mono shrink-0'
        ]"
      >
        <input 
          type="time" 
          :value="activeSelection.startTime"
          @change="(e) => updateStartTime((e.target as HTMLInputElement).value)"
          class="bg-transparent border-none text-white text-center w-[54px] focus:outline-none focus:ring-0 leading-none p-0 cursor-pointer"
        />
        <span class="text-gray-500">-</span>
        <input 
          type="time" 
          :value="activeSelection.endTime"
          @change="(e) => updateEndTime((e.target as HTMLInputElement).value)"
          class="bg-transparent border-none text-white text-center w-[54px] focus:outline-none focus:ring-0 leading-none p-0 cursor-pointer"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto shrink-0">
        <button 
          @click="resetSelection"
          class="flex-1 sm:flex-none bg-transparent hover:bg-white/5 text-slate-400 hover:text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          Отмена
        </button>
        <button 
          @click="handleCreateBooking"
          :class="[
            activeSelection.hasConflicts 
              ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20' 
              : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20',
            'flex-1 sm:flex-none font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-lg active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer'
          ]"
        >
          {{ activeSelection.hasConflicts ? 'Создать с конфликтом' : 'Создать' }}
        </button>
      </div>
    </div>

    <!-- Reservation Edit Modal component -->
    <ReservationEditModal
      v-if="bookingData"
      :is-open="isEditModalOpen"
      :event="selectedEventToEdit"
      :table-id="selectedOriginalTableId"
      :tables="bookingData.tables"
      :opening-time="bookingData.restaurant.opening_time"
      :closing-time="bookingData.restaurant.closing_time"
      :selected-date="selectedDay"
      :theme="theme"
      @close="isEditModalOpen = false; selectedEventToEdit = null"
      @save="handleSaveReservation"
      @delete="handleDeleteReservation"
    />

  </div>
</template>
