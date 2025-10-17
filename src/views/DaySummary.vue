<template>
    <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 overflow-auto p-4">
        <div
            ref="modalRef"
            class="glass-effect w-full max-w-5xl mx-auto my-4 max-h-[95vh] overflow-y-auto rounded-2xl p-4 sm:p-8 warm-shadow-lg bounce-in custom-scrollbar"
            role="dialog"
            aria-labelledby="day-summary-title"
            aria-modal="true"
        >
            <!-- Main Container with Padding to Avoid Overlap -->
            <div class="relative pb-20">

                <!-- Container for Close Button and Export Options -->
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-[#D3C9A6]">
                    <h2 id="day-summary-title" class="text-xl sm:text-2xl font-bold text-[#4E3B2B]">Daily Review</h2>
                    <div class="flex items-center gap-2 flex-wrap" role="group" aria-label="Document actions">
                        <!-- Export Options -->
                        <button
                            @click="exportContent('pdf')"
                            class="bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white px-3 py-2 rounded-lg text-xs hover-lift transition-all duration-200 warm-shadow flex items-center"
                            aria-label="Export as PDF"
                        >
                            <span aria-hidden="true">📜</span>
                        </button>
                        <button
                            @click="exportContent('md')"
                            class="bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white px-3 py-2 rounded-lg text-xs hover-lift transition-all duration-200 warm-shadow flex items-center"
                            aria-label="Export as Markdown"
                        >
                            <span aria-hidden="true">📝</span>
                        </button>
                        <button
                            @click="exportContent('html')"
                            class="bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white px-3 py-2 rounded-lg text-xs hover-lift transition-all duration-200 warm-shadow flex items-center"
                            aria-label="Export as HTML"
                        >
                            <span aria-hidden="true">🌐</span>
                        </button>
                        <button
                            v-if="daySummary"
                            @click="deleteDaySummary"
                            class="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg text-xs hover-lift transition-all duration-200 warm-shadow flex items-center"
                            aria-label="Delete this entry"
                        >
                            <span aria-hidden="true">🗑️</span>
                        </button>
                        <!-- Close Button -->
                        <button
                            type="button"
                            @click="$emit('close')"
                            class="text-[#7D5A36] hover:text-opacity-80 p-2 hover:bg-[#7D5A36] hover:bg-opacity-10 rounded-lg transition-all"
                            aria-label="Close daily review"
                        >
                            <X :size="24" aria-hidden="true" />
                        </button>
                    </div>
                </div>

                <div class="daily-review fade-in">
                    <div class="surface-card daily-review__info-card">
                        <div class="daily-review__row">
                            <div class="meta-icon" aria-hidden="true">
                                <Calendar class="meta-icon__glyph" />
                            </div>
                            <div class="flex-1">
                                <label for="entry-date" class="sr-only">Entry date</label>
                                <input
                                    id="entry-date"
                                    type="date"
                                    v-model="currentDate"
                                    class="date-input"
                                    aria-label="Select entry date"
                                >
                            </div>
                        </div>
                        <div class="daily-review__row" role="status" aria-live="polite">
                            <div class="meta-icon" aria-hidden="true">
                                <Cloud class="meta-icon__glyph" />
                            </div>
                            <div>
                                <p class="meta-label">Weather</p>
                                <p class="meta-value">{{ weather.description }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="daily-review__split">
                        <div class="surface-card daily-review__tags-card slide-in">
                            <h3 id="tags-section" class="card-title flex items-center">
                                <span class="mr-2" aria-hidden="true">🏷️</span>Tags
                            </h3>
                            <div class="daily-review__tags-flow">
                                <div
                                    v-for="tag in tags"
                                    :key="tag"
                                    class="tag-chip"
                                    role="group"
                                    :aria-label="`Tag: ${tag}`"
                                >
                                    {{ tag }}
                                    <button
                                        @click="removeTag(tag)"
                                        class="tag-chip__remove"
                                        :aria-label="`Remove tag ${tag}`"
                                    >
                                        &times;
                                    </button>
                                </div>
                                <label for="new-tag-input" class="sr-only">Add a new tag</label>
                                <input
                                    id="new-tag-input"
                                    v-model="newTag"
                                    @keyup.enter="addTag"
                                    type="text"
                                    placeholder="Add a tag"
                                    class="tag-input"
                                    aria-label="Type a new tag and press Enter to add"
                                >
                            </div>
                        </div>

                        <div class="surface-card mood-card bounce-in">
                            <MoodPicker
                                v-model="mood"
                                :options="moodOptions"
                                :default-caption="'Let the journal know how the day feels'"
                                class="mood-card__picker"
                            />
                        </div>
                    </div>

                    <div class="surface-card daily-review__editor-card bounce-in">
                        <label for="quill-editor" class="sr-only">Journal entry content</label>
                        <div class="editor-shell">
                            <div
                                v-if="isQuillLoading"
                                class="editor-surface editor-surface--loading"
                                role="status"
                                aria-live="polite"
                            >
                                <div class="animate-pulse space-y-3">
                                    <div class="flex space-x-2 mb-4 pb-4 border-b border-[#E2D9C8]">
                                        <div class="skeleton-chip w-24"></div>
                                        <div class="skeleton-chip w-20"></div>
                                        <div class="skeleton-chip w-16"></div>
                                    </div>
                                    <div class="skeleton-bar"></div>
                                    <div class="skeleton-bar short"></div>
                                    <div class="skeleton-bar short"></div>
                                </div>
                                <p class="text-sm text-[#7D5A36] mt-3 text-center">Loading editor...</p>
                            </div>
                            <div
                                v-show="!isQuillLoading"
                                id="quill-editor"
                                ref="quillEditor"
                                class="editor-surface editor-surface--quill"
                                aria-label="Rich text editor for journal entry"
                            ></div>
                        </div>
                    </div>
                </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, watchEffect, nextTick, onUnmounted, Ref } from 'vue'
import { useStore } from 'vuex'
import { X, Calendar, Cloud, Image, Video, Music } from 'lucide-vue-next'
import type Quill from 'quill'
import { jsPDF } from 'jspdf'
import DOMPurify from 'dompurify'
import { DaySummary as DaySummaryType, DaySummaryHabit, MediaItem, CustomSection, HabitStatus } from '../store/types'
import { useToast } from '@/composables/useToast'
import { useMediaManager } from '@/composables/useMediaManager'
import { useModalFocus } from '@/composables/useFocusTrap'
import { useHistoricalComparison } from '@/composables/useHistoricalComparison'
import MoodPicker from '@/components/MoodPicker.vue'

const emit = defineEmits(['close'])

const store = useStore()
const props = defineProps(['selectedDate'])
const toast = useToast()
const { uploadFile } = useMediaManager()
const { containerRef: modalRef } = useModalFocus({ initialFocus: '#entry-date', returnFocus: true, onEscape: () => emit('close') })

// Convert currentDate string to Date for historical comparison
const currentDateAsDate = computed(() => new Date(currentDate.value))
const {
    hasHistoricalData,
    lastYearDateString,
    lastYearMood,
    lastYearTags,
    lastYearSummaryPreview,
    lastYearDailyCheck
} = useHistoricalComparison(currentDateAsDate)

const currentDate = ref(props.selectedDate || new Date().toISOString().split('T')[0])
const weather = ref({ description: 'Loading...' })
const mood = ref('happy')
const quillEditor = ref(null)
const content = ref('')
const habits: Ref<DaySummaryHabit[]> = ref([])
const media: Ref<MediaItem[]> = ref([])
const comfortZoneEntry = ref('')
const dailyCheck = ref({
    energyLevel: 5,
    stressLevel: 5,
    productivity: 5
})
const customSections: Ref<CustomSection[]> = ref([])
const newSectionTitle = ref('')
const newSectionContent = ref('')
const showAddSection = ref(false)
const tags: Ref<string[]> = ref([])
const newTag = ref('')
const isSaving = ref(false)
const saveSuccess = ref(false)
const isQuillLoading = ref(false)

const moodOptions = [
    { value: 'happy', label: 'Happy', emoji: '😄', caption: 'Bright and optimistic vibes' },
    { value: 'neutral', label: 'Neutral', emoji: '😐', caption: 'Steady and grounded today' },
    { value: 'sad', label: 'Sad', emoji: '😢', caption: 'A softer, reflective mood' },
    { value: 'excited', label: 'Excited', emoji: '🎉', caption: 'Energized and full of spark' },
    { value: 'angry', label: 'Angry', emoji: '😠', caption: 'Tension worth unpacking' }
]

watchEffect(() => {
    if (!moodOptions.some(option => option.value === mood.value)) {
        mood.value = moodOptions[0].value
    }
})

const daySummary = computed(() => store.getters.getDaySummary(currentDate.value))

// Define helper functions first
const updateQuillContent = (newContent: string) => {
    if (quillInstance.value) {
        const currentContent = quillInstance.value.root.innerHTML
        if (currentContent !== newContent) {
            quillInstance.value.root.innerHTML = newContent
        }
    }
}

// Load existing data function - defined before it's used
const loadExistingData = () => {
    const existingSummary = store.getters.getDaySummary(currentDate.value)
    if (existingSummary) {
        content.value = existingSummary.summary || ''
        mood.value = existingSummary.mood || 'happy'
        weather.value = { description: existingSummary.weather || 'Partly cloudy, 22°C' }
        habits.value = existingSummary.habits || []
        dailyCheck.value = existingSummary.dailyCheck || { energyLevel: 5, stressLevel: 5, productivity: 5 }
        comfortZoneEntry.value = existingSummary.comfortZoneEntry || ''
        customSections.value = existingSummary.customSections || []
        tags.value = existingSummary.tags || []
        media.value = existingSummary.media || []
        
        // Update Quill content
        nextTick(() => {
            updateQuillContent(content.value)
        })
    }
}

// Watch for selectedDate changes
watch(() => props.selectedDate, (newDate) => {
    currentDate.value = newDate || new Date().toISOString().split('T')[0]
    loadExistingData()
}, { immediate: true })

watch(daySummary, (newSummary) => {
    if (newSummary) {
        content.value = newSummary.summary
        updateQuillContent(content.value)
    } else {
        content.value = ''
        updateQuillContent('')
    }
})

const quillInstance = ref<Quill | null>(null)

const initializeQuill = async () => {
    if (quillInstance.value) return // Already initialized

    await nextTick() // Ensure the DOM is updated

    if (!quillEditor.value) return

    isQuillLoading.value = true

    try {
        // Dynamically import Quill and its styles
        const [QuillModule] = await Promise.all([
            import('quill'),
            import('quill/dist/quill.snow.css')
        ])

        const Quill = QuillModule.default

        quillInstance.value = new Quill(quillEditor.value, {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'header': 1 }, { 'header': 2 }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'script': 'sub'}, { 'script': 'super' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    [{ 'direction': 'rtl' }],
                    [{ 'size': ['small', false, 'large', 'huge'] }],
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'font': [] }],
                    [{ 'align': [] }],
                    ['clean']
                ]
            }
        });

        quillInstance.value.on('text-change', () => {
            content.value = quillInstance.value?.root.innerHTML || ''
        })

        if (content.value) {
            updateQuillContent(content.value)
        }
    } catch (error) {
        console.error('Failed to load Quill editor:', error)
        toast.error('Failed to load rich text editor. Please refresh the page.', 'Editor Error')
    } finally {
        isQuillLoading.value = false
    }
}

