import { ref, nextTick } from 'vue'
import { useStore } from 'vuex'
import { DaySummary } from '@/store/types'

export function useDataBackup() {
  const store = useStore()
  const isExporting = ref(false)
  const isImporting = ref(false)
  const backupProgress = ref(0)

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

  const importData = async (file: File): Promise<void> => {
    isImporting.value = true
    backupProgress.value = 0

    try {
      const text = await file.text()
      backupProgress.value = 30

      let data: any
      
      if (file.name.endsWith('.json')) {
        data = JSON.parse(text)
      } else {
        throw new Error('Only JSON files are supported for import')
      }

      backupProgress.value = 60

      // Validate data structure
      if (!data.daySummaries || !Array.isArray(data.daySummaries)) {
        throw new Error('Invalid backup file structure')
      }

      // Import data to store
      if (data.daySummaries.length > 0) {
        for (const summary of data.daySummaries) {
          await store.dispatch('updateDaySummary', summary)
        }
      }

      backupProgress.value = 80

      if (data.tasks && Array.isArray(data.tasks)) {
        for (const task of data.tasks) {
          await store.dispatch('addTask', task)
        }
      }

      if (data.habits && Array.isArray(data.habits)) {
        for (const habit of data.habits) {
          await store.dispatch('addHabit', habit)
        }
      }

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
    isExporting,
    isImporting,
    backupProgress
  }
}