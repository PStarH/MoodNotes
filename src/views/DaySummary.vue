<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-[#FAF3E0] max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg p-6 relative">
            <!-- Main Container with Padding to Avoid Overlap -->
            <div class="relative p-8">

                <!-- Container for Close Button and Export Options -->
                <div class="absolute top-4 right-4 flex items-center space-x-4">
                    <!-- Export Options -->
                    <div class="flex space-x-2">
                        <button @click="exportContent('pdf')"
                            class="bg-[#7D5A36] text-white px-3 py-1 rounded-lg text-sm hover:bg-opacity-90">
                            PDF
                        </button>
                        <button @click="exportContent('md')"
                            class="bg-[#7D5A36] text-white px-3 py-1 rounded-lg text-sm hover:bg-opacity-90">
                            MD
                        </button>
                        <button @click="exportContent('html')"
                            class="bg-[#7D5A36] text-white px-3 py-1 rounded-lg text-sm hover:bg-opacity-90">
                            HTML
                        </button>
                    </div>
                    <!-- Close Button -->
                    <button @click="$emit('close')" class="text-[#7D5A36] hover:text-opacity-80">
                        <X :size="24" />
                    </button>
                </div>

                <!-- Date and Weather/Mood Section -->
                <div class="flex justify-between items-center mt-16 mb-6">
                    <!-- Adjusted top margin (mt-16) to ensure spacing -->
                    <div class="flex items-center space-x-4">
                        <Calendar class="text-[#7D5A36]" />
                        <input type="date" v-model="currentDate"
                            class="bg-[#F0E9D2] text-[#4E3B2B] px-2 py-1 rounded-lg">
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center">
                            <Cloud class="text-[#7D5A36] mr-2" />
                            <span class="text-[#4E3B2B]">{{ weather.description }}</span>
                        </div>
                        <div class="flex items-center">
                            <Smile class="text-[#7D5A36] mr-2" />
                            <select v-model="mood" class="bg-[#F0E9D2] text-[#4E3B2B] px-2 py-1 rounded-lg">
                                <option value="happy">😄 Happy</option>
                                <option value="neutral">😐 Neutral</option>
                                <option value="sad">😢 Sad</option>
                                <option value="excited">🎉 Excited</option>
                                <option value="angry">😠 Angry</option>
                            </select>
                        </div>
                    </div>
                </div>

            </div>


            <!-- Tags Section -->
            <div class="mb-6">
                <h2 class="text-xxl text-[#4E3B2B] font-bold mb-2" style="text-align: left; align-items: left; align-items: left; font-size: 32px; ">Daily Review</h2>
                <div class="text-[#4E3B2B]" style="text-align: left; margin-bottom: 8px;">______________</div>
                <div class="flex flex-wrap items-center gap-2">
                    <h3 class="text-xl font-semibold text-[#4E3B2B] mb-2">Tags</h3>
                    <div v-for="tag in tags" :key="tag" 
                        class="bg-[#7D5A36] text-white px-2 py-1 rounded-full text-sm flex items-center">
                        {{ tag }}
                        <button @click="removeTag(tag)" 
                            class="ml-1 text-xs bg-white text-[#7D5A36] rounded-full w-4 h-4 flex items-center justify-center">
                            &times;
                        </button>
                    </div>
                    <input 
                        v-model="newTag" 
                        @keyup.enter="addTag" 
                        type="text" 
                        placeholder="Add a tag" 
                        class="flex-grow-0 w-32 bg-[#F0E9D2] text-[#4E3B2B] px-2 py-1 rounded-lg text-sm"
                    >
                </div>
            </div>

            <!-- Enhanced Word Editor -->
            <div class="mb-6">
                <div class="bg-white border border-[#D3C9A6] rounded-xl p-2">
                    <div class="flex flex-wrap space-x-2 mb-2">
                        <button @click="applyStyle('bold')" class="p-1 rounded-lg hover:bg-[#F0E9D2]">
                            <Bold class="text-[#7D5A36]" />
                        </button>
                        <button @click="applyStyle('italic')" class="p-1 rounded-lg hover:bg-[#F0E9D2]">
                            <Italic class="text-[#7D5A36]" />
                        </button>
                        <button @click="applyStyle('underline')" class="p-1 rounded-lg hover:bg-[#F0E9D2]">
                            <Underline class="text-[#7D5A36]" />
                        </button>
                        <button @click="applyStyle('strikethrough')" class="p-1 rounded-lg hover:bg-[#F0E9D2]">
                            <Strikethrough class="text-[#7D5A36]" />
                        </button>
                        <select @change="applyHeading($event)" class="bg-[#F0E9D2] text-[#4E3B2B] px-2 py-1 rounded-lg">
                            <option value="">Heading</option>
                            <option value="h1">Heading 1</option>
                            <option value="h2">Heading 2</option>
                            <option value="h3">Heading 3</option>
                        </select>
                        <button @click="applyStyle('insertUnorderedList')" class="p-1 rounded-lg hover:bg-[#F0E9D2]">
                            <List class="text-[#7D5A36]" />
                        </button>
                        <button @click="applyStyle('insertOrderedList')" class="p-1 rounded-lg hover:bg-[#F0E9D2]">
                            <ListOrdered class="text-[#7D5A36]" />
                        </button>
                        <button @click="applyStyle('justifyLeft')" class="p-1 rounded-lg hover:bg-[#F0E9D2]">
                            <AlignLeft class="text-[#7D5A36]" />
                        </button>
                        <button @click="applyStyle('justifyCenter')" class="p-1 rounded-lg hover:bg-[#F0E9D2]">
                            <AlignCenter class="text-[#7D5A36]" />
                        </button>
                        <button @click="applyStyle('justifyRight')" class="p-1 rounded-lg hover:bg-[#F0E9D2]">
                            <AlignRight class="text-[#7D5A36]" />
                        </button>
                        <input type="color" @input="applyColor($event)" class="w-8 h-8 rounded-lg">
                    </div>
                    <div ref="editor" contenteditable="true" class="min-h-[200px] p-2 focus:outline-none"
                        @input="updateContent"></div>
                </div>
            </div>

            <!-- Habit-based To-do List -->
            <div class="mb-6">
                <h2 class="text-xl font-semibold text-[#4E3B2B] mb-2">Daily Habits</h2>
                <div v-for="(habit, index) in habits" :key="index"
                    class="flex items-center justify-between mb-2 bg-[#F0E9D2] p-2 rounded-lg">
                    <div class="flex items-center">
                        <input type="checkbox" :id="'habit-' + index" v-model="habit.completed" class="mr-2">
                        <label :for="'habit-' + index" class="text-[#4E3B2B]">{{ habit.name }}</label>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button @click="cycleHabitStatus(habit, 'did')"
                            :class="{ 'bg-green-500': habit.status === 'did' }"
                            class="w-6 h-6 rounded-full border border-[#7D5A36]"></button>
                        <button @click="cycleHabitStatus(habit, 'partial')"
                            :class="{ 'bg-yellow-500': habit.status === 'partial' }"
                            class="w-6 h-6 rounded-full border border-[#7D5A36]"></button>
                        <button @click="cycleHabitStatus(habit, 'not')"
                            :class="{ 'bg-red-500': habit.status === 'not' }"
                            class="w-6 h-6 rounded-full border border-[#7D5A36]"></button>
                    </div>
                </div>
                <div class="flex items-center mt-2">
                    <input v-model="newHabit" @keyup.enter="addHabit" type="text" placeholder="Add new habit"
                        class="flex-grow bg-[#F0E9D2] text-[#4E3B2B] px-2 py-1 rounded-lg mr-2">
                    <button @click="addHabit" class="bg-[#7D5A36] text-white px-4 py-1 rounded-lg hover:bg-opacity-90">
                        Add
                    </button>
                </div>
            </div>

            <!-- Daily Check -->
            <div class="mb-6">
                <h2 class="text-xl font-semibold text-[#4E3B2B] mb-2">Daily Check</h2>
                <div class="space-y-2">
                    <div class="flex items-center">
                        <span class="mr-2 text-[#4E3B2B]">Energy Level:</span>
                        <input type="range" v-model="dailyCheck.energyLevel" min="1" max="10" class="w-full">
                    </div>
                    <div class="flex items-center">
                        <span class="mr-2 text-[#4E3B2B]">Stress Level:</span>
                        <input type="range" v-model="dailyCheck.stressLevel" min="1" max="10" class="w-full">
                    </div>
                    <div class="flex items-center">
                        <span class="mr-2 text-[#4E3B2B]">Productivity:</span>
                        <input type="range" v-model="dailyCheck.productivity" min="1" max="10" class="w-full">
                    </div>
                </div>
            </div>

            <!-- Media Upload -->
            <div class="mb-6">
                <h2 class="text-xl font-semibold text-[#4E3B2B] mb-2">Media</h2>
                <div class="flex space-x-4">
                    <label class="cursor-pointer bg-[#7D5A36] text-white px-4 py-2 rounded-lg hover:bg-opacity-90">
                        <Image class="inline-block mr-2" />
                        Add Image
                        <input type="file" accept="image/*" @change="handleFileUpload" class="hidden">
                    </label>
                    <label class="cursor-pointer bg-[#7D5A36] text-white px-4 py-2 rounded-lg hover:bg-opacity-90">
                        <Video class="inline-block mr-2" />
                        Add Video
                        <input type="file" accept="video/*" @change="handleFileUpload" class="hidden">
                    </label>
                    <label class="cursor-pointer bg-[#7D5A36] text-white px-4 py-2 rounded-lg hover:bg-opacity-90">
                        <Music class="inline-block mr-2" />
                        Add Audio
                        <input type="file" accept="audio/*" @change="handleFileUpload" class="hidden">
                    </label>
                </div>
                <div v-if="media.length > 0" class="mt-4 grid grid-cols-3 gap-4">
                    <div v-for="(item, index) in media" :key="index" class="relative">
                        <img v-if="item.type.startsWith('image')" :src="item.url"
                            class="w-full h-32 object-cover rounded-lg">
                        <video v-else-if="item.type.startsWith('video')" :src="item.url"
                            class="w-full h-32 object-cover rounded-lg" controls></video>
                        <audio v-else-if="item.type.startsWith('audio')" :src="item.url" class="w-full"
                            controls></audio>
                        <button @click="removeMedia(index)"
                            class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1">
                            <X size="16" />
                        </button>
                    </div>
                </div>
            </div>

            <!-- Comfort Zone Entry -->
            <div class="mb-6">
                <h2 class="text-xl font-semibold text-[#4E3B2B] mb-2">Comfort Zone Entry</h2>
                <textarea v-model="comfortZoneEntry"
                    placeholder="Did you step out of your comfort zone today? How did it feel?"
                    class="w-full h-32 bg-[#F0E9D2] text-[#4E3B2B] p-2 rounded-lg resize-none"></textarea>
            </div>

            <!-- Custom Sections -->
            <div v-for="(section, index) in customSections" :key="index" class="mb-6">
                <h2 class="text-xl font-semibold text-[#4E3B2B] mb-2">{{ section.title }}</h2>
                <div class="bg-[#F0E9D2] text-[#4E3B2B] p-2 rounded-lg">{{ section.content }}</div>
            </div>

            <!-- Add Custom Section -->
            <div class="mb-6">
                <button @click="showAddSection = true" v-if="!showAddSection"
                    class="bg-[#7D5A36] text-white px-4 py-2 rounded-lg hover:bg-opacity-90">
                    Add Custom Section
                </button>
                <div v-if="showAddSection" class="bg-[#F0E9D2] p-4 rounded-lg">
                    <input v-model="newSectionTitle" type="text" placeholder="Section Title"
                        class="w-full mb-2 px-2 py-1 rounded-lg">
                    <textarea v-model="newSectionContent" placeholder="Section Content"
                        class="w-full h-32 mb-2 px-2 py-1 rounded-lg resize-none"></textarea>
                    <div class="flex justify-end space-x-2">
                        <button @click="saveCustomSection"
                            class="bg-[#7D5A36] text-white px-4 py-2 rounded-lg hover:bg-opacity-90">
                            Save Section
                        </button>
                        <button @click="showAddSection = false"
                            class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-opacity-90">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Save Button (Bottom Right Corner) -->
        <div class="fixed bottom-4 right-4">
            <button @click="saveAll"
                class="bg-[#7D5A36] text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-opacity-90 shadow-lg">
                Save All
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { Calendar, Cloud, Smile, Bold, Italic, Underline, Strikethrough, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Image, Video, Music, X } from 'lucide-vue-next'

const store = useStore()
const props = defineProps(['selectedDate'])

const currentDate = ref(props.selectedDate || new Date().toISOString().split('T')[0])
const weather = ref({ description: 'Loading...' })
const mood = ref('happy')
const editor = ref(null)
const content = ref('')
const habits = ref([])
const newHabit = ref('')
const media = ref([])
const comfortZoneEntry = ref('')
const dailyCheck = ref({
    energyLevel: 5,
    stressLevel: 5,
    productivity: 5
})
const customSections = ref([])
const newSectionTitle = ref('')
const newSectionContent = ref('')
const showAddSection = ref(false)
const tags = ref([])
const newTag = ref('')

const daySummary = computed(() => store.getters.getDaySummary(currentDate.value))

onMounted(() => {
    if (daySummary.value) {
        content.value = daySummary.value.summary
        mood.value = daySummary.value.mood
        weather.value.description = daySummary.value.weather
        habits.value = daySummary.value.habits
        dailyCheck.value = daySummary.value.dailyCheck
        comfortZoneEntry.value = daySummary.value.comfortZoneEntry
        customSections.value = daySummary.value.customSections
        tags.value = daySummary.value.tags
        media.value = daySummary.value.media
    }

    if (editor.value) {
        editor.value.innerHTML = content.value
        editor.value.focus()
    }

    // Simulating weather API call
    setTimeout(() => {
        if (!weather.value.description || weather.value.description === 'Loading...') {
            weather.value = { description: 'Partly cloudy, 22°C' }
        }
    }, 1000)
})

const updateContent = () => {
    content.value = editor.value.innerHTML
}

const applyStyle = (style) => {
    document.execCommand(style, false, null)
}

const applyHeading = (event) => {
    const heading = event.target.value
    if (heading) {
        document.execCommand('formatBlock', false, heading)
    }
}

const applyColor = (event) => {
    document.execCommand('foreColor', false, event.target.value)
}

const addHabit = () => {
    if (newHabit.value.trim()) {
        habits.value.push({ name: newHabit.value, completed: false, status: null })
        newHabit.value = ''
    }
}

const cycleHabitStatus = (habit, status) => {
    habit.status = habit.status === status ? null : status
}

const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            media.value.push({
                type: file.type,
                url: e.target.result
            })
        }
        reader.readAsDataURL(file)
    }
}