onMounted(async () => {
    await store.dispatch('loadDaySummaries')
    store.dispatch('loadTasks')
    store.dispatch('loadHabits')
    store.dispatch('loadSparks')
    store.dispatch('loadCalendarEntries')

    // Load habits from store and populate with current day's status
    const storeHabits = store.getters.getHabits
    habits.value = storeHabits.map((habit: any) => {
        // Find status for current date
        const todayStatus = habit.statuses?.find((s: HabitStatus) => s.date === currentDate.value)
        return {
            id: habit.id,
            name: habit.name,
            completed: todayStatus?.status === 'did',
            status: todayStatus?.status || null
        }
    })

    setTimeout(() => {
        if (!weather.value.description || weather.value.description === 'Loading...') {
            weather.value = { description: 'Partly cloudy, 22°C' }
        }
    }, 1000)

    await initializeQuill()
    loadExistingData()
})

watch(() => daySummary.value, async (newSummary) => {
    if (newSummary) {
        content.value = newSummary.summary || ''
        await nextTick()
        updateQuillContent(content.value)
    } else {
        content.value = ''
        await nextTick()
        updateQuillContent('')
    }
})

const cycleHabitStatus = async (habit: DaySummaryHabit, status: 'did' | 'partial' | 'not') => {
    const newStatus = habit.status === status ? null : status
    habit.status = newStatus

    // Update in store for persistence
    try {
        await store.dispatch('updateHabitStatus', {
            habitId: habit.id,
            date: currentDate.value,
            status: newStatus
        })

        // Also update completed checkbox based on status
        habit.completed = newStatus === 'did'
    } catch (error) {
        toast.error('Failed to update habit status', 'Error')
    }
}

const handleFileUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    // Limit total media files to prevent memory issues
    const MAX_MEDIA_COUNT = 20
    if (media.value.length >= MAX_MEDIA_COUNT) {
        toast.error(`Maximum ${MAX_MEDIA_COUNT} media files allowed per entry`, 'Media Limit Reached')
        target.value = '' // Reset input
        return
    }

    // Upload using media manager (handles validation and storage)
    const mediaFile = await uploadFile(file)

    if (mediaFile) {
        // Convert MediaFile to MediaItem format for backward compatibility
        media.value.push({
            type: mediaFile.type,
            url: mediaFile.url,
            filename: mediaFile.filename,
            id: mediaFile.id
        })
        // Note: toast is already shown by uploadFile
    }

    target.value = '' // Reset input for next upload
}

const removeMedia = (index: number) => {
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

const removeTag = (tag: string) => {
    tags.value = tags.value.filter(t => t !== tag)
}

const saveAll = () => {
    isSaving.value = true
    saveSuccess.value = false

    const summaryData: DaySummaryType = {
        date: currentDate.value,
        summary: content.value || '',
        mood: mood.value,
        weather: weather.value.description,
        habits: habits.value,
        dailyCheck: dailyCheck.value,
        comfortZoneEntry: comfortZoneEntry.value || '',
        customSections: customSections.value,
        tags: tags.value,
        media: media.value
    }

    // Save to store
    store.dispatch('updateDaySummary', summaryData)
        .then(() => {
            isSaving.value = false
            saveSuccess.value = true
            toast.success('Your day summary has been saved successfully!', 'Saved')

            // Close after brief success display
            setTimeout(() => {
                saveSuccess.value = false
                emit('close')
            }, 1500)
        })
        .catch((error) => {
            console.error('⚠️ Failed to save day summary:', error)
            isSaving.value = false
            toast.error('Could not save your summary. Please try again.', 'Save Failed')
        })
}

const deleteDaySummary = () => {
    if (confirm('Are you sure you want to delete this day summary? This action cannot be undone.')) {
        store.dispatch('deleteDaySummary', currentDate.value)
            .then(() => {
                toast.success('Day summary deleted successfully.', 'Deleted')
                emit('close')
            })
            .catch((error) => {
                console.error('⚠️ Failed to delete day summary:', error)
                toast.error('Could not delete the summary. Please try again.', 'Delete Failed')
            })
    }
}

const exportContent = (format: 'pdf' | 'md' | 'html') => {
    let sanitizedContent = DOMPurify.sanitize(content.value)

    let exportedContent = `
      Date: ${currentDate.value}
      Weather: ${weather.value.description}
      Mood: ${mood.value}
      Tags: ${tags.value.join(', ')}

      ${sanitizedContent}

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
        const doc = new jsPDF()
        doc.text(exportedContent, 10, 10)
        doc.save(`DaySummary_${currentDate.value}.pdf`)
        toast.success(`Exported as PDF: DaySummary_${currentDate.value}.pdf`, 'Export Successful')
    } else if (format === 'md') {
        const markdownBlob = new Blob([exportedContent], { type: 'text/markdown' })
        const url = URL.createObjectURL(markdownBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `DaySummary_${currentDate.value}.md`
        link.click()
        URL.revokeObjectURL(url)
        toast.success(`Exported as Markdown: DaySummary_${currentDate.value}.md`, 'Export Successful')
    } else if (format === 'html') {
        const htmlContent = `
        <html>
          <body>
            <h1>Day Summary - ${currentDate.value}</h1>
            <p>Weather: ${weather.value.description}</p>
            <p>Mood: ${mood.value}</p>
            <p>Tags: ${tags.value.join(', ')}</p>
            <div>${sanitizedContent}</div>
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
        const htmlBlob = new Blob([htmlContent], { type: 'text/html' })
        const url = URL.createObjectURL(htmlBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `DaySummary_${currentDate.value}.html`
        link.click()
        URL.revokeObjectURL(url)
        toast.success(`Exported as HTML: DaySummary_${currentDate.value}.html`, 'Export Successful')
    }
}

// Cleanup on unmount to prevent memory leaks
onUnmounted(() => {
    if (quillInstance.value) {
        quillInstance.value = null
    }
})
</script>

<style scoped>
.daily-review {
    display: flex;
    flex-direction: column;
    gap: 24px;
    background: #FAF8F4;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 20px 40px rgba(78, 59, 43, 0.08);
}

.surface-card {
    background: #FFF9F0;
    border-radius: 20px;
    padding: 24px;
    border: 1px solid rgba(125, 90, 54, 0.14);
    box-shadow: 0 12px 28px rgba(78, 59, 43, 0.08);
}


.daily-review__split {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(220px, 0.35fr);
    gap: 24px;
}

@media (max-width: 1024px) {
    .daily-review__split {
        grid-template-columns: 1fr;
    }
}

.daily-review__info-card {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.daily-review__row {
    display: flex;
    align-items: center;
    gap: 16px;
}

.meta-icon {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(255, 244, 219, 0.85), rgba(255, 236, 200, 0.9));
    box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.6);
}

