<template>
    <div class="min-h-screen flex" style="background-color: #F0E9D2;">
        <!-- Sidebar -->
        <div class="w-64 bg-[#D3C9A6] p-5">
            <h2 class="text-[#4E3B2B] mb-5 text-xl font-bold">MoodNotes</h2>
            <nav>
                <ul class="list-none p-0">
                    <li class="mb-2.5">
                        <a href="#" class="text-[#4E3B2B] no-underline flex items-center">
                            <List class="mr-2.5" :size="18" />
                            Home
                        </a>
                    </li>
                    <li class="mb-2.5">
                        <a href="#" class="text-[#4E3B2B] no-underline flex items-center"
                            @click="isDetailedCalendarOpen = true">
                            <Calendar class="mr-2.5" :size="18" />
                            Calendar
                        </a>
                    </li>
                    <li>
                        <a href="#" class="text-[#4E3B2B] no-underline flex items-center"
                            @click="isHabitPopupOpen = true">
                            <BookOpen class="mr-2.5" :size="18" />
                            Habits
                        </a>
                    </li>
                </ul>
            </nav>
        </div>

        <!-- Main Content -->
        <div class="flex-1 p-5 overflow-y-auto">
            <!-- Daily Quote -->
            <div class="bg-[#FAF3E0] p-4 rounded-lg mb-5">
                <p class="text-[#7D5A36] italic text-center">
                    "The only way to do great work is to love what you do." - Steve Jobs
                </p>
            </div>

            <!-- Calendar -->
            <div class="mb-5" @click="testClick">
                <div class="flex justify-between items-center mb-2.5">
                    <h3 class="text-lg font-bold text-[#4E3B2B]">Calendar</h3>
                    <div>
                        <button @click.stop="prevMonth" class="bg-transparent border-0 cursor-pointer mr-2.5">
                            <ChevronLeft color="#4E3B2B" :size="24" />
                        </button>
                        <span class="text-[#4E3B2B] font-bold">
                            {{ currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }) }}
                        </span>
                        <button @click.stop="nextMonth" class="bg-transparent border-0 cursor-pointer ml-2.5">
                            <ChevronRight color="#4E3B2B" :size="24" />
                        </button>
                    </div>
                </div>
                <div class="grid grid-cols-7 gap-2.5 bg-[#FAF3E0] p-4 rounded-lg">
                    <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day"
                        class="text-center font-bold text-[#7D5A36]">
                        {{ day }}
                    </div>
                    <template v-for="(day, index) in calendarDays" :key="index">
                        <div v-if="day.type === 'day'" class="calendar-day"
                            :style="{ backgroundColor: day.emotion.color || '#FFFFFF' }" @click="handleDayClick(day.date)">
                            <div v-if="hasSummary(day.date)" class="emotion-icon">{{ day.emotion.emoji || '⬜️' }}</div>
                            <span>{{ day.day }}</span>
                            <div v-if="hasTasks(day.date)" class="task-indicator"></div>
                            <div v-if="hasSummary(day.date)" class="summary-indicator"></div>
                        </div>
                        <div v-else class="calendar-day empty"></div>
                    </template>
                </div>
            </div>

            <!-- Monthly Summary -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div @click="toggleMonthlySummary"
                    class="bg-[#4E3B2B] p-4 flex justify-between items-center cursor-pointer">
                    <h3 class="text-xl font-bold text-white">Monthly Summary</h3>
                    <ChevronDownIcon :class="{ 'transform rotate-180': isMonthlySummaryOpen }"
                        class="text-white transition-transform duration-300" />
                </div>
                <transition enter-active-class="transition-all duration-300 ease-out"
                    leave-active-class="transition-all duration-300 ease-in" enter-from-class="opacity-0 max-h-0"
                    enter-to-class="opacity-100 max-h-[1000px]" leave-from-class="opacity-100 max-h-[1000px]"
                    leave-to-class="opacity-0 max-h-0">
                    <div v-if="isMonthlySummaryOpen" class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            
                            <!-- Total Words This Month -->
                            <SummaryCard title="Words Written This Month">
                                <p>{{ totalWordsThisMonth }} words</p>
                            </SummaryCard>

                            <!-- Number of Tags This Year -->
                            <SummaryCard title="Unique Tags This Year">
                                <p>{{ numberOfTagsThisYear }} tags</p>
                            </SummaryCard>

                            <!-- Most Used Tag -->
                            <SummaryCard title="Most Used Tag">
                                <p>{{ mostUsedTag || 'No tags used' }}</p>
                            </SummaryCard>

                            <!-- Average Energy Level -->
                            <SummaryCard title="Average Energy Level This Month">
                                <p>{{ averageEnergyLevel }}/10</p>
                            </SummaryCard>

                            <!-- Existing Summary Cards... -->
                            <SummaryCard title="Cumulative Diary Tags">
                                <p>{{ cumulativeDiaryTags }} tags</p>
                            </SummaryCard>

                            <SummaryCard title="Max Words per Entry">
                                <p>{{ maxWordsPerEntry }} words</p>
                            </SummaryCard>

                            <SummaryCard title="Max Entries per Day">
                                <p>{{ maxEntriesPerDay }} entries</p>
                            </SummaryCard>

                            <SummaryCard title="Number of Words in Diary">
                                <p>{{ numberOfWordsInDiary }} words</p>
                            </SummaryCard>

                            <SummaryCard title="Cumulative Diary">
                                <p>{{ cumulativeDiary }} entries</p>
                            </SummaryCard>

                            <SummaryCard title="Cumulative Diary Words">
                                <p>{{ cumulativeDiaryWords }} words</p>
                            </SummaryCard>

                            <SummaryCard title="Record Days">
                                <p>{{ recordDays }} days</p>
                            </SummaryCard>

                            <SummaryCard title="Accumulated Record">
                                <p>{{ accumulatedRecord }}</p>
                            </SummaryCard>

                            <SummaryCard title="Accumulated Word Count">
                                <p>{{ accumulatedWordCount }} words</p>
                            </SummaryCard>

                            <!-- Existing Emotion Stats and Recent Sparks... -->

                        </div>
                    </div>
                </transition>
            </div>

            <!-- Day Summary -->
            <DaySummary 
                v-if="isDaySummaryFormOpen" 
                :selectedDate="selectedDate" 
                @close="closeDaySummary" 
            />
            <div v-else class="mb-5">
                <h3 class="text-lg font-bold text-[#4E3B2B] mb-2.5">Day Summary</h3>
                <button @click="isDaySummaryFormOpen = true"
                    class="flex items-center bg-[#FAF3E0] p-2.5 rounded border-0 cursor-pointer w-full mb-2.5">
                    <FileText color="#7D5A36" :size="24" class="mr-2.5" />
                    <span class="text-[#4E3B2B]">Add or edit day summary</span>
                </button>
            </div>

            <!-- Spark Section -->
            <div class="mb-5">
                <h3 class="text-lg font-bold text-[#4E3B2B] mb-2.5">Today's Spark</h3>
                <div class="flex items-center mb-2.5">
                    <input v-model="newSpark" type="text" placeholder="Add a new spark..."
                        class="flex-1 bg-[#FAF3E0] border-0 rounded p-2.5 mr-2.5 text-[#4E3B2B]" />
                    <button @click="handleAddSpark" class="bg-transparent border-0 cursor-pointer">
                        <Plus color="#7D5A36" :size="24" />
                    </button>
                </div>
                <div class="flex justify-start">
                    <button class="bg-transparent border-0 cursor-pointer mr-5 flex flex-col items-center">
                        <Camera color="#7D5A36" :size="24" />
                        <span class="text-[#4E3B2B] mt-1.5">Photo</span>
                    </button>
                    <button class="bg-transparent border-0 cursor-pointer flex flex-col items-center">
                        <Video color="#7D5A36" :size="24" />
                        <span class="text-[#4E3B2B] mt-1.5">Video</span>
                    </button>
                </div>
            </div>

            <!-- To-Do List -->
            <div>
                <h3 class="text-lg font-bold text-[#4E3B2B] mb-2.5">To-Do List</h3>
                <button @click="isTaskFormOpen = true"
                    class="flex items-center bg-[#FAF3E0] p-2.5 rounded border-0 cursor-pointer w-full mb-2.5">
                    <Plus color="#7D5A36" :size="24" class="mr-2.5" />
                    <span class="text-[#4E3B2B]">Add new task</span>
                </button>
                <div v-for="(task, index) in tasks" :key="index"
                    class="bg-[#FAF3E0] p-2.5 rounded mb-1.5 flex justify-between items-center">
                    <span class="text-[#4E3B2B]">{{ task.description }}</span>
                    <span class="text-[#7D5A36] text-sm">{{ task.priority }}</span>
                </div>
            </div>
        </div>

        <!-- Task Form Modal -->
        <div v-if="isTaskFormOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-[#FAF3E0] max-w-md w-full max-h-[90vh] overflow-y-auto rounded-lg p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-[#4E3B2B]">Create or edit Task</h2>
                    <button @click="isTaskFormOpen = false" class="text-[#7D5A36] hover:text-opacity-80">
                        <X :size="24" />
                    </button>
                </div>

                <form @submit.prevent="handleSaveTask">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-[#4E3B2B] mb-1">Description</label>
                        <textarea v-model="newTask.description"
                            class="w-full px-3 py-2 bg-[#F0E9D2] text-[#4E3B2B] border-[#D3C9A6] rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                            rows="3" placeholder="Take out the trash"></textarea>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-[#4E3B2B] mb-1">Priority</label>
                        <div class="flex flex-wrap gap-2">
                            <label v-for="priority in ['Lowest', 'Low', 'Normal', 'Medium', 'High', 'Highest']"
                                :key="priority" class="flex items-center">
                                <input type="radio" :value="priority" v-model="newTask.priority" class="mr-1" />
                                <span class="text-sm text-[#4E3B2B]">{{ priority }}</span>
                            </label>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-[#4E3B2B] mb-1">Due Date</label>
                        <input v-model="newTask.dueDate" type="date"
                            class="w-full px-3 py-2 bg-[#F0E9D2] text-[#4E3B2B] border-[#D3C9A6] rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50" />
                    </div>

                    <div class="flex justify-end">
                        <button type="submit"
                            class="px-4 py-2 bg-[#7D5A36] text-[#FAF3E0] rounded-md hover:bg-opacity-90 transition-colors">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Day Summary Form Modal -->
        <div v-if="isDaySummaryFormOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-[#FAF3E0] max-w-md w-full max-h-[90vh] overflow-y-auto rounded-lg p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-[#4E3B2B]">Day Summary</h2>
                    <button @click="isDaySummaryFormOpen = false" class="text-[#7D5A36] hover:text-opacity-80">
                        <X :size="24" />
                    </button>
                </div>

                <form @submit.prevent="handleSaveDaySummary">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-[#4E3B2B] mb-1">Summary for {{
                            currentDate.toDateString()
                            }}</label>
                        <textarea v-model="newDaySummary"
                            class="w-full px-3 py-2 bg-[#F0E9D2] text-[#4E3B2B] border-[#D3C9A6] rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                            rows="5" placeholder="Write your day summary here..."></textarea>
                    </div>

                    <div class="flex justify-end">
                        <button type="submit"
                            class="px-4 py-2 bg-[#7D5A36] text-[#FAF3E0] rounded-md hover:bg-opacity-90 transition-colors">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Detailed Calendar Popup -->
        <div v-if="isDetailedCalendarOpen"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-[#FAF3E0] max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-[#4E3B2B]">Detailed Calendar</h2>
                    <button @click="isDetailedCalendarOpen = false" class="text-[#7D5A36] hover:text-opacity-80">
                        <X :size="24" />
                    </button>
                </div>

                <div class="mb-4">
                    <div class="flex justify-between items-center mb-2.5">
                        <button @click="prevMonth" class="bg-transparent border-0 cursor-pointer">
                            <ChevronLeft color="#4E3B2B" :size="24" />
                        </button>
                        <span class="text-[#4E3B2B] font-bold">
                            {{ currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }) }}
                        </span>
                        <button @click="nextMonth" class="bg-transparent border-0 cursor-pointer">
                            <ChevronRight color="#4E3B2B" :size="24" />
                        </button>
                    </div>
                    <div class="grid grid-cols-7 gap-2.5 bg-[#F0E9D2] p-4 rounded-lg">
                        <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day"
                            class="text-center font-bold text-[#7D5A36]">
                            {{ day }}
                        </div>
                        <template v-for="(day, index) in calendarDays" :key="index">
                            <div v-if="day.type === 'day'" class="calendar-day"
                                :style="{ backgroundColor: day.emotion.color }" @click="handleDayClick(day.date)">
                                <div class="emotion-icon">{{ day.emotion.emoji }}</div>
                                <span>{{ day.day }}</span>
                                <div v-if="hasTasks(day.date)" class="task-indicator"></div>
                                <div v-if="hasSummary(day.date)" class="summary-indicator"></div>
                            </div>
                            <div v-else class="calendar-day empty"></div>

                        </template>
                    </div>
                </div>

                <div>
                    <div class="flex gap-5">
                        <div class="flex items-center">
                            <div class="w-3 h-3 rounded-full bg-[#4E3B2B] mr-1.5"></div>
                            <span class="text-[#4E3B2B]">Tasks</span>
                        </div>
                        <div class="flex items-center">
                            <div class="w-3 h-3 rounded-full bg-[#7D5A36] mr-1.5"></div>
                            <span class="text-[#4E3B2B]">Day Summary</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Habit Popup -->
        <div v-if="isHabitPopupOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-[#FAF3E0] max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-[#4E3B2B]">Habits</h2>
                    <button @click="isHabitPopupOpen = false" class="text-[#7D5A36] hover:text-opacity-80">
                        <X :size="24" />
                    </button>
                </div>

                <div class="mb-6">
                    <h3 class="text-lg font-semibold text-[#4E3B2B] mb-4">My Habits</h3>
                    <div class="space-y-4">
                        <div v-for="(habit, index) in habits" :key="index"
                            class="bg-[#F0E9D2] p-4 rounded-lg shadow-md">
                            <div class="flex justify-between items-center">
                                <span class="text-lg font-medium text-[#4E3B2B]">{{ habit.name }}</span>
                                <button @click="openEditHabitModal(habit)" class="text-[#7D5A36] hover:text-opacity-80">
                                    <Edit2 :size="20" />
                                </button>
                            </div>
                            <p class="text-[#7D5A36] mt-2">{{ habit.description }}</p>
                        </div>
                    </div>
                    <button @click="openAddHabitModal"
                        class="mt-4 bg-[#7D5A36] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors flex items-center">
                        <Plus :size="20" class="mr-2" />
                        Add New Habit
                    </button>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-[#4E3B2B] mb-4">Habit Tracking</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full bg-[#F0E9D2] rounded-lg shadow-md">
                            <thead>
                                <tr>
                                    <th class="p-3 text-left text-[#4E3B2B]">Habit</th>
                                    <th v-for="day in 10" :key="day" class="p-3 text-center text-[#4E3B2B] w-16">
                                        {{ formatDate(getDateXDaysAgo(day - 1)) }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(habit, index) in habits" :key="index" class="border-t border-[#D3C9A6]">
                                    <td class="p-3 text-[#4E3B2B]">{{ habit.name }}</td>
                                    <td v-for="day in 10" :key="day" class="p-3 text-center">
                                        <div class="w-6 h-6 rounded-full mx-auto cursor-pointer"
                                            :class="getHabitStatusClass(habit, getDateXDaysAgo(day - 1))"
                                            @click="cycleHabitStatus(habit, getDateXDaysAgo(day - 1))"></div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add/Edit Habit Modal -->
        <div v-if="isHabitModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-[#FAF3E0] p-6 rounded-lg w-full max-w-md">
                <h2 class="text-2xl font-bold text-[#4E3B2B] mb-4">{{ editingHabit ? 'Edit' : 'Add' }} Habit</h2>
                <form @submit.prevent="saveHabit">
                    <div class="mb-4">
                        <label for="habitName" class="block text-[#4E3B2B] mb-2">Habit Name</label>
                        <input id="habitName" v-model="currentHabit.name" type="text"
                            class="w-full p-2 border border-[#D3C9A6] rounded-md bg-[#F0E9D2] text-[#4E3B2B]" required>
                    </div>
                    <div class="mb-4">
                        <label for="habitDescription" class="block text-[#4E3B2B] mb-2">Description</label>
                        <textarea id="habitDescription" v-model="currentHabit.description"
                            class="w-full p-2 border border-[#D3C9A6] rounded-md bg-[#F0E9D2] text-[#4E3B2B]"
                            rows="3"></textarea>
                    </div>
                    <div class="flex justify-end space-x-2">
                        <button type="button" @click="closeHabitModal"
                            class="px-4 py-2 bg-[#D3C9A6] text-[#4E3B2B] rounded-md hover:bg-opacity-90 transition-colors">
                            Cancel
                        </button>
                        <button type="submit"
                            class="px-4 py-2 bg-[#7D5A36] text-white rounded-md hover:bg-opacity-90 transition-colors">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { Calendar, Clock, BookOpen, List, Plus, Camera, Video, ChevronLeft, ChevronRight, ChevronDownIcon, X, CheckCircle2, XCircle, FileText, Edit2 } from 'lucide-vue-next'
import DaySummary from './DaySummary.vue'
import SummaryCard from '../components/SummaryCard.vue'

const store = useStore()

const emotions = [
    { emoji: '😄', color: '#FFD700' },
    { emoji: '😊', color: '#98FB98' },
    { emoji: '😐', color: '#ADD8E6' },
    { emoji: '😔', color: '#DDA0DD' },
    { emoji: '😠', color: '#FF6347' }
]

const currentDate = ref(new Date())
const newSpark = ref('')
const isTaskFormOpen = ref(false)
const isDaySummaryFormOpen = ref(false)
const isDetailedCalendarOpen = ref(false)
const isHabitPopupOpen = ref(false)
const isHabitModalOpen = ref(false)
const tasks = computed(() => store.state.tasks)
const daySummaries = computed(() => store.state.daySummaries)
const habits = computed(() => store.state.habits)
const newTask = ref({
    description: '',
    priority: 'Normal',
    dueDate: '',
})
const newDaySummary = ref('')
const editingHabit = ref(null)
const currentHabit = ref({ name: '', description: '' })
const habitStatus = ref({})
const selectedDate = ref('')

// Helper Functions
const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
}

const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// Updated calendarDays Computed Property
const calendarDays = computed(() => {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)
    const days = []

    // Fill empty slots for previous month days
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push({ type: 'empty' })
    }

    // Populate days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        const dateString = formatDate(date)
        const daySummary = daySummaries.value.find(summary => summary.date === dateString)

        const emotion = daySummary && daySummary.mood
            ? mapMoodToEmotion(daySummary.mood)
            : { emoji: '', color: '#FFFFFF' } // Default blank

        days.push({ type: 'day', day, date, emotion })
    }

    return days
})

