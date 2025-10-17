<template>
    <div class="glass-effect p-6 rounded-2xl warm-shadow">
        <div class="flex items-start justify-between mb-4">
            <div>
                <h3 class="text-xl font-bold text-[#4E3B2B] flex items-center gap-2">
                    <span>⚡</span>
                    Energy vs Stress
                </h3>
                <p class="text-sm text-[#7D5A36]/80">Discover patterns in your wellbeing</p>
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
        <div class="h-80">
            <Scatter
                :data="chartData"
                :options="chartOptions"
            />
        </div>
        <div class="mt-4 grid grid-cols-2 gap-3">
            <div class="glass-effect p-3 rounded-lg">
                <p class="text-sm text-[#7D5A36]/80">Optimal Zone</p>
                <p class="text-xs text-[#4E3B2B] mt-1">High energy, Low stress</p>
                <div class="mt-2 flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full" style="background: #4ade80"></div>
                    <span class="text-xs">{{ optimalCount }} days</span>
                </div>
            </div>
            <div class="glass-effect p-3 rounded-lg">
                <p class="text-sm text-[#7D5A36]/80">Burnout Risk</p>
                <p class="text-xs text-[#4E3B2B] mt-1">Low energy, High stress</p>
                <div class="mt-2 flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full" style="background: #f87171"></div>
                    <span class="text-xs">{{ burnoutCount }} days</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Scatter } from 'vue-chartjs'
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend } from 'chart.js'
import { useStore } from 'vuex'
import { DaySummary } from '@/store/types'

ChartJS.register(LinearScale, PointElement, Tooltip, Legend)

const store = useStore()
const timeRange = ref(7)

// Get scatter plot data
const scatterData = computed(() => {
    const summaries = store.state.daySummaries as DaySummary[]
    const today = new Date()
    const points: { x: number; y: number; date: string; mood: string }[] = []

    for (let i = timeRange.value - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateString = date.toISOString().split('T')[0]
        const summary = summaries.find(s => s.date === dateString)

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

// Color points based on mood
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

const optimalCount = computed(() => {
    return scatterData.value.filter(p => p.y >= 7 && p.x <= 4).length
})

const burnoutCount = computed(() => {
    return scatterData.value.filter(p => p.y <= 4 && p.x >= 7).length
})

const chartData = computed(() => ({
    datasets: [
        {
            label: 'Energy vs Stress',
            data: scatterData.value.map(point => ({ x: point.x, y: point.y })),
            backgroundColor: scatterData.value.map(point => getPointColor(point.mood)),
            borderColor: scatterData.value.map(point => getPointColor(point.mood)),
            pointRadius: 8,
            pointHoverRadius: 12,
            pointBorderWidth: 2,
            pointBorderColor: '#FAF3E0'
        }
    ]
}))

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
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
                    const point = scatterData.value[context.dataIndex]
                    const moodEmoji = {
                        'happy': '😄',
                        'excited': '🎉',
                        'neutral': '😐',
                        'sad': '😢',
                        'angry': '😠'
                    }[point.mood] || '😐'
                    return [
                        `${moodEmoji} ${point.date}`,
                        `Energy: ${point.y}/10`,
                        `Stress: ${point.x}/10`
                    ]
                }
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
