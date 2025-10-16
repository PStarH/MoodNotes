<template>
  <div class="mb-8">
    <div class="flex items-center gap-2 p-2 glass-effect rounded-xl warm-shadow overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="$emit('change', tab.id)"
        :class="[
          'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap',
          activeTab === tab.id
            ? 'bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white warm-shadow'
            : 'text-[#4E3B2B] hover:bg-[#F0E9D2]'
        ]"
        :aria-selected="activeTab === tab.id"
        role="tab"
      >
        <component v-if="tab.icon" :is="tab.icon" :size="20" />
        <span>{{ tab.label }}</span>
        <span v-if="tab.badge" class="px-2 py-0.5 text-xs rounded-full bg-white/20">
          {{ tab.badge }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Tab {
  id: string
  label: string
  icon?: any
  badge?: number | string
}

interface Props {
  tabs: Tab[]
  activeTab: string
}

defineProps<Props>()
defineEmits(['change'])
</script>
