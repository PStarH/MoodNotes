import { createStore, StoreOptions } from 'vuex'
import localforage from 'localforage'

interface State {
  summaries: string[];
  sparks: string[];
  calendarEntries: { date: string; content: string }[];
}

const store: StoreOptions<State> = {
  state: {
    summaries: [] as string[],
    sparks: [] as string[],
    calendarEntries: [] as { date: string; content: string }[],
  },
  mutations: {
    SET_SUMMARIES(state: State, summaries: string[]) {
      state.summaries = summaries
    },
    ADD_SUMMARY(state: State, summary: string) {
      state.summaries.push(summary)
    },
    SET_SPARKS(state: State, sparks: string[]) {
      state.sparks = sparks
    },
    ADD_SPARK(state: State, spark: string) {
      state.sparks.push(spark)
    },
    SET_CALENDAR_ENTRIES(state: State, entries: { date: string; content: string }[]) {
      state.calendarEntries = entries
    },
    ADD_CALENDAR_ENTRY(state: State, entry: { date: string; content: string }) {
      state.calendarEntries.push(entry)
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
  },
  getters: {
    summaries: (state) => state.summaries,
    sparks: (state) => state.sparks,
    calendarEntries: (state) => state.calendarEntries,
  },
  modules: {
    // Add modules here if needed
  },
}

export default createStore(store)
