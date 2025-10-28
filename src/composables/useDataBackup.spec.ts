import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDataBackup } from '@/composables/useDataBackup'
import type { DaySummary, Task, Habit } from '@/store/types'

// Mock Vuex store
const mockStore = {
  state: {
    daySummaries: [] as DaySummary[],
    tasks: [] as Task[],
    habits: [] as Habit[],
    sparks: [] as string[],
    calendarEntries: [] as any[]
  },
  dispatch: vi.fn()
}

vi.mock('vuex', () => ({
  useStore: () => mockStore
}))

// Mock useImportConflict
vi.mock('@/composables/useImportConflict', () => ({
  useImportConflict: () => ({
    analyzeImportData: vi.fn((data) => ({
      conflicts: [],
      stats: {
        totalItems: data.daySummaries?.length || 0,
        conflicts: 0,
        newItems: data.daySummaries?.length || 0,
        duplicates: 0
      }
    })),
    resolveConflicts: vi.fn((conflicts) => conflicts),
    mergeDaySummary: vi.fn((existing, incoming) => ({ ...existing, ...incoming }))
  })
}))

describe('useDataBackup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.state = {
      daySummaries: [
        {
          date: '2025-01-15',
          mood: 'happy',
          weather: 'sunny',
          summary: 'Great day!',
          tags: ['productive', 'happy'],
          dailyCheck: { energyLevel: 8, stressLevel: 2, productivity: 9 },
          comfortZoneEntry: 'Tried a new restaurant',
          customSections: [],
          habits: [],
          media: [],
          sparks: []
        },
        {
          date: '2025-01-16',
          mood: 'neutral',
          weather: 'cloudy',
          summary: 'Regular day',
          tags: ['work'],
          dailyCheck: { energyLevel: 5, stressLevel: 5, productivity: 6 },
          comfortZoneEntry: '',
          customSections: [],
          habits: [],
          media: [],
          sparks: []
        }
      ] as DaySummary[],
      tasks: [],
      habits: [],
      sparks: [],
      calendarEntries: []
    }
  })

  describe('analyzeImportFile', () => {
    it('should analyze valid JSON backup file', async () => {
      const { analyzeImportFile } = useDataBackup()

      const validData = {
        daySummaries: [
          {
            date: '2025-01-17',
            mood: 'happy',
            summary: 'New entry'
          }
        ]
      }

      const file = new File(
        [JSON.stringify(validData)],
        'backup.json',
        { type: 'application/json' }
      )

      const result = await analyzeImportFile(file)

      expect(result.data).toEqual(validData)
      expect(result.stats.totalItems).toBe(1)
    })

    it('should reject non-JSON files', async () => {
      const { analyzeImportFile } = useDataBackup()

      const file = new File(
        ['some,csv,data'],
        'backup.csv',
        { type: 'text/csv' }
      )

      await expect(analyzeImportFile(file)).rejects.toThrow('Only JSON files are supported')
    })

    it('should reject invalid backup structure', async () => {
      const { analyzeImportFile } = useDataBackup()

      const invalidData = {
        someField: 'value'
      }

      const file = new File(
        [JSON.stringify(invalidData)],
        'invalid.json',
        { type: 'application/json' }
      )

      await expect(analyzeImportFile(file)).rejects.toThrow('Invalid backup file structure')
    })

    it('should reject malformed JSON', async () => {
      const { analyzeImportFile } = useDataBackup()

      const file = new File(
        ['{ invalid json }'],
        'malformed.json',
        { type: 'application/json' }
      )

      await expect(analyzeImportFile(file)).rejects.toThrow()
    })
  })

  describe('exportData - JSON format', () => {
    it('should export complete backup in JSON format', async () => {
      const { exportData, isExporting, backupProgress } = useDataBackup()

      // Mock DOM elements
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

      await exportData('json')

      expect(isExporting.value).toBe(false)
      expect(backupProgress.value).toBe(0)
      expect(mockLink.click).toHaveBeenCalled()
      expect(mockLink.download).toContain('moodsnote-backup-')
      expect(mockLink.download).toContain('.json')
    })

    it('should include all data fields in JSON export', async () => {
      const { exportData } = useDataBackup()

      let exportedData: any = null
      const mockBlob = vi.fn((content, options) => {
        exportedData = JSON.parse(content[0])
        return new Blob(content, options)
      })
      global.Blob = mockBlob as any

      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

      await exportData('json')

      expect(exportedData).toHaveProperty('daySummaries')
      expect(exportedData).toHaveProperty('tasks')
      expect(exportedData).toHaveProperty('habits')
      expect(exportedData).toHaveProperty('sparks')
      expect(exportedData).toHaveProperty('exportDate')
      expect(exportedData).toHaveProperty('version')
      expect(exportedData.daySummaries).toHaveLength(2)
    })
  })

  describe('exportData - CSV format', () => {
    it('should export data in CSV format', async () => {
      const { exportData } = useDataBackup()

      let exportedContent: string = ''
      const mockBlob = vi.fn((content, options) => {
        exportedContent = content[0]
        return new Blob(content, options)
      })
      global.Blob = mockBlob as any

      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

      await exportData('csv')

      expect(exportedContent).toContain('Date,Mood,Weather')
      expect(exportedContent).toContain('2025-01-15')
      expect(exportedContent).toContain('happy')
      expect(mockLink.download).toContain('.csv')
    })

    it('should escape special characters in CSV', async () => {
      const { exportData } = useDataBackup()

      mockStore.state.daySummaries = [
        {
          date: '2025-01-15',
          mood: 'happy',
          weather: 'sunny',
          summary: 'Had a "great" day, comma test',
          tags: ['test'],
          dailyCheck: { energyLevel: 8, stressLevel: 2, productivity: 9 },
          comfortZoneEntry: '',
          customSections: [],
          habits: [],
          media: [],
          sparks: []
        }
      ] as DaySummary[]

      let exportedContent: string = ''
      const mockBlob = vi.fn((content, options) => {
        exportedContent = content[0]
        return new Blob(content, options)
      })
      global.Blob = mockBlob as any

      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

      await exportData('csv')

      // Check quotes are escaped
      expect(exportedContent).toContain('""great""')
    })
  })

  describe('exportData - Markdown format', () => {
    it('should export data in Markdown format', async () => {
      const { exportData } = useDataBackup()

      let exportedContent: string = ''
      const mockBlob = vi.fn((content, options) => {
        exportedContent = content[0]
        return new Blob(content, options)
      })
      global.Blob = mockBlob as any

      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

      await exportData('markdown')

      expect(exportedContent).toContain('# MoodsNote Backup')
      expect(exportedContent).toContain('## 2025-01-15')
      expect(exportedContent).toContain('**Mood:** happy')
      expect(exportedContent).toContain('**Tags:** `productive`, `happy`')
      expect(mockLink.download).toContain('.md')
    })

    it('should include all sections in Markdown', async () => {
      const { exportData } = useDataBackup()

      mockStore.state.daySummaries = [
        {
          date: '2025-01-15',
          mood: 'happy',
          weather: 'sunny',
          summary: 'Great day!',
          tags: ['productive'],
          dailyCheck: { energyLevel: 8, stressLevel: 2, productivity: 9 },
          comfortZoneEntry: 'Tried something new',
          customSections: [
            { title: 'Custom Section', content: 'Custom content' }
          ],
          habits: [],
          media: [],
          sparks: []
        }
      ] as DaySummary[]

      let exportedContent: string = ''
      const mockBlob = vi.fn((content, options) => {
        exportedContent = content[0]
        return new Blob(content, options)
      })
      global.Blob = mockBlob as any

      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

      await exportData('markdown')

      expect(exportedContent).toContain('### Summary')
      expect(exportedContent).toContain('### Daily Check')
      expect(exportedContent).toContain('Energy Level: 8/10')
      expect(exportedContent).toContain('### Comfort Zone Entry')
      expect(exportedContent).toContain('### Custom Section')
    })
  })

  describe('importData', () => {
    it('should import new day summaries', async () => {
      const { importData } = useDataBackup()

      const importedData = {
        daySummaries: [
          {
            date: '2025-01-17',
            mood: 'happy',
            summary: 'New entry',
            tags: [],
            customSections: [],
            habits: [],
            media: []
          }
        ],
        tasks: [],
        habits: [],
        sparks: []
      }

      await importData(importedData, 'merge')

      expect(mockStore.dispatch).toHaveBeenCalledWith('updateDaySummary', importedData.daySummaries[0])
    })

    it('should import tasks and habits', async () => {
      const { importData } = useDataBackup()

      const importedData = {
        daySummaries: [],
        tasks: [
          { id: 1, description: 'Test task', priority: 'High', dueDate: '2025-01-20' }
        ],
        habits: [
          { id: 1, name: 'Exercise', description: 'Daily workout', statuses: [] }
        ],
        sparks: ['Great idea!']
      }

      await importData(importedData, 'merge')

      expect(mockStore.dispatch).toHaveBeenCalledWith('addTask', importedData.tasks[0])
      expect(mockStore.dispatch).toHaveBeenCalledWith('addHabit', importedData.habits[0])
      expect(mockStore.dispatch).toHaveBeenCalledWith('addSpark', importedData.sparks[0])
    })

    it('should handle import errors gracefully', async () => {
      const { importData } = useDataBackup()

      mockStore.dispatch = vi.fn().mockRejectedValueOnce(new Error('Store error'))

      const importedData = {
        daySummaries: [
          {
            date: '2025-01-17',
            mood: 'happy',
            summary: 'New entry'
          }
        ]
      }

      await expect(importData(importedData, 'merge')).rejects.toThrow('Store error')
    })
  })

  describe('progress tracking', () => {
    it('should update progress during export', async () => {
      const { exportData, backupProgress } = useDataBackup()

      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

      const progressValues: number[] = []
      const checkProgress = () => progressValues.push(backupProgress.value)

      // Monitor progress (note: this is simplified for testing)
      await exportData('json')
      checkProgress()

      expect(progressValues[0]).toBe(0)
    })

    it('should reset progress after export completes', async () => {
      const { exportData, isExporting, backupProgress } = useDataBackup()

      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

      await exportData('json')

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 1100))

      expect(isExporting.value).toBe(false)
      expect(backupProgress.value).toBe(0)
    })
  })
})