.meta-icon__glyph {
    width: 22px;
    height: 22px;
    color: #7D5A36;
}

.date-input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 14px;
    border: 1px solid rgba(125, 90, 54, 0.25);
    background: #FFFFFF;
    color: #4E3B2B;
    font-weight: 500;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.date-input:focus {
    outline: none;
    border-color: #7D5A36;
    box-shadow: 0 0 0 3px rgba(125, 90, 54, 0.22);
}

.meta-label {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(125, 90, 54, 0.6);
}

.meta-value {
    font-size: 1.05rem;
    font-weight: 600;
    color: #4E3B2B;
}

.daily-review__tags-card {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.card-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #4E3B2B;
    margin-bottom: 4px;
}

.daily-review__tags-flow {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
}

.tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 999px;
    background: linear-gradient(135deg, #7D5A36, #6B4A2E);
    color: #FFFFFF;
    font-size: 0.85rem;
    font-weight: 600;
    box-shadow: 0 10px 18px rgba(125, 90, 54, 0.18);
}

.tag-chip__remove {
    background: #FFFFFF;
    color: #7D5A36;
    border: none;
    width: 20px;
    height: 20px;
    line-height: 1;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.2s ease;
}

.tag-chip__remove:hover {
    background: rgba(255, 255, 255, 0.7);
}

