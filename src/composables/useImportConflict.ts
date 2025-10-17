import { computed } from 'vue'
import { useStore } from 'vuex'
import type { DaySummary, Task, Habit } from '@/store/types'

export interface ImportConflict {
  type: 'daySummary' | 'task' | 'habit'
  date?: string
  id?: number
  existing: any
  incoming: any
  resolution?: 'keep' | 'replace' | 'skip'
}

export interface ImportStats {
  totalItems: number
  conflicts: number
  newItems: number
  duplicates: number
}

export type ImportMode = 'replace' | 'merge' | 'preview'

export function useImportConflict() {
  const store = useStore()

  /**
   * Detect conflicts for day summaries
   */
  const detectDaySummaryConflicts = (incoming: DaySummary[]): ImportConflict[] => {
    const conflicts: ImportConflict[] = []
    const existingSummaries = store.state.daySummaries as DaySummary[]

    for (const incomingSummary of incoming) {
      const existing = existingSummaries.find(s => s.date === incomingSummary.date)

      if (existing) {
        conflicts.push({
          type: 'daySummary',
          date: incomingSummary.date,
          existing,
          incoming: incomingSummary,
          resolution: undefined
        })
      }
    }

    return conflicts
  }

  /**
   * Detect conflicts for tasks
   */
  const detectTaskConflicts = (incoming: Task[]): ImportConflict[] => {
    const conflicts: ImportConflict[] = []
    const existingTasks = store.state.tasks as Task[]

    for (const incomingTask of incoming) {
      const existing = existingTasks.find(t =>
        t.description === incomingTask.description &&
        t.dueDate === incomingTask.dueDate
      )

      if (existing) {
        conflicts.push({
          type: 'task',
          id: existing.id,
          existing,
          incoming: incomingTask,
          resolution: undefined
        })
      }
    }

    return conflicts
  }

  /**
   * Detect conflicts for habits
   */
  const detectHabitConflicts = (incoming: Habit[]): ImportConflict[] => {
    const conflicts: ImportConflict[] = []
    const existingHabits = store.state.habits as Habit[]

    for (const incomingHabit of incoming) {
      const existing = existingHabits.find(h => h.name === incomingHabit.name)

      if (existing) {
        conflicts.push({
          type: 'habit',
          id: existing.id,
          existing,
          incoming: incomingHabit,
          resolution: undefined
        })
      }
    }

    return conflicts
  }

  /**
   * Analyze import data and detect all conflicts
   */
  const analyzeImportData = (data: any): {
    conflicts: ImportConflict[]
    stats: ImportStats
  } => {
    const conflicts: ImportConflict[] = []

    // Detect day summary conflicts
    if (data.daySummaries && Array.isArray(data.daySummaries)) {
      conflicts.push(...detectDaySummaryConflicts(data.daySummaries))
    }

    // Detect task conflicts
    if (data.tasks && Array.isArray(data.tasks)) {
      conflicts.push(...detectTaskConflicts(data.tasks))
    }

    // Detect habit conflicts
    if (data.habits && Array.isArray(data.habits)) {
      conflicts.push(...detectHabitConflicts(data.habits))
    }

    // Calculate stats
    const totalItems =
      (data.daySummaries?.length || 0) +
      (data.tasks?.length || 0) +
      (data.habits?.length || 0) +
      (data.sparks?.length || 0)

    const stats: ImportStats = {
      totalItems,
      conflicts: conflicts.length,
      newItems: totalItems - conflicts.length,
      duplicates: conflicts.length
    }

    return { conflicts, stats }
  }

  /**
   * Apply resolution to conflicts based on import mode
   */
  const resolveConflicts = (
    conflicts: ImportConflict[],
    mode: 'replace' | 'merge' | 'keepExisting' | 'keepNew'
  ): ImportConflict[] => {
    return conflicts.map(conflict => {
      let resolution: 'keep' | 'replace' | 'skip'

      switch (mode) {
        case 'replace':
          resolution = 'replace'
          break
        case 'merge':
          // For merge mode, we'll combine data intelligently
          resolution = 'replace'
          break
        case 'keepExisting':
          resolution = 'keep'
          break
        case 'keepNew':
          resolution = 'replace'
          break
        default:
          resolution = 'skip'
      }

      return { ...conflict, resolution }
    })
  }

  /**
   * Merge day summary data (combine instead of replace)
   */
  const mergeDaySummary = (existing: DaySummary, incoming: DaySummary): DaySummary => {
    return {
      ...existing,
      // Merge summary content if both exist
      summary: incoming.summary || existing.summary,
      // Keep more recent mood
      mood: incoming.mood || existing.mood,
      weather: incoming.weather || existing.weather,
      // Merge habits (combine unique ones)
      habits: [...existing.habits, ...incoming.habits.filter(
        ih => !existing.habits.some(eh => eh.name === ih.name)
      )],
      // Use incoming daily check if it exists
      dailyCheck: incoming.dailyCheck || existing.dailyCheck,
      comfortZoneEntry: incoming.comfortZoneEntry || existing.comfortZoneEntry,
      // Merge custom sections
      customSections: [...existing.customSections, ...incoming.customSections.filter(
        ic => !existing.customSections.some(ec => ec.title === ic.title)
      )],
      // Merge tags (unique)
      tags: [...new Set([...existing.tags, ...incoming.tags])],
      // Merge media (unique by URL)
      media: [...existing.media, ...incoming.media.filter(
        im => !existing.media.some(em => em.url === im.url)
      )]
    }
  }

  return {
    analyzeImportData,
    resolveConflicts,
    mergeDaySummary,
    detectDaySummaryConflicts,
    detectTaskConflicts,
    detectHabitConflicts
  }
}
