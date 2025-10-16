interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  componentCount: number
  bundleSize: number
}

interface ComponentMetrics {
  name: string
  renderTime: number
  updateCount: number
  props: any
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0,
    bundleSize: 0
  }

  private componentMetrics: Map<string, ComponentMetrics> = new Map()
  private observers: ((metrics: PerformanceMetrics) => void)[] = []

  constructor() {
    this.init()
  }

  private init() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      if (performance && performance.timing) {
        this.metrics.loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
      }
      this.updateMetrics()
    })

    // Monitor memory usage
    if (performance && (performance as any).memory) {
      setInterval(() => {
        const memory = (performance as any).memory
        this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // MB
        this.updateMetrics()
      }, 5000)
    }

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            if (entry.duration > 50) {
              console.warn(`Long task detected: ${entry.duration}ms`, entry)
            }
          })
        })
        observer.observe({ entryTypes: ['longtask'] })
      } catch (e) {
        console.warn('Long task monitoring not supported')
      }
    }
  }

  measureComponentRender<T>(
    componentName: string,
    renderFn: () => T,
    props?: any
  ): T {
    const startTime = performance.now()
    const result = renderFn()
    const endTime = performance.now()
    const renderTime = endTime - startTime

    const existing = this.componentMetrics.get(componentName)
    if (existing) {
      existing.renderTime = (existing.renderTime + renderTime) / 2 // Average
      existing.updateCount++
      existing.props = props
    } else {
      this.componentMetrics.set(componentName, {
        name: componentName,
        renderTime,
        updateCount: 1,
        props
      })
    }

    this.metrics.componentCount = this.componentMetrics.size
    this.updateMetrics()

    return result
  }

  async measureAsyncOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now()
    
    try {
      const result = await operation()
      const endTime = performance.now()
      
      console.log(`${operationName} completed in ${(endTime - startTime).toFixed(2)}ms`)
      return result
    } catch (error) {
      const endTime = performance.now()
      console.error(`${operationName} failed after ${(endTime - startTime).toFixed(2)}ms:`, error)
      throw error
    }
  }

  logComponentMetrics() {
    console.group('Component Performance Metrics')
    this.componentMetrics.forEach((metric) => {
      console.log(`${metric.name}: ${metric.renderTime.toFixed(2)}ms (${metric.updateCount} renders)`)
    })
    console.groupEnd()
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  getComponentMetrics(): ComponentMetrics[] {
    return Array.from(this.componentMetrics.values())
  }

  onMetricsUpdate(callback: (metrics: PerformanceMetrics) => void) {
    this.observers.push(callback)
  }

  private updateMetrics() {
    this.observers.forEach(callback => callback(this.metrics))
  }

  // Detect performance issues
  detectIssues(): string[] {
    const issues: string[] = []

    if (this.metrics.loadTime > 3000) {
      issues.push('Slow page load time (>3s)')
    }

    if (this.metrics.memoryUsage > 100) {
      issues.push('High memory usage (>100MB)')
    }

    this.componentMetrics.forEach((metric) => {
      if (metric.renderTime > 16) {
        issues.push(`Slow component render: ${metric.name} (${metric.renderTime.toFixed(2)}ms)`)
      }

      if (metric.updateCount > 100) {
        issues.push(`Frequent re-renders: ${metric.name} (${metric.updateCount} updates)`)
      }
    })

    return issues
  }

  // Create performance report
  generateReport(): string {
    const issues = this.detectIssues()
    const topComponents = Array.from(this.componentMetrics.values())
      .sort((a, b) => b.renderTime - a.renderTime)
      .slice(0, 5)

    let report = '# Performance Report\n\n'
    report += `## Metrics\n`
    report += `- Load Time: ${this.metrics.loadTime}ms\n`
    report += `- Memory Usage: ${this.metrics.memoryUsage.toFixed(2)}MB\n`
    report += `- Components: ${this.metrics.componentCount}\n\n`

    if (issues.length > 0) {
      report += `## Issues Found\n`
      issues.forEach(issue => {
        report += `- ${issue}\n`
      })
      report += '\n'
    }

    if (topComponents.length > 0) {
      report += `## Slowest Components\n`
      topComponents.forEach((comp, index) => {
        report += `${index + 1}. ${comp.name}: ${comp.renderTime.toFixed(2)}ms (${comp.updateCount} renders)\n`
      })
    }

    return report
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Vue composition API for performance monitoring
export function usePerformanceMonitor() {
  return {
    measureRender: performanceMonitor.measureComponentRender.bind(performanceMonitor),
    measureAsync: performanceMonitor.measureAsyncOperation.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    detectIssues: performanceMonitor.detectIssues.bind(performanceMonitor),
    generateReport: performanceMonitor.generateReport.bind(performanceMonitor)
  }
}