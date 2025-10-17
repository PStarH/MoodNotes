import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import './style.css'  // Import Tailwind CSS
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { RecycleScroller, DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'

const app = createApp(App)

// Register virtual scroller components globally
app.component('RecycleScroller', RecycleScroller)
app.component('DynamicScroller', DynamicScroller)
app.component('DynamicScrollerItem', DynamicScrollerItem)

app.use(store)
app.use(router)

// Corrected action dispatch
store.dispatch('loadDaySummaries')
store.dispatch('loadSparks')
store.dispatch('loadCalendarEntries')
store.dispatch('loadTasks')
store.dispatch('loadHabits')

app.mount('#app')
