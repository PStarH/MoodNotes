<template>
    <div class="glass-effect p-6 rounded-2xl warm-shadow" role="region" aria-labelledby="mood-trend-title">
        <div class="flex items-start justify-between mb-4">
            <div>
                <h3 id="mood-trend-title" class="text-xl font-bold text-[#4E3B2B] flex items-center gap-2">
                    <span aria-hidden="true">📈</span>
                    {{ $t('charts.moodTrend.title') }}
                </h3>
                <p class="text-sm text-[#7D5A36]/80">{{ $t('charts.moodTrend.subtitle') }}</p>
            </div>
            <div class="flex gap-2">
                <button
                    v-if="isZoomed"
                    @click="resetZoom"
                    class="glass-effect px-3 py-2 rounded-lg text-xs text-[#4E3B2B] hover:bg-[#7D5A36]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7D5A36]"
                    aria-label="Reset zoom to default view"
                    :title="$t('charts.moodTrend.resetZoom')"
                >
                    {{ $t('charts.moodTrend.resetZoom') }}
                </button>
                <select
                    v-model="timeRange"
                    class="glass-effect px-3 py-2 rounded-lg text-sm text-[#4E3B2B] focus:outline-none focus:ring-2 focus:ring-[#7D5A36]"
                    aria-label="Select time range for mood trend chart"
                >
                    <option value="7">{{ $t('charts.moodTrend.last7Days') }}</option>
                    <option value="14">{{ $t('charts.moodTrend.last14Days') }}</option>
                    <option value="30">{{ $t('charts.moodTrend.last30Days') }}</option>
                    <option value="60">{{ $t('charts.moodTrend.last60Days') }}</option>
                    <option value="90">{{ $t('charts.moodTrend.last90Days') }}</option>
                </select>
            </div>
        </div>
        <div class="h-64 relative" role="img" :aria-label="`Mood trend chart showing your mood levels over the last ${timeRange} days`">
            <Line
                ref="chartRef"
                :data="chartData"
                :options="chartOptions"
            />
        </div>
        <p class="text-xs text-[#7D5A36]/60 mt-2 text-center" aria-label="Chart interaction instructions">
            {{ $t('charts.moodTrend.hint') }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect, onMounted, onUnmounted, type PropType } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
  type TooltipItem
} from 'chart.js'
import { Line } from 'vue-chartjs'
import zoomPlugin from 'chartjs-plugin-zoom'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
import { useStore } from 'vuex'
import { DaySummary } from '@/store/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, zoomPlugin)

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

// Map moods to numeric values for charting
const moodToValue = (mood: string | undefined): number => {
    const moodMap: { [key: string]: number } = {
        'angry': 1,
        'sad': 2,
        'neutral': 3,
        'happy': 4,
        'excited': 5
    }
    return mood ? moodMap[mood] || 3 : 3
}

// Optimization: Create a Map for O(1) lookups instead of O(n) find operations
const summariesByDate = computed(() => {
    const summaries = store.state.daySummaries as DaySummary[]
    const map = new Map<string, DaySummary>()
    summaries.forEach(summary => {
        map.set(summary.date, summary)
    })
    return map
})

// Get data for the selected time range - store both formatted and raw dates
const chartDataPoints = computed(() => {
    const today = new Date()
    const days: string[] = []
    const values: number[] = []
    const rawDates: string[] = []

    // Generate all dates in range
    for (let i = timeRange.value; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateString = date.toISOString().split('T')[0]

        // O(1) lookup instead of O(n) find
        const summary = summariesByDate.value.get(dateString)

        days.push(date.toLocaleDateString(locale.value === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' }))
        rawDates.push(dateString)
        values.push(summary ? moodToValue(summary.mood) : 3) // Default to neutral if no entry
    }

    return { days, values, rawDates }
})

const chartData = computed(() => ({
    labels: chartDataPoints.value.days,
    datasets: [
        {
            label: t('charts.moodTrend.moodLevel'),
            data: chartDataPoints.value.values,
            borderColor: '#7D5A36',
            backgroundColor: 'rgba(125, 90, 54, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 6,
            pointHoverRadius: 10,
            pointBackgroundColor: '#7D5A36',
            pointBorderColor: '#FAF3E0',
            pointBorderWidth: 2,
            pointHoverBorderWidth: 3,
            pointHoverBackgroundColor: '#9D7A56'
        }
    ]
}))

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    // Smooth animations, but disable for large datasets
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
                title: (tooltipItems: TooltipItem<'line'>[]) => {
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
                label: (context: TooltipItem<'line'>) => {
                    const index = context.dataIndex
                    const rawDate = chartDataPoints.value.rawDates[index]
                    const summary = summariesByDate.value.get(rawDate)
                    const value = context.parsed.y ?? 3
                    const moodLabels = ['', t('charts.moodTrend.angry'), t('charts.moodTrend.sad'), t('charts.moodTrend.neutral'), t('charts.moodTrend.happy'), t('charts.moodTrend.excited')]

                    const lines: string[] = []
                    lines.push(`${t('charts.moodTrend.mood')}: ${moodLabels[value] || t('charts.moodTrend.unknown')}`)

                    if (summary?.dailyCheck) {
                        lines.push(`${t('charts.moodTrend.energy')}: ${summary.dailyCheck.energyLevel}/10`)
                        lines.push(`${t('charts.moodTrend.stress')}: ${summary.dailyCheck.stressLevel}/10`)
                    }

                    if (summary?.summary) {
                        const textContent = summary.summary.replace(/<[^>]*>/g, '').trim()
                        if (textContent.length > 0) {
                            const preview = textContent.substring(0, 50) + (textContent.length > 50 ? '...' : '')
                            lines.push('─'.repeat(20))
                            lines.push(`${t('charts.moodTrend.note')}: "${preview}"`)
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
            min: 0,
            max: 6,
            ticks: {
                stepSize: 1,
                color: '#7D5A36',
                callback: (value: string | number) => {
                    const labels = ['', '😠', '😢', '😐', '😄', '🎉']
                    return labels[Number(value)] || ''
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
