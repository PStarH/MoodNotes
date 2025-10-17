<template>
    <div class="glass-effect p-6 rounded-2xl warm-shadow" role="region" aria-labelledby="energy-stress-title">
        <div class="flex items-start justify-between mb-4">
            <div>
                <h3 id="energy-stress-title" class="text-xl font-bold text-[#4E3B2B] flex items-center gap-2">
                    <span aria-hidden="true">⚡</span>
                    Energy vs Stress
                </h3>
                <p class="text-sm text-[#7D5A36]/80">Discover patterns in your wellbeing</p>
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
                    aria-label="Select time range for energy vs stress chart"
                >
                    <option value="7">Last 7 days</option>
                    <option value="14">Last 14 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="60">Last 60 days</option>
                    <option value="90">Last 90 days</option>
                </select>
            </div>
        </div>
        <div class="h-80 relative" role="img" :aria-label="`Energy vs stress scatter plot showing ${scatterData.length} data points over the last ${timeRange} days`">
            <Scatter
                ref="chartRef"
                :data="chartData"
                :options="chartOptions"
            />
        </div>
        <p class="text-xs text-[#7D5A36]/60 mt-2 text-center" aria-label="Chart interaction instructions">
            <span aria-hidden="true">💡</span> Scroll to zoom, drag to pan in any direction
        </p>
        <div class="mt-4 grid grid-cols-2 gap-3">
            <div class="glass-effect p-3 rounded-lg transition-all hover:scale-105">
                <p class="text-sm text-[#7D5A36]/80">Optimal Zone</p>
                <p class="text-xs text-[#4E3B2B] mt-1">High energy, Low stress</p>
                <div class="mt-2 flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full" style="background: #4ade80"></div>
                    <span class="text-xs">{{ optimalCount }} days ({{ optimalPercentage }}%)</span>
                </div>
            </div>
            <div class="glass-effect p-3 rounded-lg transition-all hover:scale-105">
                <p class="text-sm text-[#7D5A36]/80">Burnout Risk</p>
                <p class="text-xs text-[#4E3B2B] mt-1">Low energy, High stress</p>
                <div class="mt-2 flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full" style="background: #f87171"></div>
                    <span class="text-xs">{{ burnoutCount }} days ({{ burnoutPercentage }}%)</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Scatter } from 'vue-chartjs'
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend } from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import { useStore } from 'vuex'
import { DaySummary } from '@/store/types'

ChartJS.register(LinearScale, PointElement, Tooltip, Legend, zoomPlugin)

const store = useStore()
const timeRange = ref(7)
const chartRef = ref<InstanceType<typeof Scatter> | null>(null)
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

// Color points based on mood with hover effect
const getPointColor = (mood: string): string => {
    const colorMap: { [key: string]: string } = {
        'happy': '#4ade80',
        'excited': '#22c55e',
        'neutral': '#94a3b8',
        'sad': '#60a5fa',
        'angry': '#f87171'
    }
    return colorMap[mood] || '#94a3b8'
}

// Get zone for a given energy and stress level
const getZone = (energy: number, stress: number): string => {
    if (energy >= 7 && stress <= 4) return 'Optimal'
    if (energy <= 4 && stress >= 7) return 'Burnout Risk'
    if (energy >= 7 && stress >= 7) return 'High Intensity'
    if (energy <= 4 && stress <= 4) return 'Low Intensity'
    return 'Balanced'
}

// Optimization: Create Map for O(1) lookups
const summariesByDate = computed(() => {
    const summaries = store.state.daySummaries as DaySummary[]
    const map = new Map<string, DaySummary>()
    summaries.forEach(summary => {
        map.set(summary.date, summary)
    })
    return map
})

