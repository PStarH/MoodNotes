import { createStore, StoreOptions } from 'vuex'
import localforage from 'localforage'
import {
  Task,
  Habit,
  DaySummary,
  MediaItem,
  CustomSection,
  DailyCheck,
  MoodType,
  HabitStatus
} from './types'

localforage.config({
  name: 'MoodNotes',
  storeName: 'mood_notes_store',
})

export interface State {
  daySummaries: DaySummary[]
  tasks: Task[]
  habits: Habit[]
  sparks: string[]
  calendarEntries: { date: string; content: string }[]
}


const store: StoreOptions<State> = {
  state: {
    daySummaries: [],
    tasks: [],
    habits: [],
    sparks: [],
    calendarEntries: [],
  },
  mutations: {
    // Day Summaries
    SET_DAY_SUMMARIES(state, daySummaries: DaySummary[]) {
      state.daySummaries = daySummaries
    },
    ADD_DAY_SUMMARY(state, daySummary: DaySummary) {
      state.daySummaries.push(daySummary)
    },
    UPDATE_DAY_SUMMARY(state, updatedSummary: DaySummary) {
      const index = state.daySummaries.findIndex(s => s.date === updatedSummary.date)
      if (index !== -1) {
        state.daySummaries[index] = updatedSummary
      } else {
        state.daySummaries.push(updatedSummary)
      }
    },
    // Tasks
    SET_TASKS(state, tasks: Task[]) {
      state.tasks = tasks
    },
    ADD_TASK(state, task: Task) {
      state.tasks.push(task)
    },
    // Habits
    SET_HABITS(state, habits: Habit[]) {
      state.habits = habits
    },
    ADD_HABIT(state, habit: Habit) {
      state.habits.push(habit)
    },
    UPDATE_HABIT(state, updatedHabit: Habit) {
      const index = state.habits.findIndex(h => h.id === updatedHabit.id)
      if (index !== -1) {
        state.habits[index] = updatedHabit
      }
    },
    // Sparks
    SET_SPARKS(state, sparks: string[]) {
      state.sparks = sparks
    },
    ADD_SPARK(state, spark: string) {
      state.sparks.push(spark)
    },
    // Calendar Entries
    SET_CALENDAR_ENTRIES(state, entries: { date: string; content: string }[]) {
      state.calendarEntries = entries
    },
    ADD_CALENDAR_ENTRY(state, entry: { date: string; content: string }) {
      state.calendarEntries.push(entry)
    },
  },
  actions: {
    // Loaders
    async loadDaySummaries({ commit }) {
      const daySummaries = (await localforage.getItem('daySummaries')) as DaySummary[] | null
      if (daySummaries) {
        commit('SET_DAY_SUMMARIES', daySummaries)
      }
    },
    async addDaySummary({ commit, state }, daySummary: DaySummary) {
      commit('ADD_DAY_SUMMARY', daySummary)
      await localforage.setItem('daySummaries', state.daySummaries)
    },
    async updateDaySummary({ commit, state }, daySummary: DaySummary) {
      commit('UPDATE_DAY_SUMMARY', daySummary)
      await localforage.setItem('daySummaries', state.daySummaries)
    },
    // Tasks
    async loadTasks({ commit }) {
      const tasks = (await localforage.getItem('tasks')) as Task[] | null
      if (tasks) {
        commit('SET_TASKS', tasks)
      }
    },
    async addTask({ commit, state }, task: Task) {
      commit('ADD_TASK', task)
      await localforage.setItem('tasks', state.tasks)
    },
    // Habits
    async loadHabits({ commit }) {
      const habits = (await localforage.getItem('habits')) as Habit[] | null
      if (habits) {
        commit('SET_HABITS', habits)
      }
    },
    async addHabit({ commit, state }, habit: Habit) {
      commit('ADD_HABIT', habit)
      await localforage.setItem('habits', state.habits)
    },
    async updateHabit({ commit, state }, habit: Habit) {
      commit('UPDATE_HABIT', habit)
      await localforage.setItem('habits', state.habits)
    },
    // Sparks
    async loadSparks({ commit }) {
      const sparks = (await localforage.getItem('sparks')) as string[] | null
      if (sparks) {
        commit('SET_SPARKS', sparks)
      }
    },
    async addSpark({ commit, state }, spark: string) {
      commit('ADD_SPARK', spark)
      await localforage.setItem('sparks', state.sparks)
    },
    // Calendar Entries
    async loadCalendarEntries({ commit }) {
      const entries = (await localforage.getItem('calendarEntries')) as { date: string; content: string }[] | null
      if (entries) {
        commit('SET_CALENDAR_ENTRIES', entries)
      }
    },
    async addCalendarEntry({ commit, state }, entry: { date: string; content: string }) {
      commit('ADD_CALENDAR_ENTRY', entry)
      await localforage.setItem('calendarEntries', state.calendarEntries)
    },
  },
  getters: {
    // Day Summaries
    getDaySummary: (state) => (date: string): DaySummary | undefined => {
      return state.daySummaries.find(summary => summary.date === date)
    },
    // Tasks
    getTasks: (state) => state.tasks,
    // Habits
    getHabits: (state) => state.habits,
    // Sparks
    getSparks: (state) => state.sparks,
    // Calendar Entries
    getCalendarEntries: (state) => state.calendarEntries,
    // Getter to calculate total words this month
    totalWordsThisMonth: (state) => (year: number, month: number): number => {
      return state.daySummaries
        .filter(summary => {
          const date = new Date(summary.date)
          return date.getFullYear() === year && date.getMonth() === month
        })
        .reduce((total, summary) => {
          const wordCount = summary.summary.split(/\s+/).length
          return total + wordCount
        }, 0)
    },

    // Getter to calculate number of tags this year
    numberOfTagsThisYear: (state) => (year: number): number => {
      const tagsSet = new Set<string>()
      state.daySummaries.forEach(summary => {
        const date = new Date(summary.date)
        if (date.getFullYear() === year) {
          summary.tags.forEach(tag => tagsSet.add(tag))
        }
      })
      return tagsSet.size
    },

    // Getter to find the most used tag
    mostUsedTag: (state) => (year: number): string | null => {
      const tagCount: { [key: string]: number } = {}
      state.daySummaries.forEach(summary => {
        const date = new Date(summary.date)
        if (date.getFullYear() === year) {
          summary.tags.forEach(tag => {
            tagCount[tag] = (tagCount[tag] || 0) + 1
          })
        }
      })
      let maxCount = 0
      let mostUsed: string | null = null
      for (const tag in tagCount) {
        if (tagCount[tag] > maxCount) {
          maxCount = tagCount[tag]
          mostUsed = tag
        }
      }
      return mostUsed
    },

    // Getter to calculate average energy level
    averageEnergyLevel: (state) => (year: number, month: number): number => {
      const relevantSummaries = state.daySummaries.filter(summary => {
        const date = new Date(summary.date)
        return date.getFullYear() === year && date.getMonth() === month
      })
      if (relevantSummaries.length === 0) return 0
      const totalEnergy = relevantSummaries.reduce((total, summary) => total + summary.dailyCheck.energyLevel, 0)
      return parseFloat((totalEnergy / relevantSummaries.length).toFixed(2))
    },
  },
  modules: {
    // Add modules here if needed
  },
}

export default createStore(store)
