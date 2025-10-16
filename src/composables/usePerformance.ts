import { ref, onMounted, onUnmounted } from 'vue'

export function useIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) {
  const observer = ref<IntersectionObserver | null>(null)

  onMounted(() => {
    observer.value = new IntersectionObserver(callback, options)
  })

  onUnmounted(() => {
    if (observer.value) {
      observer.value.disconnect()
    }
  })

  const observe = (element: Element) => {
    observer.value?.observe(element)
  }

  const unobserve = (element: Element) => {
    observer.value?.unobserve(element)
  }

  return { observe, unobserve }
}

export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  buffer = 5
) {
  const scrollTop = ref(0)
  
  const startIndex = Math.floor(scrollTop.value / itemHeight)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + buffer,
    items.length - 1
  )
  
  const visibleItems = items.slice(
    Math.max(0, startIndex - buffer),
    endIndex + 1
  )
  
  const totalHeight = items.length * itemHeight
  const offsetY = Math.max(0, startIndex - buffer) * itemHeight
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    scrollTop
  }
}

export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  let timeoutId: ReturnType<typeof setTimeout>
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }) as T
}

export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): T {
  let inThrottle: boolean
  
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }) as T
}

export function useWebWorker(workerScript: string) {
  const worker = ref<Worker | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const initWorker = () => {
    try {
      worker.value = new Worker(workerScript)
      
      worker.value.onerror = (e) => {
        error.value = e.message
        isLoading.value = false
      }
    } catch (e) {
      error.value = (e as Error).message
    }
  }

  const postMessage = (data: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!worker.value) {
        reject(new Error('Worker not initialized'))
        return
      }

      isLoading.value = true
      
      const handleMessage = (e: MessageEvent) => {
        worker.value?.removeEventListener('message', handleMessage)
        isLoading.value = false
        resolve(e.data)
      }

      worker.value.addEventListener('message', handleMessage)
      worker.value.postMessage(data)
    })
  }

  onUnmounted(() => {
    worker.value?.terminate()
  })

  return {
    initWorker,
    postMessage,
    isLoading,
    error
  }
}