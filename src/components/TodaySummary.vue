<template>
  <div class="today-summary glass-effect rounded-2xl p-6 warm-shadow-lg border-2 border-[#7D5A36]/20 fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-[#4E3B2B] flex items-center gap-2">
          <span class="text-3xl">📊</span>
          Today's Overview
        </h2>
        <p class="text-sm text-[#7D5A36]/70 mt-1">{{ formattedToday }}</p>
      </div>
      <button
        v-if="hasTodayEntry"
        @click="$emit('open-entry')"
        class="px-4 py-2 bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white rounded-xl hover-lift transition-all duration-200 text-sm font-semibold warm-shadow"
      >
        Edit Entry
      </button>
    </div>

    <!-- Main Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Mood Card -->
      <div class="stat-card glass-effect p-5 rounded-xl hover-lift transition-all duration-200" :style="{ borderLeft: `4px solid ${moodColor}` }">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold uppercase tracking-wide text-[#7D5A36]/70">Mood</span>
          <span class="text-4xl">{{ moodEmoji }}</span>
        </div>
        <p class="text-2xl font-bold text-[#4E3B2B] mb-1">{{ moodLabel }}</p>
        <p class="text-xs text-[#7D5A36]/80">{{ moodDescription }}</p>
      </div>

      <!-- Habits Card -->
      <div class="stat-card glass-effect p-5 rounded-xl hover-lift transition-all duration-200" :style="{ borderLeft: '4px solid #10b981' }">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold uppercase tracking-wide text-[#7D5A36]/70">Habits</span>
          <span class="text-4xl">✅</span>
        </div>
        <div class="flex items-baseline gap-2 mb-1">
          <p class="text-2xl font-bold text-[#4E3B2B]">{{ habitsCompleted }}</p>
          <p class="text-lg text-[#7D5A36]/80">/{{ totalHabits }}</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex-1 h-2 bg-[#F0E9D2] rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
              :style="{ width: `${habitCompletionRate}%` }"
            ></div>
          </div>
          <span class="text-xs font-semibold text-green-600">{{ habitCompletionRate }}%</span>
        </div>
      </div>

      <!-- Words Card -->
      <div class="stat-card glass-effect p-5 rounded-xl hover-lift transition-all duration-200" :style="{ borderLeft: '4px solid #3b82f6' }">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold uppercase tracking-wide text-[#7D5A36]/70">Words</span>
          <span class="text-4xl">✍️</span>
        </div>
        <p class="text-2xl font-bold text-[#4E3B2B] mb-1">{{ wordCount }}</p>
        <p class="text-xs text-[#7D5A36]/80">{{ wordCountDescription }}</p>
      </div>

      <!-- Tags Card -->
      <div class="stat-card glass-effect p-5 rounded-xl hover-lift transition-all duration-200" :style="{ borderLeft: '4px solid #f59e0b' }">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold uppercase tracking-wide text-[#7D5A36]/70">Tags</span>
          <span class="text-4xl">🏷️</span>
        </div>
        <p class="text-2xl font-bold text-[#4E3B2B] mb-1">{{ tagCount }}</p>
        <div v-if="topTags.length > 0" class="flex flex-wrap gap-1 mt-2">
          <span
            v-for="tag in topTags.slice(0, 3)"
            :key="tag"
            class="text-xs px-2 py-1 bg-[#7D5A36]/15 text-[#7D5A36] rounded-full font-medium"
          >
            #{{ tag }}
          </span>
        </div>
        <p v-else class="text-xs text-[#7D5A36]/80">No tags yet</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="flex flex-wrap gap-3">
      <button
        v-if="!hasTodayEntry"
        @click="$emit('open-entry')"
        class="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white font-semibold hover-lift transition-all duration-200 warm-shadow"
      >
        <span>📝</span>
        Start Today's Entry
      </button>
      <button
        v-if="hasIncompleteHabits"
        @click="$emit('open-habits')"
        class="flex items-center gap-2 px-5 py-3 rounded-xl glass-effect border border-[#D3C9A6]/60 text-[#4E3B2B] font-semibold hover-lift transition-all duration-200"
      >
        <span>✅</span>
        Complete Habits
      </button>
      <button
        @click="$emit('view-insights')"
        class="flex items-center gap-2 px-5 py-3 rounded-xl glass-effect border border-[#D3C9A6]/60 text-[#4E3B2B] font-semibold hover-lift transition-all duration-200"
      >
        <span>📈</span>
        View Insights
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="!hasTodayEntry && !hasAnyActivity" class="mt-6 p-6 rounded-xl bg-gradient-to-r from-[#FAF3E0] to-[#F0E9D2] border-2 border-dashed border-[#D3C9A6]">
      <div class="text-center">
        <p class="text-3xl mb-3">🌅</p>
        <p class="text-lg font-semibold text-[#4E3B2B] mb-2">Start Your Day Right</p>
        <p class="text-sm text-[#7D5A36]/80 mb-4">Capture your thoughts, track your habits, and make today count.</p>
        <button
          @click="$emit('open-entry')"
          class="px-6 py-3 bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white rounded-xl font-semibold hover-lift transition-all duration-200 warm-shadow"
        >
          Create First Entry
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import type { DaySummary, Habit } from '@/store/types'

const emit = defineEmits(['open-entry', 'open-habits', 'view-insights'])
const store = useStore()

// Get today's date
const today = new Date().toISOString().split('T')[0]
const formattedToday = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
})

// Get today's summary
const todaySummary = computed<DaySummary | undefined>(() => {
  return store.state.daySummaries.find((s: DaySummary) => s.date === today)
})

const hasTodayEntry = computed(() => !!todaySummary.value)
const hasAnyActivity = computed(() => hasTodayEntry.value || habitsCompleted.value > 0)

// Mood data
const moodData = computed(() => {
  const mood = todaySummary.value?.mood || 'neutral'
  const moodMap = {
    'happy': { emoji: '😄', label: 'Happy', color: '#FFD700', description: 'Feeling great today!' },
    'excited': { emoji: '🎉', label: 'Excited', color: '#98FB98', description: 'Full of energy!' },
    'neutral': { emoji: '😐', label: 'Neutral', color: '#ADD8E6', description: 'A steady day' },
    'sad': { emoji: '😢', label: 'Sad', color: '#DDA0DD', description: 'Taking it easy' },
    'angry': { emoji: '😠', label: 'Frustrated', color: '#FF6347', description: 'Feeling challenged' }
  }
  return moodMap[mood as keyof typeof moodMap] || moodMap.neutral
})

const moodEmoji = computed(() => moodData.value.emoji)
const moodLabel = computed(() => moodData.value.label)
const moodColor = computed(() => moodData.value.color)
const moodDescription = computed(() => moodData.value.description)

// Habits data
const habits = computed<Habit[]>(() => store.state.habits || [])
const todayHabits = computed(() => {
  return habits.value.map(habit => {
    const todayStatus = habit.statuses?.find(s => s.date === today)
    return {
      ...habit,
      completed: todayStatus?.status === 'did'
    }
  })
})

const habitsCompleted = computed(() => {
  return todayHabits.value.filter(h => h.completed).length
})

const totalHabits = computed(() => habits.value.length)

const habitCompletionRate = computed(() => {
  if (totalHabits.value === 0) return 0
  return Math.round((habitsCompleted.value / totalHabits.value) * 100)
})

const hasIncompleteHabits = computed(() => {
  return totalHabits.value > 0 && habitsCompleted.value < totalHabits.value
})

// Words data
const wordCount = computed(() => {
  if (!todaySummary.value?.summary) return 0
  const text = todaySummary.value.summary.replace(/<[^>]*>/g, '').trim()
  return text.split(/\s+/).filter(word => word.length > 0).length
})

const wordCountDescription = computed(() => {
  if (wordCount.value === 0) return 'No words yet'
  if (wordCount.value < 50) return 'Just getting started'
  if (wordCount.value < 150) return 'Good progress!'
  if (wordCount.value < 300) return 'Great reflection!'
  return 'Excellent detail!'
})

// Tags data
const tagCount = computed(() => {
  return todaySummary.value?.tags?.length || 0
})

const topTags = computed(() => {
  return todaySummary.value?.tags || []
})
</script>

<style scoped>
.stat-card {
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 0.75rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.stat-card:hover::before {
  opacity: 0.05;
  background: linear-gradient(135deg, #7D5A36 0%, #6B4A2E 100%);
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fade-in 0.5s ease-out;
}
</style>
