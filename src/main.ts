import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import './style.css'  // Import Tailwind CSS

const app = createApp(App)

app.use(store)
app.use(router)

// Corrected action dispatch
store.dispatch('loadDaySummaries')
store.dispatch('loadSparks')
store.dispatch('loadCalendarEntries')
store.dispatch('loadTasks')
store.dispatch('loadHabits')

app.mount('#app')
