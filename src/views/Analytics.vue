<template>
  <div class="h-screen flex gradient-bg">
    <!-- Sidebar -->
    <div class="w-64 sidebar-gradient p-6 warm-shadow-lg flex flex-col h-full">
      <div class="mb-8 flex items-center">
        <img src="/icon1.png" alt="MoodsNote" class="w-10 h-10 mr-3" />
        <h2 class="text-[#4E3B2B] text-2xl font-bold tracking-wide">MoodsNote</h2>
      </div>
      <nav class="flex-1">
        <ul class="list-none p-0 space-y-2">
          <li class="mb-3">
            <router-link
              to="/"
              class="text-[#4E3B2B] no-underline flex items-center p-3 rounded-lg hover-lift transition-all duration-200 hover:bg-[#FAF3E0]"
              :class="{ 'bg-[#FAF3E0]': $route.path === '/' }"
            >
              <List class="mr-3" :size="20" />
              <span class="font-medium">{{ $t('nav.home') }}</span>
            </router-link>
          </li>
          <li class="mb-3">
            <router-link
              to="/analytics"
              class="text-[#4E3B2B] no-underline flex items-center p-3 rounded-lg hover-lift transition-all duration-200 hover:bg-[#FAF3E0]"
              :class="{ 'bg-[#FAF3E0]': $route.path === '/analytics' }"
            >
              <BarChart3 class="mr-3" :size="20" />
              <span class="font-medium">{{ $t('nav.analytics') }}</span>
            </router-link>
          </li>
          <li class="mb-3">
            <button
              type="button"
              @click="openCalendar"
              class="w-full text-left text-[#4E3B2B] no-underline flex items-center p-3 rounded-lg hover-lift transition-all duration-200 hover:bg-[#FAF3E0] bg-transparent border-0 cursor-pointer"
            >
              <Calendar class="mr-3" :size="20" />
              <span class="font-medium">{{ $t('nav.calendar') }}</span>
            </button>
          </li>
          <li class="mb-3">
            <button
              type="button"
              @click="openHabits"
              class="w-full text-left text-[#4E3B2B] no-underline flex items-center p-3 rounded-lg hover-lift transition-all duration-200 hover:bg-[#FAF3E0] bg-transparent border-0 cursor-pointer"
            >
              <BookOpen class="mr-3" :size="20" />
              <span class="font-medium">{{ $t('nav.habits') }}</span>
            </button>
          </li>
          <li class="mb-3">
            <button
              type="button"
              @click="isSearchPanelOpen = true"
              class="w-full text-left text-[#4E3B2B] no-underline flex items-center p-3 rounded-lg hover-lift transition-all duration-200 hover:bg-[#FAF3E0] bg-transparent border-0 cursor-pointer"
            >
              <Search class="mr-3" :size="20" />
              <span class="font-medium">{{ $t('nav.search') }}</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              @click="isBackupPanelOpen = true"
              class="w-full text-left text-[#4E3B2B] no-underline flex items-center p-3 rounded-lg hover-lift transition-all duration-200 hover:bg-[#FAF3E0] bg-transparent border-0 cursor-pointer"
            >
              <Download class="mr-3" :size="20" />
              <span class="font-medium">{{ $t('nav.backup') }}</span>
            </button>
          </li>
        </ul>
      </nav>

      <!-- Settings Link -->
      <div class="mt-4 pt-4 border-t border-[#C5B891]">
        <router-link
          to="/settings"
          class="text-[#4E3B2B] no-underline flex items-center p-3 rounded-lg hover-lift transition-all duration-200 hover:bg-[#FAF3E0]"
          :class="{ 'bg-[#FAF3E0]': $route.path === '/settings' }"
        >
          <Settings class="mr-3" :size="20" />
          <span class="font-medium">{{ $t('nav.settings') }}</span>
        </router-link>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 p-6 overflow-y-auto custom-scrollbar">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-[#4E3B2B] flex items-center">
          <span class="mr-3 text-4xl">📊</span>
          {{ $t('analytics.title') }}
        </h1>
        <p class="text-[#7D5A36] mt-2">
          {{ $t('analytics.subtitle') }}
        </p>
      </div>

      <!-- Stats Summary Cards -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div class="glass-effect p-6 rounded-2xl warm-shadow-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-[#7D5A36]/80 uppercase tracking-wide">{{ $t('analytics.totalEntries') }}</span>
            <BookOpen class="text-[#7D5A36]" :size="20" />
          </div>
          <p class="text-3xl font-bold text-[#4E3B2B]">{{ totalEntries }}</p>
          <p class="text-xs text-[#7D5A36]/70 mt-1">{{ entriesThisMonth }} {{ $t('analytics.entriesThisMonth') }}</p>
        </div>

        <div class="glass-effect p-6 rounded-2xl warm-shadow-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-[#7D5A36]/80 uppercase tracking-wide">{{ $t('analytics.currentStreak') }}</span>
            <TrendingUp class="text-[#7D5A36]" :size="20" />
          </div>
          <p class="text-3xl font-bold text-[#4E3B2B]">{{ currentStreak }}</p>
          <p class="text-xs text-[#7D5A36]/70 mt-1">{{ $t('analytics.daysInARow') }}</p>
        </div>

        <div class="glass-effect p-6 rounded-2xl warm-shadow-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-[#7D5A36]/80 uppercase tracking-wide">{{ $t('analytics.avgEnergy') }}</span>
            <Zap class="text-[#7D5A36]" :size="20" />
          </div>
          <p class="text-3xl font-bold text-[#4E3B2B]">{{ averageEnergy }}/10</p>
          <p class="text-xs text-[#7D5A36]/70 mt-1">{{ $t('analytics.last30Days') }}</p>
        </div>

        <div class="glass-effect p-6 rounded-2xl warm-shadow-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-[#7D5A36]/80 uppercase tracking-wide">{{ $t('analytics.activeHabits') }}</span>
            <Target class="text-[#7D5A36]" :size="20" />
          </div>
          <p class="text-3xl font-bold text-[#4E3B2B]">{{ activeHabits }}</p>
          <p class="text-xs text-[#7D5A36]/70 mt-1">{{ $t('analytics.trackingNow') }}</p>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="space-y-6">
        <!-- Mood & Word Count Charts -->
        <div class="grid gap-6 lg:grid-cols-2">
          <MoodTrendChart />
          <WordCountChart />
        </div>

        <!-- Energy & Stress Chart -->
        <div>
          <EnergyStressChart />
        </div>

        <!-- Habit Trend Insights -->
        <div>
          <HabitTrendInsights @manage-habits="navigateToHabits" />
        </div>
      </div>
    </div>

    <!-- Search Panel -->
    <div
      v-if="isSearchPanelOpen"
      class="fixed inset-0 modal-backdrop flex items-start justify-center z-50 overflow-y-auto py-8"
      role="presentation"
    >
      <div class="w-full mx-4" style="max-width: min(1200px, 95vw);">
        <SearchPanel @close="isSearchPanelOpen = false" @select-entry="handleSelectEntry" />
      </div>
    </div>

    <!-- Backup Panel -->
    <div
      v-if="isBackupPanelOpen"
      class="fixed inset-0 modal-backdrop flex items-start justify-center z-50 overflow-y-auto py-8"
      role="presentation"
    >
      <div class="w-full mx-4" style="max-width: min(900px, 95vw);">
        <BackupPanel @close="isBackupPanelOpen = false" />
      </div>
    </div>

    <!-- Detailed Calendar Popup -->
    <div v-if="isDetailedCalendarOpen"
        class="fixed inset-0 modal-backdrop flex items-start justify-center z-50 overflow-y-auto py-8"
        role="presentation"
        @click.self="isDetailedCalendarOpen = false">
        <div
            ref="detailedCalendarRef"
            class="glass-effect rounded-2xl warm-shadow-lg p-6 w-full max-w-4xl fade-in relative"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detailed-calendar-title">
            <div class="flex justify-between items-center mb-6">
                <h2 id="detailed-calendar-title" class="text-xl font-bold text-[#4E3B2B]">{{ $t('calendar.title') }}</h2>
                <button id="detailed-calendar-close" type="button" @click="isDetailedCalendarOpen = false" class="text-[#7D5A36] hover:text-opacity-80" :aria-label="$t('calendar.close')">
                    <X :size="24" aria-hidden="true" />
                </button>
            </div>
            <div class="flex justify-between items-center mb-4">
                <button type="button" @click="prevMonth" class="bg-transparent border-0 cursor-pointer p-2 hover:bg-[#7D5A36]/10 rounded-lg transition-colors">
                    <ChevronLeft :size="24" class="text-[#7D5A36]" />
                </button>
                <span class="font-bold text-xl text-[#4E3B2B]">
                    {{ currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }) }}
                </span>
                <button type="button" @click="nextMonth" class="bg-transparent border-0 cursor-pointer p-2 hover:bg-[#7D5A36]/10 rounded-lg transition-colors">
                    <ChevronRight :size="24" class="text-[#7D5A36]" />
                </button>
            </div>
            <div class="grid grid-cols-7 gap-3">
                <div v-for="day in weekDays" :key="day"
                    class="text-center font-bold text-[#7D5A36]/80 text-sm">
                    {{ day }}
                </div>
                <template v-for="(day, index) in calendarDays" :key="index">
                    <div v-if="day.type === 'day'" class="calendar-day"
                        :class="{ 'last-year-anniversary': day.isLastYearAnniversary }"
                        :style="{ backgroundColor: day.emotion.color || '#FFFFFF' }"
                        @click="handleDayClick(day.date)"
                        tabindex="0"
                        role="button">
                        <div v-if="day.isLastYearAnniversary" class="anniversary-badge">🕰️</div>
                        <div v-if="hasSummary(day.date)" class="emotion-icon">{{ day.emotion.emoji || '⬜️' }}</div>
                        <span>{{ day.day }}</span>
                        <div v-if="hasTasks(day.date)" class="task-indicator"></div>
                        <div v-if="hasSummary(day.date)" class="summary-indicator"></div>
                    </div>
                    <div v-else class="calendar-day empty"></div>
                </template>
            </div>
        </div>
    </div>

    <!-- Habits Popup -->
    <div v-if="isHabitPopupOpen"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        role="presentation"
        @click.self="isHabitPopupOpen = false">
        <div class="bg-[#FAF3E0] max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="habit-popup-title">
            <div class="flex justify-between items-center mb-4">
                <h2 id="habit-popup-title" class="text-xl font-bold text-[#4E3B2B]">{{ $t('nav.habits') }}</h2>
                <button id="habit-popup-close" type="button" @click="isHabitPopupOpen = false" class="text-[#7D5A36] hover:text-opacity-80" aria-label="Close habits popup">
                    <X :size="24" />
                </button>
            </div>

            <div class="mb-6">
                <h3 class="text-lg font-semibold text-[#4E3B2B] mb-4">{{ $t('habit.myHabits') }}</h3>
                <div class="space-y-4">
                    <div v-for="(habit, index) in habits" :key="index"
                        class="bg-[#F0E9D2] p-4 rounded-lg shadow-md">
                        <div class="flex justify-between items-center">
                            <span class="text-lg font-medium text-[#4E3B2B]">{{ habit.name }}</span>
                            <button type="button" @click="editHabit(habit)" class="text-[#7D5A36] hover:text-opacity-80">
                                <Edit2 :size="20" />
                            </button>
                        </div>
                        <p class="text-[#7D5A36] mt-2">{{ habit.description }}</p>
                    </div>
                </div>
                <button type="button" @click="openHabitModal"
                    class="mt-4 bg-[#7D5A36] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors flex items-center">
                    <Plus :size="20" class="mr-2" />
                    {{ $t('habit.addHabit') }}
                </button>
            </div>

            <div>
                <h3 class="text-lg font-semibold text-[#4E3B2B] mb-4">{{ $t('habit.habitTracking') }}</h3>
                <div class="overflow-x-auto">
                    <table class="w-full bg-[#F0E9D2] rounded-lg shadow-md">
                        <thead>
                            <tr>
                                <th class="p-3 text-left text-[#4E3B2B]">Habit</th>
                                <th v-for="day in 10" :key="day" class="p-3 text-center text-[#4E3B2B] w-16">
                                    {{ formatDateShort(getDateXDaysAgo(day - 1)) }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(habit, index) in habits" :key="index" class="border-t border-[#D3C9A6]">
                                <td class="p-3 text-[#4E3B2B]">
                                    <div class="flex items-center gap-2">
                                        <span>{{ habit.name }}</span>
                                        <HabitStreak v-if="habit.statuses" :habitId="habit.id" :statuses="habit.statuses" />
                                    </div>
                                </td>
                                <td v-for="day in 10" :key="day" class="p-3 text-center">
                                    <div class="w-6 h-6 rounded-full mx-auto cursor-pointer"
                                        :class="getHabitStatusClass(habit, getDateXDaysAgo(day - 1))"
                                        @click="cycleHabitStatus(habit, getDateXDaysAgo(day - 1))"></div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Add/Edit Habit Modal -->
    <div v-if="isHabitModalOpen" class="fixed inset-0 modal-backdrop flex items-center justify-center z-50" role="presentation">
        <div class="glass-effect p-6 rounded-2xl w-full max-w-md warm-shadow-lg bounce-in"
            role="dialog"
            aria-modal="true">
            <h2 class="text-2xl font-bold text-[#4E3B2B] mb-4">{{ editingHabit ? $t('habit.editHabit') : $t('habit.addHabit') }}</h2>
            <form @submit.prevent="saveHabit">
                <div class="mb-4">
                    <label for="habitName" class="block text-[#4E3B2B] mb-2 font-semibold">{{ $t('habit.habitName') }}</label>
                    <input id="habitName" v-model="currentHabit.name" type="text"
                        class="w-full px-4 py-3 glass-effect text-[#4E3B2B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7D5A36] transition-all"
                        required>
                </div>
                <div class="mb-6">
                    <label for="habitDescription" class="block text-[#4E3B2B] mb-2 font-semibold">{{ $t('habit.habitDescription') }}</label>
                    <textarea id="habitDescription" v-model="currentHabit.description"
                        class="w-full px-4 py-3 glass-effect text-[#4E3B2B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7D5A36] transition-all"
                        rows="3"></textarea>
                </div>
                <div class="flex justify-end space-x-3">
                    <button type="button" @click="isHabitModalOpen = false"
                        class="px-6 py-3 bg-[#D3C9A6]/30 text-[#4E3B2B] rounded-xl hover:bg-[#D3C9A6]/50 transition-all font-semibold">
                        {{ $t('common.cancel') }}
                    </button>
                    <button type="submit"
                        class="px-6 py-3 bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white rounded-xl hover-lift transition-all warm-shadow font-semibold">
                        {{ $t('common.save') }}
                    </button>
                </div>
            </form>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import {
  List,
  BarChart3,
  Calendar,
  Search,
  Download,
  BookOpen,
  TrendingUp,
  Zap,
  Target,
  ChevronLeft,
  ChevronRight,
  X,
  Edit2,
  Plus,
  Settings
} from 'lucide-vue-next'

// Lazy load heavy chart components for better performance
import { defineAsyncComponent } from 'vue'
const MoodTrendChart = defineAsyncComponent(() => import('@/components/MoodTrendChart.vue'))
const WordCountChart = defineAsyncComponent(() => import('@/components/WordCountChart.vue'))
const EnergyStressChart = defineAsyncComponent(() => import('@/components/EnergyStressChart.vue'))
const HabitTrendInsights = defineAsyncComponent(() => import('@/components/HabitTrendInsights.vue'))

// Components
import SearchPanel from '@/components/SearchPanel.vue'
import BackupPanel from '@/components/BackupPanel.vue'
import HabitStreak from '@/components/HabitStreak.vue'

const router = useRouter()
const store = useStore()
const { t } = useI18n()

// Panel states
const isSearchPanelOpen = ref(false)
const isBackupPanelOpen = ref(false)
const isDetailedCalendarOpen = ref(false)
const isHabitPopupOpen = ref(false)

// Week days for calendar
const weekDays = computed(() => [
    t('calendar.weekDays.sun'),
    t('calendar.weekDays.mon'),
    t('calendar.weekDays.tue'),
    t('calendar.weekDays.wed'),
    t('calendar.weekDays.thu'),
    t('calendar.weekDays.fri'),
    t('calendar.weekDays.sat')
])

// Calendar state and functions
const currentDate = ref(new Date())

const openCalendar = () => {
  // Reset to current month
  currentDate.value = new Date()
  isDetailedCalendarOpen.value = true
}

const openHabits = () => {
  isHabitPopupOpen.value = true
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const handleDayClick = (date?: Date) => {
  if (!date) return
  router.push({ path: '/', query: { openEntry: date.toISOString().split('T')[0] } })
}

const hasTasks = (date?: Date) => {
  if (!date) return false
  const dateString = date.toISOString().split('T')[0]
  return store.state.tasks?.some((task: any) => task.dueDate === dateString) || false
}

const hasSummary = (date?: Date) => {
  if (!date) return false
  const dateString = date.toISOString().split('T')[0]
  return daySummaries.value.some((summary: any) => summary.date === dateString)
}

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay()
}

const mapMoodToEmotion = (mood: string) => {
  switch (mood) {
    case 'happy':
      return { emoji: '😄', color: '#FFD700' }
    case 'neutral':
      return { emoji: '😐', color: '#ADD8E6' }
    case 'sad':
      return { emoji: '😔', color: '#DDA0DD' }
    case 'excited':
      return { emoji: '😊', color: '#98FB98' }
    case 'angry':
      return { emoji: '😠', color: '#FF6347' }
    default:
      return { emoji: '', color: '#FFFFFF' }
  }
}

type CalendarDayItem =
  | { type: 'empty'; day: null; date: null; emotion: any; isLastYearAnniversary: false }
  | { type: 'day'; day: number; date: Date; emotion: any; isLastYearAnniversary: boolean }

const calendarDays = computed<CalendarDayItem[]>(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)
  const days: CalendarDayItem[] = []

  // Fill empty slots
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({
      type: 'empty',
      day: null,
      date: null,
      emotion: { emoji: '', color: 'transparent' },
      isLastYearAnniversary: false
    })
  }

  // Populate days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateString = date.toISOString().split('T')[0]
    const daySummary = daySummaries.value.find((summary: any) => summary.date === dateString)

    const emotion = daySummary && daySummary.mood
      ? mapMoodToEmotion(daySummary.mood)
      : { emoji: '', color: '#FFFFFF' }

    days.push({ type: 'day', day, date, emotion, isLastYearAnniversary: false })
  }

  return days
})

