import { nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue'

export interface FocusTrapOptions {
  initialFocus?: string | HTMLElement | (() => HTMLElement | null)
  returnFocus?: boolean
  allowTabOutside?: boolean
  onEscape?: () => void
}

const focusableSelectors = [
  'a[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]'
]

const isElementVisible = (element: HTMLElement) => {
  if (element.hasAttribute('hidden') || element.getAttribute('aria-hidden') === 'true') {
    return false
  }

  const style = window.getComputedStyle(element)
  return style.visibility !== 'hidden' && style.display !== 'none'
}

const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelectors.join(','))
  )

  return elements.filter(el => !el.hasAttribute('disabled') && isElementVisible(el))
}

export function useFocusTrap(containerRef: Ref<HTMLElement | null>, options: FocusTrapOptions = {}) {
  const previouslyFocusedElement = ref<HTMLElement | null>(null)
  let isActive = false
  let storedTabIndex: string | null = null

  const {
    initialFocus,
    returnFocus = true,
    allowTabOutside = false,
    onEscape
  } = options

  const resolveInitialFocus = (): HTMLElement | null => {
    const container = containerRef.value
    if (!container) return null

    if (typeof initialFocus === 'string') {
      return container.querySelector<HTMLElement>(initialFocus)
    }

    if (typeof initialFocus === 'function') {
      return initialFocus()
    }

    if (initialFocus instanceof HTMLElement) {
      return initialFocus
    }

    const focusable = getFocusableElements(container)
    if (focusable.length > 0) {
      return focusable[0]
    }

    return container
  }

  const focusInitialElement = async () => {
    await nextTick()

    const container = containerRef.value
    if (!container) return

    const target = resolveInitialFocus()
    if (!target) return

    if (document.activeElement !== target) {
      target.focus({ preventScroll: true })
    }
  }

  const isEventInsideContainer = (target: EventTarget | null): boolean => {
    const container = containerRef.value
    if (!container) return false
    if (!target || !(target instanceof Node)) return false
    return container === target || container.contains(target)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    const container = containerRef.value
    if (!container) return

    const isInside = isEventInsideContainer(event.target)

    if (event.key === 'Escape' && isInside) {
      if (onEscape) {
        event.preventDefault()
        onEscape()
      }
      return
    }

    if (event.key !== 'Tab' || allowTabOutside || !isInside) {
      return
    }

    const focusableElements = getFocusableElements(container)

    if (focusableElements.length === 0) {
      event.preventDefault()
      container.focus({ preventScroll: true })
      return
    }

    const currentElement = document.activeElement as HTMLElement | null
    const currentIndex = currentElement
      ? focusableElements.indexOf(currentElement)
      : -1

    let nextIndex = 0

    if (event.shiftKey) {
      nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1
    } else {
      nextIndex = currentIndex === focusableElements.length - 1 ? 0 : currentIndex + 1
    }

    event.preventDefault()
    focusableElements[nextIndex].focus({ preventScroll: true })
  }

  const handleFocusIn = (event: FocusEvent) => {
    if (allowTabOutside) return

    if (!isEventInsideContainer(event.target)) {
      const container = containerRef.value
      if (!container) return

      const focusableElements = getFocusableElements(container)
      const fallbackTarget = focusableElements[0] ?? container

      fallbackTarget.focus({ preventScroll: true })
    }
  }

  const activate = async () => {
    if (isActive) {
      await focusInitialElement()
      return
    }

    previouslyFocusedElement.value = document.activeElement as HTMLElement | null

    await nextTick()

    const container = containerRef.value
    if (!container) return

    if (!container.hasAttribute('tabindex')) {
      storedTabIndex = null
      container.setAttribute('tabindex', '-1')
    } else {
      storedTabIndex = container.getAttribute('tabindex')
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('focusin', handleFocusIn, true)

    isActive = true

    await focusInitialElement()
  }

  const deactivate = (shouldReturnFocus: boolean = returnFocus) => {
    if (!isActive) return

    isActive = false

    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('focusin', handleFocusIn, true)

    const container = containerRef.value
    if (container) {
      if (storedTabIndex === null) {
        container.removeAttribute('tabindex')
      } else {
        container.setAttribute('tabindex', storedTabIndex)
      }
    }

    const target = previouslyFocusedElement.value

    if (shouldReturnFocus && target && document.contains(target)) {
      target.focus({ preventScroll: true })
    }

    previouslyFocusedElement.value = null
  }

  const refresh = async () => {
    if (!isActive) return
    await focusInitialElement()
  }

  return {
    activate,
    deactivate,
    refresh
  }
}

export function useModalFocus(options: FocusTrapOptions = {}) {
  const containerRef = ref<HTMLElement | null>(null)
  const focusTrap = useFocusTrap(containerRef, options)

  watch(containerRef, (element, previousElement) => {
    if (element) {
      focusTrap.activate()
    } else if (previousElement) {
      focusTrap.deactivate()
    }
  })

  onBeforeUnmount(() => {
    focusTrap.deactivate()
  })

  return {
    containerRef,
    refreshFocus: focusTrap.refresh,
    deactivateFocusTrap: focusTrap.deactivate
  }
}