// Get scatter plot data
const scatterData = computed(() => {
    const today = new Date()
    const points: { x: number; y: number; date: string; mood: string }[] = []

    for (let i = timeRange.value - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateString = date.toISOString().split('T')[0]

        // O(1) lookup instead of O(n) find
        const summary = summariesByDate.value.get(dateString)

        if (summary?.dailyCheck) {
            points.push({
                x: summary.dailyCheck.stressLevel,
                y: summary.dailyCheck.energyLevel,
                date: dateString,
                mood: summary.mood || 'neutral'
            })
        }
    }

    return points
})

const optimalCount = computed(() => {
    return scatterData.value.filter(p => p.y >= 7 && p.x <= 4).length
})

const burnoutCount = computed(() => {
    return scatterData.value.filter(p => p.y <= 4 && p.x >= 7).length
})

const optimalPercentage = computed(() => {
    if (scatterData.value.length === 0) return 0
    return Math.round((optimalCount.value / scatterData.value.length) * 100)
})

const burnoutPercentage = computed(() => {
    if (scatterData.value.length === 0) return 0
    return Math.round((burnoutCount.value / scatterData.value.length) * 100)
})

// Optimization: Pre-compute colors and data structure to avoid redundant map operations
const chartData = computed(() => {
    const data = scatterData.value.map(point => ({ x: point.x, y: point.y }))
    const colors = scatterData.value.map(point => getPointColor(point.mood))

    return {
        datasets: [
            {
                label: 'Energy vs Stress',
                data,
                backgroundColor: colors,
                borderColor: colors,
                pointRadius: 10,
                pointHoverRadius: 14,
                pointBorderWidth: 2,
                pointHoverBorderWidth: 3,
                pointBorderColor: '#FAF3E0',
                pointHoverBorderColor: '#4E3B2B'
            }
        ]
    }
})

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    // Smooth animations, but disable for larger datasets
    animation: {
        duration: scatterData.value.length > 60 ? 0 : 750,
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
    // Better interaction
    interaction: {
        mode: 'point' as const,
        intersect: true
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
                    const point = scatterData.value[context[0].dataIndex]
                    const date = new Date(point.date)
                    // More precise date display
                    return date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    })
                },
                label: (context: { dataIndex: number; [key: string]: unknown }) => {
                    const point = scatterData.value[context.dataIndex]
                    const summary = summariesByDate.value.get(point.date)
                    const moodEmoji = {
                        'happy': '😄',
                        'excited': '🎉',
                        'neutral': '😐',
                        'sad': '😢',
                        'angry': '😠'
                    }[point.mood] || '😐'

                    const zone = getZone(point.y, point.x)

                    const lines: string[] = []
                    lines.push(`Mood: ${moodEmoji}`)
                    lines.push(`Energy: ${point.y}/10`)
                    lines.push(`Stress: ${point.x}/10`)
                    lines.push('─'.repeat(20))
                    lines.push(`Zone: ${zone}`)

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
                mode: 'xy' as const,
                scaleMode: 'xy' as const,
                onZoomComplete: () => {
                    isZoomed.value = true
                }
            },
            pan: {
                enabled: true,
                mode: 'xy' as const,
                modifierKey: null,
                // Add smooth panning with inertia
                speed: 20,
                threshold: 10
            },
            limits: {
                x: { min: 0, max: 11 },
                y: { min: 0, max: 11 }
            }
        }
    },
    scales: {
        x: {
            title: {
                display: true,
                text: 'Stress Level →',
                color: '#7D5A36',
                font: {
                    size: 14,
                    weight: 600
                }
            },
            min: 0,
            max: 11,
            ticks: {
                color: '#7D5A36',
                stepSize: 1
            },
            grid: {
                color: 'rgba(125, 90, 54, 0.1)'
            }
        },
        y: {
            title: {
                display: true,
                text: '↑ Energy Level',
                color: '#7D5A36',
                font: {
                    size: 14,
                    weight: 600
                }
            },
            min: 0,
            max: 11,
            ticks: {
                color: '#7D5A36',
                stepSize: 1
            },
            grid: {
                color: 'rgba(125, 90, 54, 0.1)'
            }
        }
    }
}))
</script>

