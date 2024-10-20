import { createStore, StoreOptions } from 'vuex'
import localforage from 'localforage'

// Add at the top where you import localforage
localforage.config({
  name: 'MoodNotes',
  storeName: 'mood_notes_store',
})

interface Task {
  description: string
  priority: string
  dueDate: string
}

interface Habit {
  id: number
  name: string
  description: string
}

interface DaySummary {
  date: string
  summary: string
}

interface State {
  summaries: string[]
  sparks: string[]
  calendarEntries: { date: string; content: string }[]
  tasks: Task[]
  habits: Habit[]
  daySummaries: DaySummary[]
}

const store: StoreOptions<State> = {
  state: {
    summaries: [],
    sparks: [],
    calendarEntries: [],
    tasks: [],
    habits: [
      { id: 1, name: 'Morning Meditation', description: '15 minutes of mindfulness to start the day' },
      { id: 2, name: 'Daily Exercise', description: '30 minutes of physical activity' },
      { id: 3, name: 'Read a Book', description: 'Read for 20 minutes before bed' },
    ],
    daySummaries: [],
  },
  mutations: {
    SET_SUMMARIES(state, summaries: string[]) {
      state.summaries = summaries
    },
    ADD_SUMMARY(state, summary: string) {
      state.summaries.push(summary)
    },
    SET_SPARKS(state, sparks: string[]) {
      state.sparks = sparks
    },
    ADD_SPARK(state, spark: string) {
      state.sparks.push(spark)
    },
    SET_CALENDAR_ENTRIES(state, entries: { date: string; content: string }[]) {
      state.calendarEntries = entries
    },
    ADD_CALENDAR_ENTRY(state, entry: { date: string; content: string }) {
      state.calendarEntries.push(entry)
    },
    SET_TASKS(state, tasks: Task[]) {
      state.tasks = tasks
    },
    ADD_TASK(state, task: Task) {
      state.tasks.push(task)
    },
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
      }
    },
  },
  actions: {
    async loadSummaries({ commit }) {
      const summaries = (await localforage.getItem('summaries')) as string[] || []
      commit('SET_SUMMARIES', summaries)
    },
    async addSummary({ commit, state }, summary: string) {
      commit('ADD_SUMMARY', summary)
      await localforage.setItem('summaries', state.summaries)
    },
    async loadSparks({ commit }) {
      const sparks = (await localforage.getItem('sparks')) as string[] || []
      commit('SET_SPARKS', sparks)
    },
    async addSpark({ commit, state }, spark: string) {
      commit('ADD_SPARK', spark)
      await localforage.setItem('sparks', state.sparks)
    },
    async loadCalendarEntries({ commit }) {
      const entries = (await localforage.getItem('calendarEntries')) as { date: string; content: string }[] || []
      commit('SET_CALENDAR_ENTRIES', entries)
    },
    async addCalendarEntry({ commit, state }, entry: { date: string; content: string }) {
      commit('ADD_CALENDAR_ENTRY', entry)
      await localforage.setItem('calendarEntries', state.calendarEntries)
    },
    async loadTasks({ commit }) {
      const tasks = (await localforage.getItem('tasks')) as Task[] || []
      commit('SET_TASKS', tasks)
    },
    async addTask({ commit, state }, task: Task) {
      commit('ADD_TASK', task)
      await localforage.setItem('tasks', state.tasks)
    },
    async loadHabits({ commit, state }) {
      const habits = (await localforage.getItem('habits')) as Habit[] || state.habits
      commit('SET_HABITS', habits)
    },
    async addHabit({ commit, state }, habit: Habit) {
      commit('ADD_HABIT', habit)
      await localforage.setItem('habits', state.habits)
    },
    async updateHabit({ commit, state }, habit: Habit) {
      commit('UPDATE_HABIT', habit)
      await localforage.setItem('habits', state.habits)
    },
    async loadDaySummaries({ commit }) {
      const daySummaries = (await localforage.getItem('daySummaries')) as DaySummary[] || []
      commit('SET_DAY_SUMMARIES', daySummaries)
    },
    async addDaySummary({ commit, state }, daySummary: DaySummary) {
      commit('ADD_DAY_SUMMARY', daySummary)
      await localforage.setItem('daySummaries', state.daySummaries)
    },
    async updateDaySummary({ commit, state }, daySummary: DaySummary) {
      commit('UPDATE_DAY_SUMMARY', daySummary)
      await localforage.setItem('daySummaries', state.daySummaries)
    },
  },
  getters: {
    summaries: (state) => state.summaries,
    sparks: (state) => state.sparks,
    calendarEntries: (state) => state.calendarEntries,
    tasks: (state) => state.tasks,
    habits: (state) => state.habits,
    daySummaries: (state) => state.daySummaries,
  },
  modules: {
    // Add modules here if needed
  },
}

export default createStore(store)
