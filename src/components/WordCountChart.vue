<template>
    <div class="glass-effect p-6 rounded-2xl warm-shadow">
        <div class="flex items-start justify-between mb-4">
            <div>
                <h3 class="text-xl font-bold text-[#4E3B2B] flex items-center gap-2">
                    <span>✍️</span>
                    Writing Activity
                </h3>
                <p class="text-sm text-[#7D5A36]/80">Track your journaling consistency</p>
            </div>
            <select
                v-model="timeRange"
                class="glass-effect px-3 py-2 rounded-lg text-sm text-[#4E3B2B] focus:outline-none focus:ring-2 focus:ring-[#7D5A36]"
            >
                <option value="7">Last 7 days</option>
                <option value="14">Last 14 days</option>
                <option value="30">Last 30 days</option>
            </select>
        </div>
        <div class="h-64">
            <Bar
                :data="chartData"
                :options="chartOptions"
            />
        </div>
        <div class="mt-4 grid grid-cols-3 gap-3 text-center">
            <div class="glass-effect p-3 rounded-lg">
                <p class="text-2xl font-bold text-[#4E3B2B]">{{ totalWords }}</p>
                <p class="text-xs text-[#7D5A36]/70">Total Words</p>
            </div>
            <div class="glass-effect p-3 rounded-lg">
                <p class="text-2xl font-bold text-[#4E3B2B]">{{ averageWords }}</p>
                <p class="text-xs text-[#7D5A36]/70">Avg/Day</p>
            </div>
            <div class="glass-effect p-3 rounded-lg">
                <p class="text-2xl font-bold text-[#4E3B2B]">{{ entriesCount }}</p>
                <p class="text-xs text-[#7D5A36]/70">Entries</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { useStore } from 'vuex'
import { DaySummary } from '@/store/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const store = useStore()
const timeRange = ref(7)

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

    // Generate all dates in range
    for (let i = timeRange.value - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateString = date.toISOString().split('T')[0]

        // O(1) lookup with cached word count
        const data = summariesByDateWithWordCount.value.get(dateString)

        days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
        wordCounts.push(data ? data.wordCount : 0)
    }

    return { days, wordCounts }
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
            borderRadius: 6,
            hoverBackgroundColor: '#7D5A36'
        }
    ]
}))

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    // Disable animations for better performance with larger datasets
    animation: {
        duration: chartDataPoints.value.days.length > 30 ? 0 : 750
    },
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: '#4E3B2B',
            titleColor: '#FAF3E0',
            bodyColor: '#FAF3E0',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
                label: (context: any) => {
                    return `${context.parsed.y} words`
                }
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
