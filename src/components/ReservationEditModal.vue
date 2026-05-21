<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { X, Calendar, Clock, User, Phone, Tag, Layers } from 'lucide-vue-next';
import type { TimelineEvent, Table, ReservationStatus } from '../types/booking';
import { timeToMinutes } from '../utils/time';

interface EditPayload {
  name: string;
  phone: string;
  numPeople: number;
  status: ReservationStatus;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  tableId: string;
}

const props = defineProps<{
  isOpen: boolean;
  event: TimelineEvent | null;
  tableId: string; // original table ID
  tables: Table[]; // all raw tables list for selection
  openingTime: string;
  closingTime: string;
  selectedDate: string;
  theme?: 'dark' | 'light';
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', payload: { originalEventId: string | number; originalTableId: string; updated: EditPayload }): void;
  (e: 'delete', payload: { eventId: string | number; tableId: string }): void;
}>();

// Form Fields
const formName = ref('');
const formPhone = ref('');
const formPeople = ref(4);
const formStatus = ref<ReservationStatus>('Новая');
const formStartTime = ref('12:00');
const formEndTime = ref('14:00');
const formTableId = ref('');

// Errors
const errors = ref<{ [key: string]: string }>({});

// Extract HH:MM helpers
function parseTimeStr(val: string): string {
  if (!val) return '12:00';
  if (val.includes('T')) {
    const match = val.match(/T(\d{2}):(\d{2})/);
    if (match) return `${match[1]}:${match[2]}`;
  }
  return val;
}

// Watch props.event to populate form
watch(() => props.event, (ev) => {
  if (ev) {
    formName.value = ev.name || ev.title || '';
    formPhone.value = ev.phoneNumber || '';
    formPeople.value = ev.numPeople || 4;
    formStatus.value = ev.status as ReservationStatus;
    formStartTime.value = parseTimeStr(ev.startTime);
    formEndTime.value = parseTimeStr(ev.endTime);
    formTableId.value = props.tableId;
    errors.value = {};
  }
}, { immediate: true });

function validateForm(): boolean {
  const errs: { [key: string]: string } = {};

  if (!formName.value.trim()) {
    errs.name = 'Имя гостя обязательно для заполнения';
  }

  if (formPeople.value < 1) {
    errs.people = 'Количество человек должно быть не менее 1';
  }

  const startMins = timeToMinutes(formStartTime.value);
  const endMins = timeToMinutes(formEndTime.value);
  const opMins = timeToMinutes(props.openingTime);
  const clMins = timeToMinutes(props.closingTime);

  if (endMins <= startMins) {
    errs.endTime = 'Время окончания должно быть позже времени начала';
  }

  if (startMins < opMins || startMins > clMins) {
    errs.startTime = `Время начала должно быть в рамках работы ресторана (${props.openingTime} - ${props.closingTime})`;
  }

  if (endMins < opMins || endMins > clMins) {
    errs.endTime = `Время окончания должно быть в рамках работы ресторана (${props.openingTime} - ${props.closingTime})`;
  }

  errors.value = errs;
  return Object.keys(errs).length === 0;
}

function handleSave() {
  if (!validateForm() || !props.event) return;

  emit('save', {
    originalEventId: props.event.originalId,
    originalTableId: props.tableId,
    updated: {
      name: formName.value.trim(),
      phone: formPhone.value.trim(),
      numPeople: formPeople.value,
      status: formStatus.value,
      startTime: formStartTime.value,
      endTime: formEndTime.value,
      tableId: formTableId.value
    }
  });
}

function handleDelete() {
  if (props.event && confirm('Вы уверены, что хотите удалить эту бронь?')) {
    emit('delete', {
      eventId: props.event.originalId,
      tableId: props.tableId
    });
  }
}
</script>

