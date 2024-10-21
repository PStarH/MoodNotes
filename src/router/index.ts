import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Homepage from '@/views/Homepage.vue'
import DaySummary from '@/views/DaySummary.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Homepage
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

