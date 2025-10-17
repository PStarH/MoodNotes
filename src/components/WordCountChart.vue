<template>
    <div class="glass-effect p-6 rounded-2xl warm-shadow" role="region" aria-labelledby="word-count-title">
        <div class="flex items-start justify-between mb-4">
            <div>
                <h3 id="word-count-title" class="text-xl font-bold text-[#4E3B2B] flex items-center gap-2">
                    <span aria-hidden="true">✍️</span>
                    Writing Activity
                </h3>
                <p class="text-sm text-[#7D5A36]/80">Track your journaling consistency</p>
            </div>
            <div class="flex gap-2">
                <button
                    v-if="isZoomed"
                    @click="resetZoom"
                    class="glass-effect px-3 py-2 rounded-lg text-xs text-[#4E3B2B] hover:bg-[#7D5A36]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7D5A36]"
                    aria-label="Reset zoom to default view"
                    title="Reset zoom"
                >
                    <span aria-hidden="true">🔍</span> Reset
                </button>
                <select
                    v-model="timeRange"
                    class="glass-effect px-3 py-2 rounded-lg text-sm text-[#4E3B2B] focus:outline-none focus:ring-2 focus:ring-[#7D5A36]"
                    aria-label="Select time range for writing activity chart"
                >
                    <option value="7">Last 7 days</option>
                    <option value="14">Last 14 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="60">Last 60 days</option>
                    <option value="90">Last 90 days</option>
                </select>
            </div>
        </div>
        <div class="h-64 relative" role="img" :aria-label="`Writing activity bar chart showing word counts over the last ${timeRange} days. Total: ${totalWords} words, Average: ${averageWords} words per entry`">
            <Bar
                ref="chartRef"
                :data="chartData"
                :options="chartOptions"
            />
        </div>
        <p class="text-xs text-[#7D5A36]/60 mt-2 text-center" aria-label="Chart interaction instructions">
            <span aria-hidden="true">💡</span> Scroll to zoom horizontally, drag to pan left/right
        </p>
        <div class="mt-4 grid grid-cols-3 gap-3 text-center">
            <div class="glass-effect p-3 rounded-lg transition-all hover:scale-105">
                <p class="text-2xl font-bold text-[#4E3B2B]">{{ totalWords.toLocaleString() }}</p>
                <p class="text-xs text-[#7D5A36]/70">Total Words</p>
            </div>
            <div class="glass-effect p-3 rounded-lg transition-all hover:scale-105">
                <p class="text-2xl font-bold text-[#4E3B2B]">{{ averageWords }}</p>
                <p class="text-xs text-[#7D5A36]/70">Avg/Day</p>
            </div>
            <div class="glass-effect p-3 rounded-lg transition-all hover:scale-105">
                <p class="text-2xl font-bold text-[#4E3B2B]">{{ entriesCount }}</p>
                <p class="text-xs text-[#7D5A36]/70">Entries</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import { useStore } from 'vuex'
import { DaySummary } from '@/store/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, zoomPlugin)

const store = useStore()
const timeRange = ref(7)
const chartRef = ref<InstanceType<typeof Bar> | null>(null)
const isZoomed = ref(false)
const resizeTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

// Throttle resize handling to prevent flickering
const handleResize = () => {
    if (resizeTimeout.value) clearTimeout(resizeTimeout.value)
    resizeTimeout.value = setTimeout(() => {
        if (chartRef.value?.chart) {
            chartRef.value.chart.resize()
        }
    }, 100)
}

onMounted(() => {
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (resizeTimeout.value) clearTimeout(resizeTimeout.value)
})

// Reset zoom function
const resetZoom = () => {
    if (chartRef.value?.chart) {
        chartRef.value.chart.resetZoom()
        isZoomed.value = false
    }
}

// Optimized: Helper function to count words - use DOMParser instead of createElement
const getWordCount = (html: string): number => {
    if (!html) return 0
    // Use DOMParser for better performance than createElement
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const text = doc.body.textContent || doc.body.innerText || ''
    return text.split(/\s+/).filter(word => word.length > 0).length
}

// Optimization: Create Map for O(1) lookups and cache word counts
const summariesByDateWithWordCount = computed(() => {
    const summaries = store.state.daySummaries as DaySummary[]
    const map = new Map<string, { summary: DaySummary; wordCount: number }>()

    summaries.forEach(summary => {
        map.set(summary.date, {
            summary,
            wordCount: getWordCount(summary.summary) // Cache word count calculation
        })
    })

    return map
})

