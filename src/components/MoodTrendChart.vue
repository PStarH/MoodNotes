<template>
    <div class="glass-effect p-6 rounded-2xl warm-shadow" role="region" aria-labelledby="mood-trend-title">
        <div class="flex items-start justify-between mb-4">
            <div>
                <h3 id="mood-trend-title" class="text-xl font-bold text-[#4E3B2B] flex items-center gap-2">
                    <span aria-hidden="true">📈</span>
                    Mood Trend
                </h3>
                <p class="text-sm text-[#7D5A36]/80">Your emotional journey over time</p>
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
                    aria-label="Select time range for mood trend chart"
                >
                    <option value="7">Last 7 days</option>
                    <option value="14">Last 14 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="60">Last 60 days</option>
                    <option value="90">Last 90 days</option>
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
            <span aria-hidden="true">💡</span> Scroll to zoom horizontally, drag to pan left/right
        </p>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import { useStore } from 'vuex'
import { DaySummary } from '@/store/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, zoomPlugin)

const store = useStore()
const timeRange = ref(7)
const chartRef = ref<InstanceType<typeof Line> | null>(null)
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

        days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
        rawDates.push(dateString)
        values.push(summary ? moodToValue(summary.mood) : 3) // Default to neutral if no entry
    }

    return { days, values, rawDates }
})

const chartData = computed(() => ({
    labels: chartDataPoints.value.days,
    datasets: [
        {
            label: 'Mood Level',
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
                    const summary = summariesByDate.value.get(rawDate)
                    const value = context.parsed.y
                    const moodLabels = ['', 'Angry 😠', 'Sad 😢', 'Neutral 😐', 'Happy 😄', 'Excited 🎉']

                    const lines: string[] = []
                    lines.push(`Mood: ${moodLabels[value] || 'Unknown'}`)

                    if (summary?.dailyCheck) {
                        lines.push(`Energy: ${summary.dailyCheck.energyLevel}/10`)
                        lines.push(`Stress: ${summary.dailyCheck.stressLevel}/10`)
                    }

                    if (summary?.summary) {
                        const textContent = summary.summary.replace(/<[^>]*>/g, '').trim()
                        if (textContent.length > 0) {
                            const preview = textContent.substring(0, 50) + (textContent.length > 50 ? '...' : '')
                            lines.push('─'.repeat(20))
                            lines.push(`Note: "${preview}"`)
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
            min: 0,
            max: 6,
            ticks: {
                stepSize: 1,
                color: '#7D5A36',
                callback: (value: number) => {
                    const labels = ['', '😠', '😢', '😐', '😄', '🎉']
                    return labels[value] || ''
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
