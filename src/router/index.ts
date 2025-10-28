import { createRouter, createWebHistory, createWebHashHistory, RouteRecordRaw } from 'vue-router'

// Lazy load route components for better performance
const Homepage = () => import('../views/Homepage.vue')
const DaySummary = () => import('../views/DaySummary.vue')
const Analytics = () => import('../views/Analytics.vue')
const Settings = () => import('../views/Settings.vue')

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
    path: '/settings',
    name: 'Settings',
    component: Settings
  },
  {
    path: '/day-summary',
    name: 'DaySummary',
    component: DaySummary
  }
]

// Use hash history for Electron (file:// protocol), web history for web
// Check if running in Electron environment
const isElectron = typeof window !== 'undefined' && (window as any).process?.type === 'renderer'
const router = createRouter({
  history: isElectron ? createWebHashHistory() : createWebHistory(),
  routes
})

export default router