// Function to map Mood type to emotion details
const mapMoodToEmotion = (mood) => {
    switch (mood) {
        case 'happy':
            return { emoji: '😄', color: '#FFD700' }
        case 'neutral':
            return { emoji: '😐', color: '#ADD8E6' }
        case 'sad':
            return { emoji: '😔', color: '#DDA0DD' }
        case 'excited':
            return { emoji: '😊', color: '#98FB98' }
        case 'angry':
            return { emoji: '😠', color: '#FF6347' }
        default:
            return { emoji: '', color: '#FFFFFF' }
    }
}

const currentDaySummary = computed(() => {
    const dateString = currentDate.value.toISOString().split('T')[0]
    return daySummaries.value.find(summary => summary.date === dateString)
})

const handleAddSpark = () => {
    // Logic to add new spark
    console.log('New spark:', newSpark.value)
    newSpark.value = ''
}

const handleSaveTask = () => {
    store.dispatch('addTask', { ...newTask.value, id: Date.now() })
    newTask.value = { description: '', priority: 'Normal', dueDate: '' }
    isTaskFormOpen.value = false
}

const handleSaveDaySummary = (summary) => {
    store.dispatch('updateDaySummary', summary)
    isDaySummaryFormOpen.value = false
}

// Handle day click event
const handleDayClick = (date) => {
    selectedDate.value = formatDate(date) // Formats to 'YYYY-MM-DD'
    isDaySummaryFormOpen.value = true
    console.log('isDaySummaryFormOpen:', isDaySummaryFormOpen.value)
    console.log('selectedDate:', selectedDate.value)

    // Force a re-render
    nextTick(() => {
        console.log('After nextTick - isDaySummaryFormOpen:', isDaySummaryFormOpen.value)
    })
}

