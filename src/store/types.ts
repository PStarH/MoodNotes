export interface Task {
  id: number
  description: string
  priority: 'Lowest' | 'Low' | 'Normal' | 'Medium' | 'High' | 'Highest'
  dueDate: string
}

export type MoodType = 'happy' | 'neutral' | 'sad' | 'excited' | 'angry'

export interface HabitStatus {
  date: string // ISO date string
  status: 'did' | 'partial' | 'not'
}

export interface Habit {
  id: number
  name: string
  description: string
  statuses: HabitStatus[] // Track status per date
}

export interface DailyCheck {
  energyLevel: number // 1 to 10
  stressLevel: number // 1 to 10
  productivity: number // 1 to 10
}

export interface CustomSection {
  title: string
  content: string
}

export interface MediaItem {
  type: 'image' | 'video' | 'audio'
  url: string
}

interface DaySummary {
  date: string
  summary: string
  mood: string
  weather: string
  habits: Array<{ name: string; completed: boolean; status: string | null }>
  dailyCheck: {
    energyLevel: number
    stressLevel: number
    productivity: number
  }
  comfortZoneEntry: string
  customSections: Array<{ title: string; content: string }>
  tags: string[]
  media: Array<{ type: string; url: string }>
}

export interface MoodDetails {
  emoji: string
  color: string
}
