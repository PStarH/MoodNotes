import { ref, Component, h, render } from 'vue'
import Toast from '@/components/Toast.vue'

interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
}

const toasts = ref<Array<{ id: number; component: Component }>>([])
let toastId = 0

export function useToast() {
  const show = (options: ToastOptions) => {
    const id = toastId++
    const container = document.createElement('div')
    document.body.appendChild(container)

    const close = () => {
      render(null, container)
      document.body.removeChild(container)
    }

    const vnode = h(Toast, {
      ...options,
      onClose: close
    })

    render(vnode, container)
  }

  const success = (message: string, title?: string, duration?: number) => {
    show({ type: 'success', message, title, duration })
  }

  const error = (message: string, title?: string, duration?: number) => {
    show({ type: 'error', message, title, duration })
  }

  const warning = (message: string, title?: string, duration?: number) => {
    show({ type: 'warning', message, title, duration })
  }

  const info = (message: string, title?: string, duration?: number) => {
    show({ type: 'info', message, title, duration })
  }

  return {
    show,
    success,
    error,
    warning,
    info
  }
}
