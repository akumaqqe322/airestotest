<script setup lang="ts">
import { ref } from 'vue';
import { Search, Bell, LogOut, Sliders } from 'lucide-vue-next';

defineProps<{
  restaurantName?: string;
}>();

const searchQuery = ref('');
</script>

<template>
  <header class="h-16 border-b border-[#2d3139] bg-[#14161d] px-6 flex items-center justify-between sticky top-0 z-50">
    <!-- Brand / Logo -->
    <div class="flex items-center gap-3">
      <div class="bg-amber-500 text-black px-2.5 py-1 rounded-md text-xs font-black tracking-widest">
        AIRESTO
      </div>
      <div class="h-4 w-[1px] bg-[#2d3139]"></div>
      <span class="text-white font-semibold tracking-wide text-sm md:text-base">
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
        class="w-full bg-[#1b1e26] border border-[#2d3139] rounded-lg pl-10 pr-4 py-2 text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-amber-500 transition-colors"
      />
    </div>

    <!-- Right Controls -->
    <div class="flex items-center gap-4">
      <button 
        class="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1b1e26] transition-colors"
        aria-label="Уведомления"
      >
        <Bell class="w-4 h-4" />
        <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
      </button>

      <button 
        class="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1b1e26] transition-all flex items-center gap-2 text-xs md:text-sm font-medium border border-transparent hover:border-[#2d3139]"
        aria-label="Настройки"
      >
        <Sliders class="w-4 h-4" />
      </button>

      <button 
        class="flex items-center gap-2 bg-[#1b1e26] hover:bg-amber-500 hover:text-black hover:scale-101 border border-[#2d3139] text-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150"
      >
        <span>Выйти</span>
        <LogOut class="w-3.5 h-3.5" />
      </button>
    </div>
  </header>
</template>
