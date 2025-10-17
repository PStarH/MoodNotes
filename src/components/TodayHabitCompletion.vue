<template>
    <div
        class="glass-effect p-6 rounded-2xl warm-shadow-lg fade-in"
        role="region"
        aria-labelledby="habit-completion-title"
    >
        <div class="flex items-start justify-between mb-4">
            <div>
                <h3 id="habit-completion-title" class="text-xl font-bold text-[#4E3B2B] flex items-center gap-2">
                    <span aria-hidden="true">✅</span>
                    Today's Habits
                </h3>
                <p class="text-sm text-[#7D5A36]/80 mt-1">Track your daily progress</p>
            </div>
            <button
                @click="$emit('manage-habits')"
                class="text-xs font-semibold text-[#7D5A36] hover:underline"
                aria-label="Manage habits"
            >
                Manage
            </button>
        </div>

        <!-- No Habits Message -->
        <div v-if="totalHabits === 0" class="text-center py-8">
            <span class="text-4xl mb-3 block" aria-hidden="true">🌱</span>
            <p class="text-[#4E3B2B] font-semibold mb-2">No habits yet</p>
            <p class="text-sm text-[#7D5A36]/80">Start building healthy routines by adding your first habit.</p>
        </div>

        <!-- Habit Stats -->
        <div v-else class="space-y-6">
            <!-- Completion Rate -->
            <div class="text-center">
                <div class="relative inline-flex items-center justify-center">
                    <svg class="transform -rotate-90" width="120" height="120">
                        <!-- Background circle -->
                        <circle
                            cx="60"
                            cy="60"
                            r="54"
                            stroke="#F0E9D2"
                            stroke-width="8"
                            fill="none"
                        />
                        <!-- Progress circle -->
                        <circle
                            cx="60"
                            cy="60"
                            r="54"
                            :stroke="progressColor"
                            stroke-width="8"
                            fill="none"
                            :stroke-dasharray="circumference"
                            :stroke-dashoffset="progressOffset"
                            stroke-linecap="round"
                            class="transition-all duration-500"
                            role="img"
                            :aria-label="`${completionRate}% completed`"
                        />
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span class="text-3xl font-bold text-[#4E3B2B]">{{ completionRate }}%</span>
                        <span class="text-xs text-[#7D5A36]/70">Complete</span>
                    </div>
                </div>
            </div>

            <!-- Breakdown Stats -->
            <div class="grid grid-cols-3 gap-3">
                <div
                    class="glass-effect p-3 rounded-xl text-center"
                    role="status"
                    aria-label="Completed habits"
                >
                    <div class="flex items-center justify-center mb-2">
                        <div class="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span class="text-2xl font-bold text-[#4E3B2B]">{{ completedCount }}</span>
                    </div>
                    <p class="text-xs text-[#7D5A36]/80">Done</p>
                </div>

                <div
                    class="glass-effect p-3 rounded-xl text-center"
                    role="status"
                    aria-label="Partially completed habits"
                >
                    <div class="flex items-center justify-center mb-2">
                        <div class="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span class="text-2xl font-bold text-[#4E3B2B]">{{ partialCount }}</span>
                    </div>
                    <p class="text-xs text-[#7D5A36]/80">Partial</p>
                </div>

                <div
                    class="glass-effect p-3 rounded-xl text-center"
                    role="status"
                    aria-label="Not completed habits"
                >
                    <div class="flex items-center justify-center mb-2">
                        <div class="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
                        <span class="text-2xl font-bold text-[#4E3B2B]">{{ notCompletedCount }}</span>
                    </div>
                    <p class="text-xs text-[#7D5A36]/80">Todo</p>
                </div>
            </div>

            <!-- Progress Message -->
            <div
                class="glass-effect px-4 py-3 rounded-xl border border-[#D3C9A6]/40"
                role="status"
                aria-live="polite"
            >
                <p class="text-sm text-[#7D5A36] text-center">
                    <span class="font-semibold">{{ progressMessage }}</span>
                </p>
            </div>

            <!-- Quick Habit List -->
            <div v-if="todayHabits.length > 0" class="space-y-2">
                <h4 class="text-sm font-semibold text-[#4E3B2B] mb-2">Quick View</h4>
                <div
                    v-for="habit in todayHabits"
                    :key="habit.id"
                    class="flex items-center justify-between px-3 py-2 glass-effect rounded-lg"
                >
                    <span class="text-sm text-[#4E3B2B]">{{ habit.name }}</span>
                    <div class="flex items-center gap-1">
                        <span
                            v-if="habit.todayStatus === 'did'"
                            class="text-green-600"
                            aria-label="Completed"
                        >✓</span>
                        <span
                            v-else-if="habit.todayStatus === 'partial'"
                            class="text-yellow-600"
                            aria-label="Partially completed"
                        >◐</span>
                        <span
                            v-else-if="habit.todayStatus === 'not'"
                            class="text-red-600"
                            aria-label="Not completed"
                        >✗</span>
                        <span
                            v-else
                            class="text-gray-400"
                            aria-label="Not set"
                        >○</span>
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
const habits = computed<Habit[]>(() => store.state.habits as Habit[])

// Get today's date string
const todayString = computed(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
})

// Calculate today's habit statuses
interface HabitWithStatus extends Habit {
    todayStatus: 'did' | 'partial' | 'not' | null
}

const todayHabits = computed<HabitWithStatus[]>(() => {
    return habits.value.map(habit => {
        const todayStatus = habit.statuses?.find((s: HabitStatus) => s.date === todayString.value)
        return {
            ...habit,
            todayStatus: todayStatus?.status || null
        }
    })
})

const totalHabits = computed(() => habits.value.length)

const completedCount = computed(() => {
    return todayHabits.value.filter(h => h.todayStatus === 'did').length
})

const partialCount = computed(() => {
    return todayHabits.value.filter(h => h.todayStatus === 'partial').length
})

const notCompletedCount = computed(() => {
    return todayHabits.value.filter(h => h.todayStatus === null).length
})

const notDoneCount = computed(() => {
    return todayHabits.value.filter(h => h.todayStatus === 'not').length
})

// Calculate completion rate (did + 0.5 * partial) / total
const completionRate = computed(() => {
    if (totalHabits.value === 0) return 0
    const score = completedCount.value + (partialCount.value * 0.5)
    return Math.round((score / totalHabits.value) * 100)
})

// Circle progress calculation
const circumference = 2 * Math.PI * 54
const progressOffset = computed(() => {
    const progress = completionRate.value / 100
    return circumference - (progress * circumference)
})

// Dynamic color based on completion rate
const progressColor = computed(() => {
    if (completionRate.value >= 80) return '#22c55e' // green
    if (completionRate.value >= 50) return '#eab308' // yellow
    return '#ef4444' // red
})

// Progress message
const progressMessage = computed(() => {
    if (totalHabits.value === 0) return ''

    if (completionRate.value === 100) {
        return '🎉 Perfect day! All habits completed!'
    } else if (completionRate.value >= 80) {
        return '🌟 Excellent progress! Keep it up!'
    } else if (completionRate.value >= 50) {
        return '💪 Good effort! You\'re halfway there!'
    } else if (completionRate.value > 0) {
        return '🌱 Every step counts! Keep going!'
    } else {
        return '⏰ Start your day right—complete a habit!'
    }
})
</script>

<style scoped>
/* Smooth transitions for progress circle */
circle {
    transition: stroke-dashoffset 0.5s ease-in-out, stroke 0.3s ease-in-out;
}
</style>