// Habit functions
const editingHabit = ref<any>(null)
const currentHabit = ref<{ name: string; description: string }>({ name: '', description: '' })
const isHabitModalOpen = ref(false)

const openHabitModal = () => {
  editingHabit.value = null
  currentHabit.value = { name: '', description: '' }
  isHabitModalOpen.value = true
}

const editHabit = (habit: any) => {
  editingHabit.value = habit
  currentHabit.value = { ...habit }
  isHabitModalOpen.value = true
}

const deleteHabit = (habitId: number) => {
  if (confirm('Are you sure you want to delete this habit?')) {
    store.dispatch('deleteHabit', habitId)
  }
}

const saveHabit = () => {
  if (editingHabit.value) {
    const updatedHabit = {
      ...editingHabit.value,
      name: currentHabit.value.name,
      description: currentHabit.value.description,
    }
    store.dispatch('updateHabit', updatedHabit)
  } else {
    const newHabit = { id: Date.now(), ...currentHabit.value, statuses: [] }
    store.dispatch('addHabit', newHabit)
  }
  isHabitModalOpen.value = false
}

const getDateOffset = (offset: number) => {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return date
}

const getDateXDaysAgo = (x: number) => {
  const date = new Date()
  date.setDate(date.getDate() - x)
  return date
}