const closeDaySummary = () => {
    isDaySummaryFormOpen.value = false
    console.log('Day summary closed')
}

const nextMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const prevMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const hasTasks = (date) => {
    const dateString = formatDate(date)
    return tasks.value.some(task => task.dueDate === dateString)
}

const hasSummary = (date) => {
    const dateString = formatDate(date)
    return daySummaries.value.some(summary => summary.date === dateString)
}

const getDateXDaysAgo = (x) => {
    const date = new Date()
    date.setDate(date.getDate() - x)
    return date
}

const openAddHabitModal = () => {
    editingHabit.value = null
    currentHabit.value = { name: '', description: '' }
    isHabitModalOpen.value = true
}

const openEditHabitModal = (habit) => {
    editingHabit.value = habit
    currentHabit.value = { ...habit }
    isHabitModalOpen.value = true
}

const closeHabitModal = () => {
    isHabitModalOpen.value = false
}

const saveHabit = () => {
    if (editingHabit.value) {
        store.dispatch('updateHabit', { ...editingHabit.value, ...currentHabit.value })
    } else {
        const newHabit = { id: Date.now(), ...currentHabit.value, statuses: [] }
        store.dispatch('addHabit', newHabit)
    }
    closeHabitModal()
}

const getHabitStatusClass = (habit, date) => {
    const status = habitStatus.value[`${habit.id}-${formatDate(date)}`]
    if (status === 'did') return 'bg-green-500'
    if (status === 'partial') return 'bg-yellow-500'
    if (status === 'not') return 'bg-red-500'
    return 'bg-gray-200'
}

