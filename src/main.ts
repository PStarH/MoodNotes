import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import i18n from './i18n'
import './style.css'  // Import Tailwind CSS
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import localforage from 'localforage'

const app = createApp(App)

// Register virtual scroller components globally
app.component('DynamicScroller', DynamicScroller)
app.component('DynamicScrollerItem', DynamicScrollerItem)

app.use(store)
app.use(router)
app.use(i18n)

// Load saved language preference and update i18n
localforage.getItem('settings:language').then((savedLang) => {
  if (savedLang === 'zh' || savedLang === 'en') {
    i18n.global.locale.value = savedLang as 'en' | 'zh'
  }
})

// Corrected action dispatch
store.dispatch('loadDaySummaries')
store.dispatch('loadSparks')
store.dispatch('loadCalendarEntries')
store.dispatch('loadTasks')
store.dispatch('loadHabits')

app.mount('#app')