<template>
  <div 
    v-if="isOpen && event" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
  >
    <div 
      :id="`edit-modal-${event.id}`"
      :class="[
        theme === 'light' ? 'bg-white text-slate-800 border-slate-200 shadow-2xl' : 'bg-[#14161d] text-slate-100 border-[#2d3139] shadow-2xl',
        'border rounded-2xl w-full max-w-md overflow-hidden flex flex-col transition-all duration-200'
      ]"
    >
      <!-- Header -->
      <div 
        :class="[
          theme === 'light' ? 'bg-slate-50 border-b border-slate-200' : 'bg-[#1a1d26] border-b border-[#2d3139]',
          'px-5 py-4 flex items-center justify-between shrink-0'
        ]"
      >
        <div class="flex flex-col">
          <span class="text-[9px] font-bold text-amber-500 uppercase tracking-widest leading-none">Редактирование брони</span>
          <span :class="[theme === 'light' ? 'text-slate-900' : 'text-white', 'text-base font-extrabold mt-1.5 leading-none']">
            {{ event.name || 'Резерв' }}
          </span>
        </div>
        <button 
          @click="emit('close')"
          class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Scrollable Form content -->
      <div class="p-5 flex-1 overflow-y-auto space-y-4 max-h-[75vh]">
        
        <!-- Name field -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <User class="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>Имя гостя *</span>
          </label>
          <input 
            v-model="formName"
            type="text" 
            placeholder="ФИО или Имя"
            :class="[
              theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-amber-500 focus:bg-white text-slate-900' : 'bg-[#1b1e26] border-[#2d3139] focus:border-amber-500 focus:bg-[#14161d] text-white',
              'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-all'
            ]"
          />
          <span v-if="errors.name" class="text-[10px] text-rose-500 mt-0.5 leading-none">{{ errors.name }}</span>
        </div>

        <!-- Phone & Guest Quantity Row -->
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Phone class="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>Телефон</span>
            </label>
            <input 
              v-model="formPhone"
              type="text" 
              placeholder="+7 (___) ___-__-__"
              :class="[
                theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-amber-500 text-slate-900' : 'bg-[#1b1e26] border-[#2d3139] focus:border-amber-500 text-white',
                'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-all'
              ]"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User class="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>Гостей *</span>
            </label>
            <input 
              v-model.number="formPeople"
              type="number" 
              min="1"
              :class="[
                theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-amber-500 text-slate-900' : 'bg-[#1b1e26] border-[#2d3139] focus:border-amber-500 text-white',
                'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-all'
              ]"
            />
            <span v-if="errors.people" class="text-[10px] text-rose-500 mt-0.5 leading-none">{{ errors.people }}</span>
          </div>
        </div>

        <!-- Room selection & Status Row -->
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers class="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>Стол</span>
            </label>
            <select 
              v-model="formTableId"
              :class="[
                theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-amber-500 text-slate-900' : 'bg-[#1b1e26] border-[#2d3139] focus:border-amber-500 text-white',
                'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-all'
              ]"
            >
              <option 
                v-for="table in tables" 
                :key="table.id" 
                :value="table.id"
              >
                Стол №{{ table.number }} ({{ table.zone }})
              </option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag class="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>Статус</span>
            </label>
            <select 
              v-model="formStatus"
              :class="[
                theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-amber-500 text-slate-900' : 'bg-[#1b1e26] border-[#2d3139] focus:border-amber-500 text-white',
                'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-all'
              ]"
            >
              <option value="Живая очередь">Живая очередь (Blue)</option>
              <option value="Новая">Новая (Orange)</option>
              <option value="Заявка">Заявка (Yellow)</option>
              <option value="Открыт">Открыт (Green)</option>
              <option value="Закрыт">Закрыт (Slate)</option>
            </select>
          </div>
        </div>

        <!-- Duration / Start & End Time row -->
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock class="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>Начало</span>
            </label>
            <input 
              v-model="formStartTime"
              type="time" 
              :class="[
                theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-amber-500 text-slate-900' : 'bg-[#1b1e26] border-[#2d3139] focus:border-amber-500 text-white',
                'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-all font-mono'
              ]"
            />
            <span v-if="errors.startTime" class="text-[10px] text-rose-500 mt-0.5 leading-tight">{{ errors.startTime }}</span>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock class="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>Окончание</span>
            </label>
            <input 
              v-model="formEndTime"
              type="time" 
              :class="[
                theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-amber-500 text-slate-900' : 'bg-[#1b1e26] border-[#2d3139] focus:border-amber-500 text-white',
                'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-all font-mono'
              ]"
            />
            <span v-if="errors.endTime" class="text-[10px] text-rose-500 mt-0.5 leading-tight">{{ errors.endTime }}</span>
          </div>
        </div>

      </div>

      <!-- Footer Buttons -->
      <div 
        :class="[
          theme === 'light' ? 'bg-slate-50 border-t border-slate-200' : 'bg-[#1a1d26] border-t border-[#2d3139]',
          'px-5 py-4 flex items-center gap-3 shrink-0'
        ]"
      >
        <button 
          @click="handleDelete"
          class="bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer mr-auto"
        >
          Удалить
        </button>

        <button 
          @click="emit('close')"
          class="bg-transparent hover:bg-white/5 text-slate-400 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          Отмена
        </button>

        <button 
          @click="handleSave"
          class="bg-amber-500 hover:bg-amber-400 hover:scale-[1.02] text-black font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
        >
          Сохранить изменения
        </button>
      </div>
    </div>
  </div>
</template>