const formatDateShort = (date: Date) => {
  return date.toISOString().split('T')[0]
}

const getHabitStatusClass = (habit: any, date: Date) => {
  const dateString = date.toISOString().split('T')[0]
  const statusEntry = habit.statuses?.find((s: any) => s.date === dateString)
  const status = statusEntry?.status

  if (status === 'did') return 'bg-green-500'
  if (status === 'partial') return 'bg-yellow-500'
  if (status === 'not') return 'bg-red-500'
  return 'bg-gray-200'
}

const cycleHabitStatus = async (habit: any, date: Date) => {
  const dateString = date.toISOString().split('T')[0]
  const statusEntry = habit.statuses?.find((s: any) => s.date === dateString)
  const currentStatus = statusEntry?.status

  let newStatus: 'did' | 'partial' | 'not' | null = null

  if (!currentStatus) {
    newStatus = 'did'
  } else if (currentStatus === 'did') {
    newStatus = 'partial'
  } else if (currentStatus === 'partial') {
    newStatus = 'not'
  } else {
    newStatus = null
  }

  await store.dispatch('updateHabitStatus', {
    habitId: habit.id,
    date: dateString,
    status: newStatus
  })
}

// Computed stats
const daySummaries = computed(() => store.state.daySummaries || [])
const habits = computed(() => store.state.habits || [])

