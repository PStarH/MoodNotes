import { ref, onMounted, onUnmounted } from 'vue'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts() {
  const shortcuts = ref<KeyboardShortcut[]>([])
  const isEnabled = ref(true)

  const addShortcut = (shortcut: KeyboardShortcut) => {
    shortcuts.value.push(shortcut)
  }

  const removeShortcut = (key: string) => {
    shortcuts.value = shortcuts.value.filter(s => s.key !== key)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isEnabled.value) return

    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return
    }

    const matchingShortcut = shortcuts.value.find(shortcut => {
      return (
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrl === event.ctrlKey &&
        !!shortcut.alt === event.altKey &&
        !!shortcut.shift === event.shiftKey &&
        !!shortcut.meta === event.metaKey
      )
    })

    if (matchingShortcut) {
      event.preventDefault()
      matchingShortcut.action()
    }
  }

  const enable = () => {
    isEnabled.value = true
  }

  const disable = () => {
    isEnabled.value = false
  }

  const getShortcutString = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = []
    if (shortcut.meta) parts.push('⌘')
    if (shortcut.ctrl) parts.push('Ctrl')
    if (shortcut.alt) parts.push('Alt')
    if (shortcut.shift) parts.push('Shift')
    parts.push(shortcut.key.toUpperCase())
    return parts.join(' + ')
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })

  return {
    addShortcut,
    removeShortcut,
    enable,
    disable,
    shortcuts,
    isEnabled,
    getShortcutString
  }
}