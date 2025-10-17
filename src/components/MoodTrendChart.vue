<template>
    <div class="glass-effect p-6 rounded-2xl warm-shadow">
        <div class="flex items-start justify-between mb-4">
            <div>
                <h3 class="text-xl font-bold text-[#4E3B2B] flex items-center gap-2">
                    <span>📈</span>
                    Mood Trend
                </h3>
                <p class="text-sm text-[#7D5A36]/80">Your emotional journey over time</p>
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
            <Line
                :data="chartData"
                :options="chartOptions"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { useStore } from 'vuex'
import { DaySummary } from '@/store/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const store = useStore()
const timeRange = ref(7)

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

// Get data for the selected time range
const chartDataPoints = computed(() => {
    const today = new Date()
    const days: string[] = []
    const values: number[] = []

    // Generate all dates in range
    for (let i = timeRange.value; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateString = date.toISOString().split('T')[0]

        // O(1) lookup instead of O(n) find
        const summary = summariesByDate.value.get(dateString)

        days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
        values.push(summary ? moodToValue(summary.mood) : 3) // Default to neutral if no entry
    }

    return { days, values }
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
            pointHoverRadius: 8,
            pointBackgroundColor: '#7D5A36',
            pointBorderColor: '#FAF3E0',
            pointBorderWidth: 2
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
                    const value = context.parsed.y
                    const moodLabels = ['', 'Angry 😠', 'Sad 😢', 'Neutral 😐', 'Happy 😄', 'Excited 🎉']
                    return moodLabels[value] || 'Unknown'
                }
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
