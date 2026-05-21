<script setup lang="ts">
import { ref } from 'vue';
import { Search, Bell, LogOut, Sliders, Sun, Moon } from 'lucide-vue-next';

defineProps<{
  restaurantName?: string;
  theme: 'dark' | 'light';
}>();

const emit = defineEmits<{
  (e: 'update:theme', value: 'dark' | 'light'): void;
}>();

const searchQuery = ref('');
</script>

<template>
  <header 
    :class="[
      theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#14161d] border-[#2d3139]',
      'h-16 border-b px-6 flex items-center justify-between sticky top-0 z-50 transition-colors duration-200'
    ]"
  >
    <!-- Brand / Logo -->
    <div class="flex items-center gap-3">
      <div class="bg-amber-500 text-black px-2.5 py-1 rounded-md text-xs font-black tracking-widest animate-pulse">
        AIRESTO
      </div>
      <div :class="[theme === 'light' ? 'bg-slate-200' : 'bg-[#2d3139]', 'h-4 w-[1px]']"></div>
      <span :class="[theme === 'light' ? 'text-slate-800' : 'text-white', 'font-semibold tracking-wide text-sm md:text-base']">
        {{ restaurantName || 'Супра' }}
      </span>
    </div>

    <!-- Center Search Bar -->
    <div class="hidden md:flex items-center flex-1 max-w-md mx-6 relative">
      <Search class="absolute left-3 text-gray-500 w-4 h-4 pointer-events-none" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Поиск по имени, столу или номеру..."
        :class="[
          theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white' : 'bg-[#1b1e26] border-[#2d3139] text-gray-200 placeholder-gray-500',
          'w-full border rounded-lg pl-10 pr-4 py-2 text-xs outline-none focus:border-amber-500 transition-colors'
        ]"
      />
    </div>

    <!-- Right Controls -->
    <div class="flex items-center gap-2 md:gap-4">
      
      <!-- Theme Toggler (Bonus Task) -->
      <button 
        @click="emit('update:theme', theme === 'dark' ? 'light' : 'dark')"
        :class="[
          theme === 'light' ? 'text-slate-600 hover:text-amber-500 hover:bg-slate-100' : 'text-gray-400 hover:text-[#fbbf24] hover:bg-[#1b1e26]',
          'p-2 rounded-lg transition-all cursor-pointer'
        ]"
        title="Переключить тему оформления"
      >
        <Sun v-if="theme === 'dark'" class="w-4 h-4" />
        <Moon v-else class="w-4 h-4 text-[#fbbf24] fill-[#fbbf24]/20" />
      </button>

      <button 
        :class="[
          theme === 'light' ? 'text-slate-600 hover:text-slate-800 hover:bg-slate-100' : 'text-gray-400 hover:text-white hover:bg-[#1b1e26]',
          'relative p-2 rounded-lg transition-colors cursor-pointer'
        ]"
        aria-label="Уведомления"
      >
        <Bell class="w-4 h-4" />
        <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
      </button>

      <button 
        :class="[
          theme === 'light' ? 'text-slate-600 hover:text-slate-800 hover:bg-slate-100' : 'text-gray-400 hover:text-white hover:bg-[#1b1e26]',
          'p-2 rounded-lg transition-all flex items-center gap-2 text-xs md:text-sm font-medium border border-transparent cursor-pointer'
        ]"
        aria-label="Настройки"
      >
        <Sliders class="w-4 h-4" />
      </button>

      <button 
        :class="[
          theme === 'light' ? 'bg-slate-100 hover:bg-amber-500 hover:text-black border-slate-200 text-slate-700' : 'bg-[#1b1e26] hover:bg-amber-500 hover:text-black border-[#2d3139] text-gray-200',
          'flex items-center gap-2 hover:scale-101 border px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer'
        ]"
      >
        <span>Выйти</span>
        <LogOut class="w-3.5 h-3.5" />
      </button>
    </div>
  </header>
</template>
