<template>
  <div class="habit-trend-insights glass-effect rounded-2xl p-6 warm-shadow-lg fade-in">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-[#4E3B2B] flex items-center gap-2">
          <span class="text-3xl">📈</span>
          Habit Insights
        </h2>
        <p class="text-sm text-[#7D5A36]/70 mt-1">Track your progress and build better routines</p>
      </div>
      <button
        @click="$emit('manage-habits')"
        class="px-4 py-2 bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white rounded-xl hover-lift transition-all duration-200 text-sm font-semibold warm-shadow"
      >
        Manage Habits
      </button>
    </div>

    <!-- No Habits State -->
    <div v-if="habits.length === 0" class="text-center py-12 px-6 rounded-xl bg-gradient-to-br from-[#FAF3E0] to-[#F0E9D2] border-2 border-dashed border-[#D3C9A6]">
      <p class="text-5xl mb-4">🎯</p>
      <p class="text-xl font-bold text-[#4E3B2B] mb-2">Start Building Better Habits</p>
      <p class="text-sm text-[#7D5A36] mb-4 max-w-md mx-auto">
        Track your daily routines, build consistency, and watch your progress grow over time. Small steps lead to big changes!
      </p>
      <button
        @click="$emit('manage-habits')"
        class="px-6 py-3 bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white rounded-xl font-semibold hover-lift transition-all duration-200 warm-shadow-strong inline-flex items-center gap-2"
      >
        <span>➕</span>
        Add Your First Habit
      </button>
    </div>

    <!-- Insights Grid -->
    <div v-else>
      <!-- Overview Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <!-- Total Habits -->
        <div class="stat-card glass-effect p-5 rounded-xl hover-lift transition-all duration-200 warm-shadow-card" style="border-left: 4px solid #10b981">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wide text-[#7D5A36]">Active Habits</span>
            <span class="text-3xl">🎯</span>
          </div>
          <p class="text-3xl font-bold text-[#4E3B2B] mb-1">{{ habits.length }}</p>
          <p class="text-xs text-[#7D5A36]">{{ completedTodayCount }} completed today</p>
        </div>

        <!-- Average Completion Rate -->
        <div class="stat-card glass-effect p-5 rounded-xl hover-lift transition-all duration-200 warm-shadow-card" style="border-left: 4px solid #3b82f6">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wide text-[#7D5A36]">This Week</span>
            <span class="text-3xl">📊</span>
          </div>
          <p class="text-3xl font-bold text-[#4E3B2B] mb-1">{{ weeklyCompletionRate }}%</p>
          <div class="flex items-center gap-2">
            <div class="flex-1 h-2 bg-[#F0E9D2] rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                :style="{ width: `${weeklyCompletionRate}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Best Streak -->
        <div class="stat-card glass-effect p-5 rounded-xl hover-lift transition-all duration-200 warm-shadow-card" style="border-left: 4px solid #f59e0b">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wide text-[#7D5A36]">Best Streak</span>
            <span class="text-3xl">🔥</span>
          </div>
          <p class="text-3xl font-bold text-[#4E3B2B] mb-1">{{ longestStreak }}</p>
          <p class="text-xs text-[#7D5A36]">{{ longestStreakHabit || 'Keep going!' }}</p>
        </div>
      </div>

      <!-- Individual Habit Insights -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-[#4E3B2B] flex items-center gap-2">
          <span>📋</span>
          Habit Performance
        </h3>

        <div
          v-for="(habit, index) in habitsWithStats"
          :key="habit.id"
          class="habit-card glass-effect p-5 rounded-xl hover-lift transition-all duration-300 warm-shadow-card"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h4 class="text-lg font-semibold text-[#4E3B2B] mb-1">{{ habit.name }}</h4>
              <p v-if="habit.description" class="text-sm text-[#7D5A36]">{{ habit.description }}</p>
            </div>
            <div class="text-right">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-3xl">🔥</span>
                <div>
                  <p class="text-2xl font-bold text-[#4E3B2B]">{{ habit.currentStreak }}</p>
                  <p class="text-xs text-[#7D5A36]">current streak</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div class="text-center p-3 bg-[#F0E9D2] rounded-lg transition-all duration-200 hover:bg-[#E5DCC7]">
              <p class="text-sm text-[#7D5A36] mb-1 font-medium">This Week</p>
              <p class="text-xl font-bold text-[#4E3B2B]">{{ habit.weeklyRate }}%</p>
            </div>
            <div class="text-center p-3 bg-[#F0E9D2] rounded-lg transition-all duration-200 hover:bg-[#E5DCC7]">
              <p class="text-sm text-[#7D5A36] mb-1 font-medium">This Month</p>
              <p class="text-xl font-bold text-[#4E3B2B]">{{ habit.monthlyRate }}%</p>
            </div>
            <div class="text-center p-3 bg-[#F0E9D2] rounded-lg transition-all duration-200 hover:bg-[#E5DCC7]">
              <p class="text-sm text-[#7D5A36] mb-1 font-medium">Best Streak</p>
              <p class="text-xl font-bold text-[#4E3B2B]">{{ habit.longestStreak }}</p>
            </div>
            <div class="text-center p-3 bg-[#F0E9D2] rounded-lg transition-all duration-200 hover:bg-[#E5DCC7]">
              <p class="text-sm text-[#7D5A36] mb-1 font-medium">Total Days</p>
              <p class="text-xl font-bold text-[#4E3B2B]">{{ habit.totalCompletions }}</p>
            </div>
          </div>

          <!-- Weekly Trend Visualization -->
          <div class="mb-3">
            <p class="text-xs font-semibold text-[#7D5A36] uppercase tracking-wide mb-2">Last 7 Days</p>
            <div class="flex items-center gap-2">
              <div
                v-for="(day, index) in habit.last7Days"
                :key="index"
                class="flex-1 h-10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                :class="getDayStatusClass(day)"
                :title="day.label"
              >
                <span v-if="day.status === 'did'" class="text-white text-lg">✓</span>
                <span v-else-if="day.status === 'partial'" class="text-white text-lg">○</span>
                <span v-else-if="day.status === 'not'" class="text-white text-lg">✕</span>
              </div>
            </div>
            <div class="flex justify-between mt-1">
              <span class="text-xs text-[#7D5A36]/70">7 days ago</span>
              <span class="text-xs text-[#7D5A36]/70">Today</span>
            </div>
          </div>

          <!-- Completion Rate Bar -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-[#7D5A36] uppercase tracking-wide">All-Time Rate</span>
              <span class="text-sm font-semibold text-[#4E3B2B]">{{ habit.allTimeRate }}%</span>
            </div>
            <div class="h-3 bg-[#F0E9D2] rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                :style="{ width: `${habit.allTimeRate}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import type { Habit, HabitStatus } from '@/store/types'

const emit = defineEmits(['manage-habits'])
const store = useStore()

const habits = computed<Habit[]>(() => store.state.habits || [])
// Get today's date - reactive to handle date changes
const today = computed(() => new Date().toISOString().split('T')[0])

// Helper: Get date X days ago
const getDateXDaysAgo = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

// Helper: Calculate completion rate for a period
const calculateCompletionRate = (statuses: HabitStatus[] | undefined, startDate: string, endDate: string): number => {
  if (!statuses || statuses.length === 0) return 0

  const start = new Date(startDate)
  const end = new Date(endDate)
  const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

  const completedDays = statuses.filter(s => {
    const statusDate = new Date(s.date)
    return s.status === 'did' && statusDate >= start && statusDate <= end
  }).length

  return Math.round((completedDays / totalDays) * 100)
}

// Helper: Calculate current streak
const calculateCurrentStreak = (statuses: HabitStatus[] | undefined): number => {
  if (!statuses || statuses.length === 0) return 0

  const sortedStatuses = [...statuses].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  let streak = 0

  for (let i = 0; i < sortedStatuses.length; i++) {
    const statusDate = new Date(sortedStatuses[i].date)
    statusDate.setHours(0, 0, 0, 0)

    const diffDays = Math.floor((todayStart.getTime() - statusDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays !== i) break

    if (sortedStatuses[i].status === 'did') {
      streak++
    } else {
      break
    }
  }

  return streak
}

// Helper: Calculate longest streak
const calculateLongestStreak = (statuses: HabitStatus[] | undefined): number => {
  if (!statuses || statuses.length === 0) return 0

  const sortedStatuses = [...statuses]
    .filter(s => s.status === 'did')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  let longestStreak = 0
  let currentStreak = 0
  let lastDate: Date | null = null

  for (const status of sortedStatuses) {
    const statusDate = new Date(status.date)

    if (lastDate) {
      const daysDiff = Math.floor((statusDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === 1) {
        currentStreak++
      } else {
        longestStreak = Math.max(longestStreak, currentStreak)
        currentStreak = 1
      }
    } else {
      currentStreak = 1
    }

    lastDate = statusDate
  }

  return Math.max(longestStreak, currentStreak)
}

// Computed: Habits with detailed statistics
const habitsWithStats = computed(() => {
  return habits.value.map(habit => {
    const todayStatus = habit.statuses?.find(s => s.date === today.value)
    const weekStart = getDateXDaysAgo(6)
    const monthStart = getDateXDaysAgo(29)

    // Get last 7 days status
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = getDateXDaysAgo(6 - i)
      const status = habit.statuses?.find(s => s.date === date)
      return {
        date,
        status: status?.status || null,
        label: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      }
    })

    return {
      ...habit,
      completedToday: todayStatus?.status === 'did',
      currentStreak: calculateCurrentStreak(habit.statuses),
      longestStreak: calculateLongestStreak(habit.statuses),
      weeklyRate: calculateCompletionRate(habit.statuses, weekStart, today.value),
      monthlyRate: calculateCompletionRate(habit.statuses, monthStart, today.value),
      allTimeRate: habit.statuses && habit.statuses.length > 0
        ? Math.round((habit.statuses.filter(s => s.status === 'did').length / habit.statuses.length) * 100)
        : 0,
      totalCompletions: habit.statuses?.filter(s => s.status === 'did').length || 0,
      last7Days
    }
  })
})

// Computed: Completed today count
const completedTodayCount = computed(() => {
  return habitsWithStats.value.filter(h => h.completedToday).length
})

// Computed: Weekly completion rate (overall)
const weeklyCompletionRate = computed(() => {
  if (habits.value.length === 0) return 0
  const totalRate = habitsWithStats.value.reduce((sum, h) => sum + h.weeklyRate, 0)
  return Math.round(totalRate / habits.value.length)
})

// Computed: Longest streak across all habits
const longestStreak = computed(() => {
  if (habitsWithStats.value.length === 0) return 0
  return Math.max(...habitsWithStats.value.map(h => h.longestStreak))
})

// Computed: Habit with longest streak
const longestStreakHabit = computed(() => {
  if (habitsWithStats.value.length === 0) return null
  const habit = habitsWithStats.value.reduce((max, h) =>
    h.longestStreak > max.longestStreak ? h : max
  )
  return habit.name
})

// Helper: Get CSS class for day status
const getDayStatusClass = (day: any) => {
  if (day.status === 'did') return 'bg-green-500'
  if (day.status === 'partial') return 'bg-yellow-500'
  if (day.status === 'not') return 'bg-red-500'
  return 'bg-gray-300'
}
</script>

<style scoped>
.stat-card {
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.warm-shadow-card {
  box-shadow: 0 2px 8px rgba(125, 90, 54, 0.1);
}

.warm-shadow-strong {
  box-shadow: 0 4px 12px rgba(125, 90, 54, 0.2);
}

.habit-card {
  animation: slide-up 0.3s ease-out;
  animation-fill-mode: both;
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

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
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
