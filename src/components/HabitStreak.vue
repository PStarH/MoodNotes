<template>
  <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold warm-shadow">
    <span class="text-lg">🔥</span>
    <span>{{ streak }} day{{ streak !== 1 ? 's' : '' }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  habitId: number | string
  statuses?: Array<{ date: string; status: 'did' | 'partial' | 'not' | null }>
}

const props = defineProps<Props>()

// Calculate streak from statuses
const streak = computed(() => {
  if (!props.statuses || props.statuses.length === 0) return 0

  // Sort by date descending
  const sorted = [...props.statuses].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  let currentStreak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < sorted.length; i++) {
    const statusDate = new Date(sorted[i].date)
    statusDate.setHours(0, 0, 0, 0)

    const daysDiff = Math.floor((today.getTime() - statusDate.getTime()) / (1000 * 60 * 60 * 24))

    // Only count consecutive days from today backwards
    if (daysDiff !== i) break

    // Only count 'did' status as part of streak
    if (sorted[i].status === 'did') {
      currentStreak++
    } else {
      break
    }
  }

  return currentStreak
})
</script>
