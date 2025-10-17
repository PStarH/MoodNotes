import { ref, nextTick } from 'vue'
import { useStore } from 'vuex'
import { DaySummary } from '@/store/types'
import { useImportConflict, type ImportMode, type ImportConflict, type ImportStats } from './useImportConflict'

export function useDataBackup() {
  const store = useStore()
  const isExporting = ref(false)
  const isImporting = ref(false)
  const backupProgress = ref(0)
  const { analyzeImportData, resolveConflicts, mergeDaySummary } = useImportConflict()

  /**
   * Parse and analyze import file without importing
   */
  const analyzeImportFile = async (file: File): Promise<{
    data: any
    conflicts: ImportConflict[]
    stats: ImportStats
  }> => {
    const text = await file.text()

    let data: any

    if (file.name.endsWith('.json')) {
      data = JSON.parse(text)
    } else {
      throw new Error('Only JSON files are supported for import')
    }

    // Validate data structure
    if (!data.daySummaries || !Array.isArray(data.daySummaries)) {
      throw new Error('Invalid backup file structure')
    }

    // Analyze for conflicts
    const { conflicts, stats } = analyzeImportData(data)

    return { data, conflicts, stats }
  }

  const exportData = async (format: 'json' | 'csv' | 'markdown' = 'json') => {
    isExporting.value = true
    backupProgress.value = 0

    try {
      const data = {
        daySummaries: store.state.daySummaries,
        tasks: store.state.tasks,
        habits: store.state.habits,
        sparks: store.state.sparks,
        calendarEntries: store.state.calendarEntries,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      }

      backupProgress.value = 50

      let content: string
      let filename: string
      let mimeType: string

      switch (format) {
        case 'json':
          content = JSON.stringify(data, null, 2)
          filename = `moodnotes-backup-${new Date().toISOString().split('T')[0]}.json`
          mimeType = 'application/json'
          break
        
        case 'csv':
          content = convertToCSV(data.daySummaries)
          filename = `moodnotes-backup-${new Date().toISOString().split('T')[0]}.csv`
          mimeType = 'text/csv'
          break
        
        case 'markdown':
          content = convertToMarkdown(data.daySummaries)
          filename = `moodnotes-backup-${new Date().toISOString().split('T')[0]}.md`
          mimeType = 'text/markdown'
          break
        
        default:
          throw new Error('Unsupported format')
      }

      backupProgress.value = 90

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      
      URL.revokeObjectURL(url)
      backupProgress.value = 100
      
      setTimeout(() => {
        isExporting.value = false
        backupProgress.value = 0
      }, 1000)

    } catch (error) {
      console.error('Export failed:', error)
      isExporting.value = false
      backupProgress.value = 0
      throw error
    }
  }

  const importData = async (
    data: any,
    mode: ImportMode = 'merge',
    conflicts: ImportConflict[] = []
  ): Promise<void> => {
    isImporting.value = true
    backupProgress.value = 0

    try {
      backupProgress.value = 20

      // Apply resolution based on mode
      const resolvedMode = mode === 'preview' ? 'keepExisting' : mode
      const resolvedConflicts = resolveConflicts(conflicts, resolvedMode as any)

      backupProgress.value = 40

      // Import day summaries
      if (data.daySummaries && Array.isArray(data.daySummaries)) {
        for (const summary of data.daySummaries) {
          const conflict = resolvedConflicts.find(
            c => c.type === 'daySummary' && c.date === summary.date
          )

          if (conflict) {
            // Handle conflict based on resolution
            if (conflict.resolution === 'skip' || conflict.resolution === 'keep') {
              continue // Skip this item
            } else if (conflict.resolution === 'replace' && mode === 'merge') {
              // Merge intelligently
              const merged = mergeDaySummary(conflict.existing, summary)
              await store.dispatch('updateDaySummary', merged)
            } else {
              // Replace
              await store.dispatch('updateDaySummary', summary)
            }
          } else {
            // No conflict, import as new
            await store.dispatch('updateDaySummary', summary)
          }
        }
      }

      backupProgress.value = 60

      // Import tasks
      if (data.tasks && Array.isArray(data.tasks)) {
        for (const task of data.tasks) {
          const conflict = resolvedConflicts.find(
            c => c.type === 'task' && c.id === task.id
          )

          if (!conflict || conflict.resolution === 'replace') {
            await store.dispatch('addTask', task)
          }
        }
      }

      backupProgress.value = 75

      // Import habits
      if (data.habits && Array.isArray(data.habits)) {
        for (const habit of data.habits) {
          const conflict = resolvedConflicts.find(
            c => c.type === 'habit' && c.incoming.name === habit.name
          )

          if (!conflict || conflict.resolution === 'replace') {
            await store.dispatch('addHabit', habit)
          }
        }
      }

      backupProgress.value = 90

      // Import sparks (no conflict checking needed)
      if (data.sparks && Array.isArray(data.sparks)) {
        for (const spark of data.sparks) {
          await store.dispatch('addSpark', spark)
        }
      }

      backupProgress.value = 100

      setTimeout(() => {
        isImporting.value = false
        backupProgress.value = 0
      }, 1000)

    } catch (error) {
      console.error('Import failed:', error)
      isImporting.value = false
      backupProgress.value = 0
      throw error
    }
  }

  const convertToCSV = (summaries: DaySummary[]): string => {
    const headers = ['Date', 'Mood', 'Weather', 'Summary', 'Tags', 'Energy Level', 'Stress Level', 'Productivity', 'Comfort Zone Entry']
    const rows = summaries.map(summary => [
      summary.date,
      summary.mood,
      summary.weather,
      `"${summary.summary.replace(/"/g, '""')}"`,
      `"${summary.tags.join(', ')}"`,
      summary.dailyCheck?.energyLevel || '',
      summary.dailyCheck?.stressLevel || '',
      summary.dailyCheck?.productivity || '',
      `"${(summary.comfortZoneEntry || '').replace(/"/g, '""')}"`
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  const convertToMarkdown = (summaries: DaySummary[]): string => {
    let markdown = '# MoodNotes Backup\n\n'
    
    summaries.forEach(summary => {
      markdown += `## ${summary.date}\n\n`
      markdown += `**Mood:** ${summary.mood} | **Weather:** ${summary.weather}\n\n`
      
      if (summary.tags.length > 0) {
        markdown += `**Tags:** ${summary.tags.map(tag => `\`${tag}\``).join(', ')}\n\n`
      }
      
      if (summary.summary) {
        markdown += `### Summary\n${summary.summary}\n\n`
      }
      
      if (summary.dailyCheck) {
        markdown += `### Daily Check\n`
        markdown += `- Energy Level: ${summary.dailyCheck.energyLevel}/10\n`
        markdown += `- Stress Level: ${summary.dailyCheck.stressLevel}/10\n`
        markdown += `- Productivity: ${summary.dailyCheck.productivity}/10\n\n`
      }
      
      if (summary.comfortZoneEntry) {
        markdown += `### Comfort Zone Entry\n${summary.comfortZoneEntry}\n\n`
      }
      
      if (summary.customSections.length > 0) {
        summary.customSections.forEach(section => {
          markdown += `### ${section.title}\n${section.content}\n\n`
        })
      }
      
      markdown += '---\n\n'
    })

    return markdown
  }

  return {
    exportData,
    importData,
    analyzeImportFile,
    isExporting,
    isImporting,
    backupProgress
  }
}