.tag-input {
    min-width: 150px;
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px dashed rgba(125, 90, 54, 0.35);
    background: #FFFFFF;
    color: #4E3B2B;
    font-size: 0.9rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.tag-input:focus {
    outline: none;
    border-color: rgba(125, 90, 54, 0.6);
    box-shadow: 0 0 0 2px rgba(125, 90, 54, 0.2);
}

.daily-review__editor-card {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.editor-shell {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.editor-surface {
    background: #FFFFFF;
    border-radius: 18px;
    border: 1px solid rgba(210, 196, 160, 0.45);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 16px;
}

.editor-surface--quill {
    padding: 0;
    overflow: hidden;
}

.editor-surface--loading .skeleton-chip {
    border-radius: 10px;
    background: rgba(242, 226, 201, 0.9);
    height: 32px;
}

.editor-surface--loading .skeleton-bar {
    height: 16px;
    border-radius: 8px;
    background: rgba(242, 226, 201, 0.9);
}

.editor-surface--loading .skeleton-bar.short {
    width: 60%;
}

:deep(.editor-surface--quill .ql-toolbar.ql-snow) {
    border: none;
    background: #FFF5E8;
    padding: 12px 16px;
}

:deep(.editor-surface--quill .ql-container.ql-snow) {
    border: none;
    padding: 16px;
}

:deep(.editor-surface--quill .ql-editor) {
    min-height: 240px;
    font-size: 1rem;
    color: #4E3B2B;
    font-family: inherit;
    background: #FFFFFF;
}

.mood-card {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}

.mood-card__picker {
    width: 100%;
}

.slider {
  -webkit-appearance: none;
  appearance: none;
  background: #F0E9D2;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #7D5A36 0%, #6B4A2E 100%);
  cursor: pointer;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(78, 59, 43, 0.3);
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(78, 59, 43, 0.4);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #7D5A36 0%, #6B4A2E 100%);
  cursor: pointer;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(78, 59, 43, 0.3);
  border: none;
  transition: all 0.2s ease;
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(78, 59, 43, 0.4);
}
</style>

