<template>
  <div class="theme-switcher">
    <div class="flex flex-col space-y-2">
      <span class="text-xs font-medium text-[#4E3B2B]">Theme</span>
      <div class="flex flex-col space-y-1 bg-[#F0E9D2] rounded-lg p-2">
        <button
          v-for="(theme, key) in themes"
          :key="key"
          @click="setTheme(key as Theme)"
          :class="[
            'px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-start',
            currentTheme === key
              ? 'bg-[#7D5A36] text-white shadow-sm'
              : 'text-[#7D5A36] hover:bg-[#7D5A36] hover:bg-opacity-10'
          ]"
          :title="`Switch to ${theme.name} theme`"
        >
          <component :is="getThemeIcon(key as Theme)" :size="14" class="mr-1 flex-shrink-0" />
          <span class="truncate">{{ theme.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sun, Moon, Monitor } from 'lucide-vue-next'
import { useTheme, type Theme } from '@/composables/useTheme'

const { currentTheme, themes, setTheme } = useTheme()

const getThemeIcon = (theme: Theme) => {
  switch (theme) {
    case 'light':
      return Sun
    case 'dark':
      return Moon
    case 'auto':
      return Monitor
    default:
      return Monitor
  }
}
</script>

<style scoped>
.theme-switcher {
  width: 100%;
  max-width: 200px;
}

.theme-switcher button {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 28px;
}
</style>