export interface Task {
  id: number
  description: string
  priority: 'Lowest' | 'Low' | 'Normal' | 'Medium' | 'High' | 'Highest'
  dueDate: string
}

export type Mood = 'happy' | 'neutral' | 'sad' | 'excited' | 'angry'

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

export interface DaySummary {
  date: string // ISO date string
  summary: string
  mood: Mood
  weather: string
  tags: string[]
  habits: {
    id: number
    name: string
    description: string
    completed: boolean
    status: 'did' | 'partial' | 'not' | null
  }[]
  dailyCheck: DailyCheck
  comfortZoneEntry: string
  customSections: CustomSection[]
  media: MediaItem[]
}