const cycleHabitStatus = (habit, date) => {
    const key = `${habit.id}-${formatDate(date)}`
    const currentStatus = habitStatus.value[key]
    if (!currentStatus) habitStatus.value[key] = 'did'
    else if (currentStatus === 'did') habitStatus.value[key] = 'partial'
    else if (currentStatus === 'partial') habitStatus.value[key] = 'not'
    else delete habitStatus.value[key]
}

const testClick = () => {
    console.log('Calendar clicked')
}

// Define the current month and year based on currentDate
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

// New Computed Properties for Monthly Summary

// Total words written this month
const totalWordsThisMonth = computed(() => {
    return store.getters.totalWordsThisMonth(currentYear.value, currentMonth.value)
})

// Number of unique tags this year
const numberOfTagsThisYear = computed(() => {
    return store.getters.numberOfTagsThisYear(currentYear.value)
})

// Most used tag this year
const mostUsedTag = computed(() => {
    return store.getters.mostUsedTag(currentYear.value)
})

// Average energy level this month
const averageEnergyLevel = computed(() => {
    return store.getters.averageEnergyLevel(currentYear.value, currentMonth.value)
})

// Additional Computed Properties (if needed)
const cumulativeDiaryTags = computed(() => {
    const tagsSet = new Set()
    daySummaries.value.forEach(summary => {
        if (summary.tags && Array.isArray(summary.tags)) {
            summary.tags.forEach(tag => tagsSet.add(tag))
        }
    })
    return tagsSet.size
})