const totalEntries = computed(() => daySummaries.value.length)

const entriesThisMonth = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  return daySummaries.value.filter((summary: any) => {
    const date = new Date(summary.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  }).length
})

const currentStreak = computed(() => {
  const sortedSummaries = [...daySummaries.value].sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  for (const summary of sortedSummaries) {
    const summaryDate = new Date(summary.date)
    summaryDate.setHours(0, 0, 0, 0)

    const dayDiff = Math.floor((currentDate.getTime() - summaryDate.getTime()) / (1000 * 60 * 60 * 24))

    if (dayDiff === streak || dayDiff === streak + 1) {
      streak = dayDiff + 1
    } else {
      break
    }
  }

  return streak
})

const averageEnergy = computed(() => {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentSummaries = daySummaries.value.filter((summary: any) => {
    return new Date(summary.date) >= thirtyDaysAgo && summary.dailyCheck?.energyLevel
  })

  if (recentSummaries.length === 0) return 0

  const totalEnergy = recentSummaries.reduce(
    (sum: number, summary: any) => sum + (summary.dailyCheck?.energyLevel || 0),
    0
  )

  return (totalEnergy / recentSummaries.length).toFixed(1)
})

const activeHabits = computed(() => habits.value.length)

// Methods
const navigateToHabits = () => {
  isHabitPopupOpen.value = true
}