// Get data for the selected time range
const chartDataPoints = computed(() => {
    const today = new Date()

    const days: string[] = []
    const wordCounts: number[] = []
    const rawDates: string[] = []

    // Generate all dates in range
    for (let i = timeRange.value - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateString = date.toISOString().split('T')[0]

        // O(1) lookup with cached word count
        const data = summariesByDateWithWordCount.value.get(dateString)

        days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
        rawDates.push(dateString)
        wordCounts.push(data ? data.wordCount : 0)
    }

    return { days, wordCounts, rawDates }
})

const totalWords = computed(() => {
    return chartDataPoints.value.wordCounts.reduce((sum, count) => sum + count, 0)
})

const entriesCount = computed(() => {
    return chartDataPoints.value.wordCounts.filter(count => count > 0).length
})

const averageWords = computed(() => {
    if (entriesCount.value === 0) return 0
    return Math.round(totalWords.value / entriesCount.value)
})

const chartData = computed(() => ({
    labels: chartDataPoints.value.days,
    datasets: [
        {
            label: 'Words Written',
            data: chartDataPoints.value.wordCounts,
            backgroundColor: 'rgba(125, 90, 54, 0.8)',
            borderColor: '#7D5A36',
            borderWidth: 2,
            borderRadius: 8,
            hoverBackgroundColor: '#9D7A56',
            hoverBorderColor: '#5D3A16',
            hoverBorderWidth: 3
        }
    ]
}))

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    // Smooth animations, but disable for larger datasets
    animation: {
        duration: chartDataPoints.value.days.length > 60 ? 0 : 750,
        easing: 'easeInOutQuart' as const
    },
    // Reduce flickering with smooth transitions
    transitions: {
        active: {
            animation: {
                duration: 200
            }
        }
    },
    // Better interaction mode
    interaction: {
        mode: 'index' as const,
        intersect: false,
        axis: 'x' as const
    },
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: '#4E3B2B',
            titleColor: '#FAF3E0',
            bodyColor: '#FAF3E0',
            padding: 16,
            cornerRadius: 12,
            displayColors: false,
            callbacks: {
                title: (context: Array<{ dataIndex: number; [key: string]: unknown }>) => {
                    const index = context[0].dataIndex
                    const rawDate = chartDataPoints.value.rawDates[index]
                    const date = new Date(rawDate)
                    // More precise date display
                    return date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    })
                },
                label: (context: { dataIndex: number; parsed: { y: number }; [key: string]: unknown }) => {
                    const index = context.dataIndex
                    const rawDate = chartDataPoints.value.rawDates[index]
                    const data = summariesByDateWithWordCount.value.get(rawDate)
                    const wordCount = context.parsed.y

                    const lines: string[] = []

                    if (wordCount === 0) {
                        lines.push('No entry for this day')
                        return lines
                    }

                    lines.push(`Words: ${wordCount.toLocaleString()}`)

                    if (data?.summary.mood) {
                        const moodEmojis: { [key: string]: string } = {
                            'angry': '😠',
                            'sad': '😢',
                            'neutral': '😐',
                            'happy': '😄',
                            'excited': '🎉'
                        }
                        const emoji = moodEmojis[data.summary.mood] || '😐'
                        lines.push(`Mood: ${emoji}`)
                    }

                    if (data?.summary.summary) {
                        const textContent = data.summary.summary.replace(/<[^>]*>/g, '').trim()
                        if (textContent.length > 0) {
                            const preview = textContent.substring(0, 60) + (textContent.length > 60 ? '...' : '')
                            lines.push('─'.repeat(20))
                            lines.push(`"${preview}"`)
                        }
                    }

                    return lines
                }
            }
        },
        zoom: {
            zoom: {
                wheel: {
                    enabled: true,
                    speed: 0.08, // Smoother zoom speed
                    modifierKey: null
                },
                pinch: {
                    enabled: true
                },
                mode: 'x' as const,
                scaleMode: 'x' as const,
                onZoomComplete: () => {
                    isZoomed.value = true
                }
            },
            pan: {
                enabled: true,
                mode: 'x' as const,
                modifierKey: null,
                // Add smooth panning with inertia
                speed: 20,
                threshold: 10
            },
            limits: {
                x: { min: 'original' as const, max: 'original' as const }
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                color: '#7D5A36',
                callback: (value: number) => {
                    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
                    return value
                }
            },
            grid: {
                color: 'rgba(125, 90, 54, 0.1)'
            }
        },
        x: {
            ticks: {
                color: '#7D5A36',
                maxRotation: 45,
                minRotation: 45
            },
            grid: {
                display: false
            }
        }
    }
}))
</script>