const maxWordsPerEntry = computed(() => {
    let max = 0
    daySummaries.value.forEach(summary => {
        if (summary.summary) {
            const wordCount = summary.summary.split(/\s+/).length
            if (wordCount > max) {
                max = wordCount
            }
        }
    })
    return max
})

const maxEntriesPerDay = computed(() => {
    const entriesPerDay: { [key: string]: number } = {}
    daySummaries.value.forEach(summary => {
        const date = summary.date
        entriesPerDay[date] = (entriesPerDay[date] || 0) + 1
    })
    let max = 0
    for (const date in entriesPerDay) {
        if (entriesPerDay[date] > max) {
            max = entriesPerDay[date]
        }
    }
    return max
})

const numberOfWordsInDiary = computed(() => {
    let totalWords = 0
    daySummaries.value.forEach(summary => {
        if (summary.summary) {
            totalWords += summary.summary.split(/\s+/).length
        }
    })
    return totalWords
})

const cumulativeDiary = computed(() => {
    return daySummaries.value.length
})

const cumulativeDiaryWords = computed(() => {
    let total = 0
    daySummaries.value.forEach(summary => {
        if (summary.summary) {
            total += summary.summary.split(/\s+/).length
        }
    })
    return total
})

const recordDays = computed(() => {
    // Assuming "record days" are days with entries
    return daySummaries.value.filter(summary => summary.summary && summary.summary.trim() !== '').length
})

