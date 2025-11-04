import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import i18n from './i18n'
import './style.css'  // Import Tailwind CSS
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import localforage from 'localforage'

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error)
  alert(`Error: ${event.error?.message || 'Unknown error'}`)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  alert(`Promise rejection: ${event.reason?.message || event.reason}`)
})

console.log('MoodNotes starting...')
console.log('Environment:', process.env.NODE_ENV)
console.log('Base URL:', import.meta.env.BASE_URL)

const app = createApp(App)

// Add global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err, info)
  alert(`Vue error: ${err}`)
}

// Register virtual scroller components globally
app.component('DynamicScroller', DynamicScroller)
app.component('DynamicScrollerItem', DynamicScrollerItem)

console.log('Installing plugins...')
app.use(store)
app.use(router)
app.use(i18n)
console.log('Plugins installed')

// Load saved language preference and update i18n
localforage.getItem('settings:language').then((savedLang) => {
  if (savedLang === 'zh' || savedLang === 'en') {
    i18n.global.locale.value = savedLang as 'en' | 'zh'
  }
}).catch(err => {
  console.error('Failed to load language setting:', err)
})

// Corrected action dispatch
console.log('Loading initial data...')
Promise.all([
  store.dispatch('loadDaySummaries'),
  store.dispatch('loadSparks'),
  store.dispatch('loadCalendarEntries'),
  store.dispatch('loadTasks'),
  store.dispatch('loadHabits'),
  store.dispatch('loadSettings')
]).then(() => {
  console.log('Initial data loaded')
}).catch(err => {
  console.error('Failed to load initial data:', err)
})

console.log('Mounting app...')
app.mount('#app')
console.log('App mounted successfully')
