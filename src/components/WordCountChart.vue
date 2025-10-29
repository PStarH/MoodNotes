<template>
    <div class="glass-effect p-6 rounded-2xl warm-shadow" role="region" aria-labelledby="word-count-title">
        <div class="flex items-start justify-between mb-4">
            <div>
                <h3 id="word-count-title" class="text-xl font-bold text-[#4E3B2B] flex items-center gap-2">
                    <span aria-hidden="true">✍️</span>
                    {{ $t('charts.wordCount.title') }}
                </h3>
                <p class="text-sm text-[#7D5A36]/80">{{ $t('charts.wordCount.subtitle') }}</p>
            </div>
            <div class="flex gap-2">
                <button
                    v-if="isZoomed"
                    @click="resetZoom"
                    class="glass-effect px-3 py-2 rounded-lg text-xs text-[#4E3B2B] hover:bg-[#7D5A36]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7D5A36]"
                    aria-label="Reset zoom to default view"
                    :title="$t('charts.wordCount.resetZoom')"
                >
                    {{ $t('charts.wordCount.resetZoom') }}
                </button>
                <select
                    v-model="timeRange"
                    class="glass-effect px-3 py-2 rounded-lg text-sm text-[#4E3B2B] focus:outline-none focus:ring-2 focus:ring-[#7D5A36]"
                    aria-label="Select time range for writing activity chart"
                >
                    <option value="7">{{ $t('charts.wordCount.last7Days') }}</option>
                    <option value="14">{{ $t('charts.wordCount.last14Days') }}</option>
                    <option value="30">{{ $t('charts.wordCount.last30Days') }}</option>
                    <option value="60">{{ $t('charts.wordCount.last60Days') }}</option>
                    <option value="90">{{ $t('charts.wordCount.last90Days') }}</option>
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
            {{ $t('charts.wordCount.hint') }}
        </p>
        <div class="mt-4 grid grid-cols-3 gap-3 text-center">
            <div class="glass-effect p-3 rounded-lg transition-all hover:scale-105">
                <p class="text-2xl font-bold text-[#4E3B2B]">{{ totalWords.toLocaleString() }}</p>
                <p class="text-xs text-[#7D5A36]/70">{{ $t('charts.wordCount.totalWords') }}</p>
            </div>
            <div class="glass-effect p-3 rounded-lg transition-all hover:scale-105">
                <p class="text-2xl font-bold text-[#4E3B2B]">{{ averageWords }}</p>
                <p class="text-xs text-[#7D5A36]/70">{{ $t('charts.wordCount.avgWords') }}</p>
            </div>
            <div class="glass-effect p-3 rounded-lg transition-all hover:scale-105">
                <p class="text-2xl font-bold text-[#4E3B2B]">{{ entriesCount }}</p>
                <p class="text-xs text-[#7D5A36]/70">{{ $t('analytics.totalEntries') }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, TooltipItem } from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import { useStore } from 'vuex'
import { DaySummary } from '@/store/types'
import { useI18n } from 'vue-i18n'
import { countWordsInHtml } from '@/utils/wordCount'

const { t, locale } = useI18n()

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, zoomPlugin)

const store = useStore()
const timeRange = ref(7)
const chartRef = ref<any>(null)
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

// Optimized: Helper function to count words - supports both English and Chinese
const getWordCount = (html: string): number => {
    return countWordsInHtml(html)
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

        days.push(date.toLocaleDateString(locale.value === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' }))
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
            label: t('charts.wordCount.words'),
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
                title: (tooltipItems: TooltipItem<'bar'>[]) => {
                    const index = tooltipItems[0].dataIndex
                    const rawDate = chartDataPoints.value.rawDates[index]
                    const date = new Date(rawDate)
                    // More precise date display
                    return date.toLocaleDateString(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    })
                },
                label: (context: TooltipItem<'bar'>) => {
                    const index = context.dataIndex
                    const rawDate = chartDataPoints.value.rawDates[index]
                    const data = summariesByDateWithWordCount.value.get(rawDate)
                    const wordCount = context.parsed.y ?? 0

                    const lines: string[] = []

                    if (wordCount === 0) {
                        lines.push(t('charts.common.noData'))
                        return lines
                    }

                    lines.push(`${t('charts.wordCount.words')}: ${wordCount.toLocaleString()}`)

                    if (data?.summary.mood) {
                        const moodEmojis: { [key: string]: string } = {
                            'angry': '😠',
                            'sad': '😢',
                            'neutral': '😐',
                            'happy': '😄',
                            'excited': '🎉'
                        }
                        const emoji = moodEmojis[data.summary.mood] || '😐'
                        lines.push(`${t('charts.moodTrend.mood')}: ${emoji}`)
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
                    speed: 0.08 // Smoother zoom speed
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
                callback: (value: string | number) => {
                    const numValue = Number(value)
                    if (numValue >= 1000) return `${(numValue / 1000).toFixed(1)}k`
                    return numValue
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