const accumulatedRecord = computed(() => {
    // Define what "accumulated record" means. Assuming total number of entries
    return daySummaries.value.length
})

const accumulatedWordCount = computed(() => {
    return daySummaries.value.reduce((acc, summary) => {
        if (summary.summary) {
            return acc + summary.summary.split(/\s+/).length
        }
        return acc
    }, 0)
})

const emotionStats = computed(() => {
    const stats = emotions.map(emotion => ({
        emoji: emotion.emoji,
        count: 0
    }))
    daySummaries.value.forEach(summary => {
        if (summary.mood) {
            const emotion = emotions.find(e => e.emoji === mapMoodToEmotion(summary.mood).emoji)
            if (emotion) {
                const stat = stats.find(s => s.emoji === emotion.emoji)
                if (stat) {
                    stat.count += 1
                }
            }
        }
    })
    return stats
})

const recentSparks = computed(() => {
    return store.state.sparks.slice(-5).reverse() // Last 5 sparks
})

onMounted(() => {
    store.dispatch('loadDaySummaries')
    store.dispatch('loadTasks')
    store.dispatch('loadHabits')
    store.dispatch('loadSparks')
    store.dispatch('loadCalendarEntries')
    console.log('Component mounted')
})
</script>

<style scoped>
.calendar-day {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60px;
    border-radius: 5px;
    color: #4E3B2B;
    transition: transform 0.2s;
    position: relative;
}

