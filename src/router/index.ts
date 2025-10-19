import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Homepage from '../views/Homepage.vue'
import DaySummary from '../views/DaySummary.vue'
import Analytics from '../views/Analytics.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Homepage
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: Analytics
  },
  {
    path: '/day-summary',
    name: 'DaySummary',
    component: DaySummary
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
