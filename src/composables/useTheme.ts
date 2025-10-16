import { ref, computed, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'auto'

interface ThemeConfig {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
  }
}

const themes: Record<Theme, ThemeConfig> = {
  light: {
    name: 'Light',
    colors: {
      primary: '#7D5A36',
      secondary: '#6B4A2E',
      accent: '#D3C9A6',
      background: '#F0E9D2',
      surface: '#FAF3E0',
      text: '#4E3B2B',
      textSecondary: '#7D5A36',
      border: '#D3C9A6'
    }
  },
  dark: {
    name: 'Dark',
    colors: {
      primary: '#D4B896',
      secondary: '#C5A882',
      accent: '#8B7355',
      background: '#2D2418',
      surface: '#3A2F1F',
      text: '#F0E9D2',
      textSecondary: '#D4B896',
      border: '#4A3D2A'
    }
  },
  auto: {
    name: 'Auto',
    colors: {
      primary: '#7D5A36',
      secondary: '#6B4A2E',
      accent: '#D3C9A6',
      background: '#F0E9D2',
      surface: '#FAF3E0',
      text: '#4E3B2B',
      textSecondary: '#7D5A36',
      border: '#D3C9A6'
    }
  }
}

export function useTheme() {
  const currentTheme = ref<Theme>('light')
  const systemPrefersDark = ref(false)

  // Check system preference
  const checkSystemTheme = () => {
    if (typeof window !== 'undefined') {
      systemPrefersDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  }

  // Get effective theme (resolving 'auto')
  const effectiveTheme = computed(() => {
    if (currentTheme.value === 'auto') {
      return systemPrefersDark.value ? 'dark' : 'light'
    }
    return currentTheme.value
  })

  // Get current theme config
  const themeConfig = computed(() => {
    return themes[effectiveTheme.value]
  })

  // Apply theme to document
  const applyTheme = () => {
    if (typeof document === 'undefined') return

    const config = themeConfig.value
    const root = document.documentElement

    // Apply CSS custom properties
    Object.entries(config.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })

    // Apply theme class
    root.className = root.className.replace(/theme-\w+/, '')
    root.classList.add(`theme-${effectiveTheme.value}`)
  }

  // Set theme
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    localStorage.setItem('theme', theme)
    applyTheme()
  }

  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme = effectiveTheme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // Initialize theme from localStorage
  const initTheme = () => {
    if (typeof window === 'undefined') return

    checkSystemTheme()

    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && themes[savedTheme]) {
      currentTheme.value = savedTheme
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      systemPrefersDark.value = e.matches
      if (currentTheme.value === 'auto') {
        applyTheme()
      }
    })

    applyTheme()
  }

  // Watch for theme changes
  watch([currentTheme, systemPrefersDark], () => {
    applyTheme()
  })

  return {
    currentTheme,
    effectiveTheme,
    themeConfig,
    themes,
    setTheme,
    toggleTheme,
    initTheme
  }
}