const removeMedia = (index) => {
    media.value.splice(index, 1)
}

const saveCustomSection = () => {
    if (newSectionTitle.value.trim() && newSectionContent.value.trim()) {
        customSections.value.push({
            title: newSectionTitle.value,
            content: newSectionContent.value
        })
        newSectionTitle.value = ''
        newSectionContent.value = ''
        showAddSection.value = false
    }
}

const addTag = () => {
    if (newTag.value.trim() && !tags.value.includes(newTag.value.trim())) {
        tags.value.push(newTag.value.trim())
        newTag.value = ''
    }
}

const removeTag = (tag) => {
    tags.value = tags.value.filter(t => t !== tag)
}

const saveAll = () => {
    const summary = {
        date: currentDate.value,
        summary: content.value,
        mood: mood.value,
        weather: weather.value.description,
        habits: habits.value,
        dailyCheck: dailyCheck.value,
        comfortZoneEntry: comfortZoneEntry.value,
        customSections: customSections.value,
        tags: tags.value,
        media: media.value
    }
    store.dispatch('updateDaySummary', summary)
}

const exportContent = (format) => {
    let exportedContent = `
      Date: ${currentDate.value}
      Weather: ${weather.value.description}
      Mood: ${mood.value}
      Tags: ${tags.value.join(', ')}
  
      ${content.value}
  
      Daily Habits:
      ${habits.value.map(habit => `- [${habit.completed ? 'x' : ' '}] ${habit.name} (${habit.status || 'not set'})`).join('\n')}
  
      Daily Check:
      - Energy Level: ${dailyCheck.value.energyLevel}/10
      - Stress Level: ${dailyCheck.value.stressLevel}/10
      - Productivity: ${dailyCheck.value.productivity}/10
  
      Comfort Zone Entry:
      ${comfortZoneEntry.value}
  
      ${customSections.value.map(section => `
      ${section.title}:
      ${section.content}
      `).join('\n')}
    `

    if (format === 'pdf') {
        // Implement PDF export (you may need a library like jsPDF)
        console.log('Exporting as PDF:', exportedContent)
    } else if (format === 'md') {
        // Implement Markdown export
        console.log('Exporting as Markdown:', exportedContent)
    } else if (format === 'html') {
        // Implement HTML export
        const htmlContent = `
        <html>
          <body>
            <h1>Day Summary - ${currentDate.value}</h1>
            <p>Weather: ${weather.value.description}</p>
            <p>Mood: ${mood.value}</p>
            <p>Tags: ${tags.value.join(', ')}</p>
            <div>${content.value}</div>
            <h2>Daily Habits</h2>
            <ul>
              ${habits.value.map(habit => `<li><input type="checkbox" ${habit.completed ? 'checked' : ''}> ${habit.name} (${habit.status || 'not set'})</li>`).join('')}
            </ul>
            <h2>Daily Check</h2>
            <ul>
              <li>Energy Level: ${dailyCheck.value.energyLevel}/10</li>
              <li>Stress Level: ${dailyCheck.value.stressLevel}/10</li>
              <li>Productivity: ${dailyCheck.value.productivity}/10</li>
            </ul>
            <h2>Comfort Zone Entry</h2>
            <p>${comfortZoneEntry.value}</p>
            ${customSections.value.map(section => `
              <h2>${section.title}</h2>
              <p>${section.content}</p>
            `).join('')}
          </body>
        </html>
      `
        console.log('Exporting as HTML:', htmlContent)
    }
}
</script>

<style scoped>
/* Add any additional styles here */
</style>