const handleSelectEntry = (entry: any) => {
  isSearchPanelOpen.value = false
  router.push({ path: '/', query: { openEntry: entry.date } })
}
</script>

<style scoped>
/* Calendar day styling */
.calendar-day {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60px;
    border-radius: 5px;
    color: #4E3B2B;
    transition: transform 0.2s;
    position: relative;
    cursor: pointer;
}

.calendar-day:hover {
    transform: scale(1.05);
}

.calendar-day.empty {
    background-color: transparent;
    cursor: default;
}

.emotion-icon {
    font-size: 20px;
    margin-bottom: 5px;
}

.task-indicator,
.summary-indicator {
    position: absolute;
    bottom: 2px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
}

.task-indicator {
    left: 2px;
    background-color: #4E3B2B;
}

.summary-indicator {
    right: 2px;
    background-color: #7D5A36;
}

.last-year-anniversary {
    border: 2px solid #7D5A36 !important;
    box-shadow: 0 0 12px rgba(125, 90, 54, 0.4);
    animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
    0%, 100% {
        box-shadow: 0 0 12px rgba(125, 90, 54, 0.4);
    }
    50% {
        box-shadow: 0 0 20px rgba(125, 90, 54, 0.6);
    }
}

.anniversary-badge {
    position: absolute;
    top: 2px;
    left: 2px;
    font-size: 12px;
    z-index: 10;
}

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(212, 165, 116, 0.1);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(125, 90, 54, 0.3);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(125, 90, 54, 0.5);
}
</style>