.calendar-day:hover {
    transform: scale(1.05);
}

.calendar-day.empty {
    background-color: transparent;
}

.emotion-icon {
    font-size: 20px;
    margin-bottom: 5px;
}

.task-indicator,
.summary-indicator {
    position: absolute;
    bottom: 2px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
}

.task-indicator {
    left: 2px;
    background-color: #4E3B2B;
}

.summary-indicator {
    right: 2px;
    background-color: #7D5A36;
}

.monthly-summary h3 {
    border-bottom: 2px solid #4E3B2B;
    padding-bottom: 4px;
}

.monthly-summary ul li {
    margin-bottom: 4px;
}

@media (min-width: 768px) {
    .monthly-summary .grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 1024px) {
    .monthly-summary .grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

.calendar-day {
    @apply flex flex-col items-center justify-center h-16 rounded-lg text-[#4E3B2B] relative;
}

.calendar-day.empty {
    @apply bg-transparent;
}

.emotion-icon {
    @apply text-2xl mb-1;
}

.task-indicator,
.summary-indicator {
    @apply absolute bottom-1 w-2 h-2 rounded-full;
}

.task-indicator {
    @apply left-1 bg-[#4E3B2B];
}

.summary-indicator {
    @apply right-1 bg-[#7D5A36];
}
</style>
