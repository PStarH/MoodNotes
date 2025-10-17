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

                <!-- Date and Weather/Mood Section -->
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 fade-in">
                    <div class="flex items-center space-x-4 w-full sm:w-auto">
                        <div class="p-3 glass-effect rounded-lg" aria-hidden="true">
                            <Calendar class="text-[#7D5A36]" />
                        </div>
                        <label for="entry-date" class="sr-only">Entry date</label>
                        <input
                            id="entry-date"
                            type="date"
                            v-model="currentDate"
                            class="glass-effect text-[#4E3B2B] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7D5A36] transition-all font-medium"
                            aria-label="Select entry date"
                        >
                    </div>
                    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
                        <div class="flex items-center glass-effect px-4 py-3 rounded-xl w-full sm:w-auto" role="status" aria-live="polite">
                            <Cloud class="text-[#7D5A36] mr-3" aria-hidden="true" />
                            <span class="text-[#4E3B2B] font-medium">{{ weather.description }}</span>
                        </div>
                        <div class="glass-effect px-4 py-4 rounded-xl w-full sm:w-auto">
                            <div class="flex items-start gap-3">
                                <div class="flex-shrink-0 p-3 rounded-2xl bg-white/60 shadow-inner" aria-hidden="true">
                                    <Smile class="text-[#7D5A36]" />
                                </div>
                                <div class="flex-1">
                                    <span class="text-xs font-semibold tracking-wide text-[#7D5A36]/80 uppercase">Current Mood</span>
                                    <div class="flex items-center gap-2 mt-1">
                                        <span class="text-2xl" aria-hidden="true">{{ selectedMoodDetails.emoji }}</span>
                                        <p class="text-base font-semibold text-[#4E3B2B]">{{ selectedMoodDetails.label }}</p>
                                    </div>
                                    <p class="text-xs text-[#7D5A36]/70 mt-1">{{ selectedMoodDetails.caption }}</p>

                                    <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Select your mood">
                                        <label
                                            v-for="option in moodOptions"
                                            :key="option.value"
                                            class="mood-option"
                                            :class="{ 'mood-option-active': mood === option.value }"
                                        >
                                            <input
                                                type="radio"
                                                class="sr-only"
                                                :value="option.value"
                                                v-model="mood"
                                                :aria-label="`${option.label}: ${option.caption}`"
                                            />
                                            <div class="flex items-center gap-3">
                                                <span class="text-2xl" aria-hidden="true">{{ option.emoji }}</span>
                                                <div class="text-left">
                                                    <p class="mood-label">{{ option.label }}</p>
                                                    <p class="mood-caption">{{ option.caption }}</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Last Year Today Section -->
            <div v-if="hasHistoricalData" class="mb-8 fade-in">
                <div class="glass-effect p-6 rounded-xl warm-shadow border border-[#7D5A36]/30">
                    <div class="flex items-start justify-between mb-4">
                        <h3 class="text-xl font-semibold text-[#4E3B2B] flex items-center gap-2">
                            <span aria-hidden="true">🕰️</span>
                            Last Year Today
                        </h3>
                        <span class="text-sm text-[#7D5A36]/70">{{ lastYearDateString }}</span>
                    </div>

                    <div class="space-y-4">
                        <!-- Mood Comparison -->
                        <div v-if="lastYearMood" class="flex items-center gap-3">
                            <span class="text-xs font-semibold text-[#7D5A36]/80 uppercase tracking-wide">Mood:</span>
                            <div class="flex items-center gap-2">
                                <span class="text-2xl" aria-hidden="true">{{ moodOptions.find(opt => opt.value === lastYearMood)?.emoji || '😐' }}</span>
                                <span class="text-sm font-medium text-[#4E3B2B]">{{ lastYearMood.charAt(0).toUpperCase() + lastYearMood.slice(1) }}</span>
                            </div>
                        </div>

                        <!-- Summary Preview -->
                        <div v-if="lastYearSummaryPreview" class="glass-effect p-4 rounded-lg bg-[#F0E9D2]/50">
                            <p class="text-sm text-[#4E3B2B] italic leading-relaxed">{{ lastYearSummaryPreview }}</p>
                        </div>

                        <!-- Tags -->
                        <div v-if="lastYearTags.length > 0" class="flex flex-wrap gap-2">
                            <span class="text-xs font-semibold text-[#7D5A36]/80 uppercase tracking-wide">Tags:</span>
                            <span
                                v-for="tag in lastYearTags.slice(0, 6)"
                                :key="tag"
                                class="text-xs px-2 py-1 bg-[#7D5A36]/10 text-[#7D5A36] rounded-full font-medium"
                            >
                                #{{ tag }}
                            </span>
                            <span v-if="lastYearTags.length > 6" class="text-xs text-[#7D5A36]/60">
                                +{{ lastYearTags.length - 6 }} more
                            </span>
                        </div>

                        <!-- Daily Check Comparison -->
                        <div v-if="lastYearDailyCheck" class="grid grid-cols-3 gap-3 text-xs">
                            <div class="glass-effect p-2 rounded-lg text-center">
                                <div class="font-semibold text-[#7D5A36]/70">Energy</div>
                                <div class="text-lg font-bold text-[#4E3B2B]">{{ lastYearDailyCheck.energyLevel }}/10</div>
                            </div>
                            <div class="glass-effect p-2 rounded-lg text-center">
                                <div class="font-semibold text-[#7D5A36]/70">Stress</div>
                                <div class="text-lg font-bold text-[#4E3B2B]">{{ lastYearDailyCheck.stressLevel }}/10</div>
                            </div>
                            <div class="glass-effect p-2 rounded-lg text-center">
                                <div class="font-semibold text-[#7D5A36]/70">Productivity</div>
                                <div class="text-lg font-bold text-[#4E3B2B]">{{ lastYearDailyCheck.productivity }}/10</div>
                            </div>
                        </div>

                        <p class="text-xs text-[#7D5A36]/60 text-center italic">
                            Reflecting on your journey helps you grow 🌱
                        </p>
                    </div>
                </div>
            </div>

            <!-- Tags Section -->
            <div class="mb-8 slide-in">
                <div class="flex flex-wrap items-center gap-3">
                    <h3 id="tags-section" class="text-xl font-semibold text-[#4E3B2B] mb-2 flex items-center">
                        <span class="mr-2" aria-hidden="true">🏷️</span>Tags
                    </h3>
                    <div
                        v-for="tag in tags"
                        :key="tag"
                        class="bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white px-3 py-2 rounded-full text-sm flex items-center hover-lift transition-all duration-200 warm-shadow"
                        role="group"
                        :aria-label="`Tag: ${tag}`"
                    >
                        {{ tag }}
                        <button
                            @click="removeTag(tag)"
                            class="ml-2 text-xs bg-white text-[#7D5A36] rounded-full w-5 h-5 flex items-center justify-center hover:bg-gray-100 transition-all"
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
                        class="flex-grow-0 w-36 glass-effect text-[#4E3B2B] px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7D5A36] transition-all"
                        aria-label="Type a new tag and press Enter to add"
                    >
                </div>
            </div>

            <!-- Enhanced Word Editor with Quill -->
            <div class="mb-8 bounce-in">
                <label for="quill-editor" class="sr-only">Journal entry content</label>
                <div class="quill-container">
                    <!-- Loading Skeleton -->
                    <div v-if="isQuillLoading" class="bg-white border border-[#D3C9A6] rounded-xl warm-shadow p-4" role="status" aria-live="polite">
                        <div class="animate-pulse space-y-3">
                            <div class="flex space-x-2 mb-4 pb-4 border-b border-[#D3C9A6]">
                                <div class="h-8 bg-[#F0E9D2] rounded w-24"></div>
                                <div class="h-8 bg-[#F0E9D2] rounded w-24"></div>
                                <div class="h-8 bg-[#F0E9D2] rounded w-24"></div>
                            </div>
                            <div class="h-4 bg-[#F0E9D2] rounded w-full"></div>
                            <div class="h-4 bg-[#F0E9D2] rounded w-5/6"></div>
                            <div class="h-4 bg-[#F0E9D2] rounded w-4/6"></div>
                        </div>
                        <p class="text-sm text-[#7D5A36] mt-3 text-center">Loading editor...</p>
                    </div>
                    <!-- Quill Editor -->
                    <div
                        v-show="!isQuillLoading"
                        id="quill-editor"
                        ref="quillEditor"
                        class="bg-white border border-[#D3C9A6] rounded-xl warm-shadow"
                        aria-label="Rich text editor for journal entry"
                    ></div>
                </div>
            </div>

            <!-- Habit-based To-do List -->
            <div class="mb-8 fade-in" v-if="habits.length > 0">
                <h2 id="habits-section" class="text-xl font-semibold text-[#4E3B2B] mb-4 flex items-center">
                    <span class="mr-2" aria-hidden="true">✅</span>Daily Habits
                </h2>
                <div
                    v-for="(habit, index) in habits"
                    :key="index"
                    class="flex items-center justify-between mb-3 glass-effect p-4 rounded-xl hover-lift transition-all duration-200 warm-shadow"
                >
                    <div class="flex items-center">
                        <input
                            type="checkbox"
                            :id="'habit-' + index"
                            v-model="habit.completed"
                            class="mr-3 w-4 h-4 text-[#7D5A36] rounded"
                            :aria-label="`Mark ${habit.name} as completed`"
                        >
                        <label :for="'habit-' + index" class="text-[#4E3B2B] font-medium">{{ habit.name }}</label>
                    </div>
                    <div class="flex items-center space-x-2" role="group" aria-label="Habit status options">
                        <button
                            @click="cycleHabitStatus(habit, 'did')"
                            :class="{ 'bg-green-500 scale-110': habit.status === 'did' }"
                            class="w-8 h-8 rounded-full border-2 border-green-500 hover:bg-green-100 transition-all duration-200 hover-lift"
                            :aria-label="`Mark ${habit.name} as completed`"
                            :aria-pressed="habit.status === 'did'"
                        ></button>
                        <button
                            @click="cycleHabitStatus(habit, 'partial')"
                            :class="{ 'bg-yellow-500 scale-110': habit.status === 'partial' }"
                            class="w-8 h-8 rounded-full border-2 border-yellow-500 hover:bg-yellow-100 transition-all duration-200 hover-lift"
                            :aria-label="`Mark ${habit.name} as partially completed`"
                            :aria-pressed="habit.status === 'partial'"
                        ></button>
                        <button
                            @click="cycleHabitStatus(habit, 'not')"
                            :class="{ 'bg-red-500 scale-110': habit.status === 'not' }"
                            class="w-8 h-8 rounded-full border-2 border-red-500 hover:bg-red-100 transition-all duration-200 hover-lift"
                            :aria-label="`Mark ${habit.name} as not completed`"
                            :aria-pressed="habit.status === 'not'"
                        ></button>
                    </div>
                </div>
            </div>

            <!-- Daily Check -->
            <div class="mb-8 slide-in">
                <h2 id="daily-check-section" class="text-xl font-semibold text-[#4E3B2B] mb-4 flex items-center">
                    <span class="mr-2" aria-hidden="true">📊</span>Daily Check
                </h2>
                <div class="glass-effect p-6 rounded-xl space-y-4 warm-shadow">
                    <div class="flex items-center justify-between">
                        <label for="energy-level" class="text-[#4E3B2B] font-medium flex items-center">
                            <span class="mr-2" aria-hidden="true">⚡</span>Energy Level:
                        </label>
                        <div class="flex items-center space-x-3">
                            <input
                                id="energy-level"
                                type="range"
                                v-model="dailyCheck.energyLevel"
                                min="1"
                                max="10"
                                class="flex-1 h-2 bg-[#F0E9D2] rounded-lg appearance-none cursor-pointer slider"
                                :aria-label="`Energy level: ${dailyCheck.energyLevel} out of 10`"
                                aria-valuemin="1"
                                aria-valuemax="10"
                                :aria-valuenow="dailyCheck.energyLevel"
                            >
                            <span class="text-[#7D5A36] font-bold w-8 text-center" aria-live="polite">{{ dailyCheck.energyLevel }}</span>
                        </div>
                    </div>
                    <div class="flex items-center justify-between">
                        <label for="stress-level" class="text-[#4E3B2B] font-medium flex items-center">
                            <span class="mr-2" aria-hidden="true">😅</span>Stress Level:
                        </label>
                        <div class="flex items-center space-x-3">
                            <input
                                id="stress-level"
                                type="range"
                                v-model="dailyCheck.stressLevel"
                                min="1"
                                max="10"
                                class="flex-1 h-2 bg-[#F0E9D2] rounded-lg appearance-none cursor-pointer slider"
                                :aria-label="`Stress level: ${dailyCheck.stressLevel} out of 10`"
                                aria-valuemin="1"
                                aria-valuemax="10"
                                :aria-valuenow="dailyCheck.stressLevel"
                            >
                            <span class="text-[#7D5A36] font-bold w-8 text-center" aria-live="polite">{{ dailyCheck.stressLevel }}</span>
                        </div>
                    </div>
                    <div class="flex items-center justify-between">
                        <label for="productivity-level" class="text-[#4E3B2B] font-medium flex items-center">
                            <span class="mr-2" aria-hidden="true">🎨</span>Productivity:
                        </label>
                        <div class="flex items-center space-x-3">
                            <input
                                id="productivity-level"
                                type="range"
                                v-model="dailyCheck.productivity"
                                min="1"
                                max="10"
                                class="flex-1 h-2 bg-[#F0E9D2] rounded-lg appearance-none cursor-pointer slider"
                                :aria-label="`Productivity level: ${dailyCheck.productivity} out of 10`"
                                aria-valuemin="1"
                                aria-valuemax="10"
                                :aria-valuenow="dailyCheck.productivity"
                            >
                            <span class="text-[#7D5A36] font-bold w-8 text-center" aria-live="polite">{{ dailyCheck.productivity }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Media Upload -->
            <div class="mb-8 bounce-in">
                <h2 id="media-section" class="text-xl font-semibold text-[#4E3B2B] mb-4 flex items-center">
                    <span class="mr-2" aria-hidden="true">📷</span>Media
                </h2>
                <div class="flex space-x-4 mb-4" role="group" aria-labelledby="media-section">
                    <label class="cursor-pointer bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white px-6 py-3 rounded-xl hover-lift transition-all duration-200 flex items-center warm-shadow">
                        <Image class="mr-2" :size="20" aria-hidden="true" />
                        Add Image
                        <input type="file" accept="image/*" @change="handleFileUpload" class="hidden" aria-label="Upload image file">
                    </label>
                    <label class="cursor-pointer bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white px-6 py-3 rounded-xl hover-lift transition-all duration-200 flex items-center warm-shadow">
                        <Video class="mr-2" :size="20" aria-hidden="true" />
                        Add Video
                        <input type="file" accept="video/*" @change="handleFileUpload" class="hidden" aria-label="Upload video file">
                    </label>
                    <label class="cursor-pointer bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white px-6 py-3 rounded-xl hover-lift transition-all duration-200 flex items-center warm-shadow">
                        <Music class="mr-2" :size="20" aria-hidden="true" />
                        Add Audio
                        <input type="file" accept="audio/*" @change="handleFileUpload" class="hidden" aria-label="Upload audio file">
                    </label>
                </div>
                <div v-if="media.length > 0" class="grid grid-cols-3 gap-4" role="list" aria-label="Uploaded media files">
                    <div
                        v-for="(item, index) in media"
                        :key="index"
                        class="relative glass-effect rounded-xl overflow-hidden warm-shadow hover-lift transition-all duration-200"
                        role="listitem"
                    >
                        <img v-if="item.type.startsWith('image')" :src="item.url" class="w-full h-32 object-cover" :alt="`Uploaded image ${index + 1}`">
                        <video v-else-if="item.type.startsWith('video')" :src="item.url" class="w-full h-32 object-cover" controls :aria-label="`Uploaded video ${index + 1}`"></video>
                        <audio v-else-if="item.type.startsWith('audio')" :src="item.url" class="w-full p-2" controls :aria-label="`Uploaded audio ${index + 1}`"></audio>
                        <button
                            @click="removeMedia(index)"
                            class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all hover-lift"
                            :aria-label="`Remove media file ${index + 1}`"
                        >
                            <X :size="16" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>

            <!-- Comfort Zone Entry -->
            <div class="mb-8 fade-in">
                <h2 id="comfort-zone-section" class="text-xl font-semibold text-[#4E3B2B] mb-4 flex items-center">
                    <span class="mr-2" aria-hidden="true">🌱</span>Comfort Zone Entry
                </h2>
                <label for="comfort-zone-textarea" class="sr-only">Comfort zone reflections</label>
                <textarea
                    id="comfort-zone-textarea"
                    v-model="comfortZoneEntry"
                    placeholder="Did you step out of your comfort zone today? How did it feel?"
                    class="w-full h-32 glass-effect text-[#4E3B2B] p-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#7D5A36] transition-all warm-shadow"
                    aria-label="Describe your comfort zone experiences today"
                ></textarea>
            </div>

            <!-- Custom Sections -->
            <div v-for="(section, index) in customSections" :key="index" class="mb-6 slide-in">
                <h2 class="text-xl font-semibold text-[#4E3B2B] mb-3 flex items-center">
                    <span class="mr-2" aria-hidden="true">📋</span>{{ section.title }}
                </h2>
                <div class="glass-effect text-[#4E3B2B] p-4 rounded-xl warm-shadow">{{ section.content }}</div>
            </div>

            <!-- Add Custom Section -->
            <div class="mb-8 bounce-in">
                <button
                    v-if="!showAddSection"
                    @click="showAddSection = true"
                    class="bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white px-6 py-3 rounded-xl hover-lift transition-all duration-200 flex items-center warm-shadow"
                    aria-label="Add a custom section to your journal"
                >
                    <span class="mr-2" aria-hidden="true">➕</span>Add Custom Section
                </button>
                <div v-if="showAddSection" class="glass-effect p-6 rounded-xl warm-shadow space-y-4" role="form" aria-label="Add custom section form">
                    <label for="section-title-input" class="sr-only">Section title</label>
                    <input
                        id="section-title-input"
                        v-model="newSectionTitle"
                        type="text"
                        placeholder="Section Title"
                        class="w-full px-4 py-3 glass-effect rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7D5A36] transition-all"
                        aria-label="Enter section title"
                    >
                    <label for="section-content-textarea" class="sr-only">Section content</label>
                    <textarea
                        id="section-content-textarea"
                        v-model="newSectionContent"
                        placeholder="Section Content"
                        class="w-full h-32 glass-effect px-4 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#7D5A36] transition-all"
                        aria-label="Enter section content"
                    ></textarea>
                    <div class="flex justify-end space-x-3" role="group" aria-label="Section form actions">
                        <button
                            @click="saveCustomSection"
                            class="bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white px-6 py-3 rounded-xl hover-lift transition-all duration-200 font-semibold warm-shadow"
                            aria-label="Save custom section"
                        >
                            Save Section
                        </button>
                        <button
                            @click="showAddSection = false"
                            class="bg-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-400 transition-all duration-200 font-semibold"
                            aria-label="Cancel adding custom section"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Save Button (Bottom Right Corner) -->
        <button
            @click="saveAll"
            :disabled="isSaving"
            class="fixed bottom-6 right-6 bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white px-8 py-4 rounded-full text-lg font-bold hover-lift transition-all duration-200 warm-shadow-lg z-50 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            :class="{ 'bg-green-500': saveSuccess }"
            :aria-label="isSaving ? 'Saving your journal entry' : (saveSuccess ? 'Journal entry saved successfully' : 'Save all journal entry data')"
            :aria-busy="isSaving"
        >
            <span class="mr-2" aria-hidden="true">{{ isSaving ? '⏳' : (saveSuccess ? '✅' : '💾') }}</span>
            {{ isSaving ? 'Saving...' : (saveSuccess ? 'Saved!' : 'Save All') }}
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, watchEffect, nextTick, onUnmounted, Ref } from 'vue'
import { useStore } from 'vuex'
import { X, Calendar, Cloud, Smile, Image, Video, Music } from 'lucide-vue-next'
import type Quill from 'quill'
import { jsPDF } from 'jspdf'
import DOMPurify from 'dompurify'
import { DaySummary as DaySummaryType, DaySummaryHabit, MediaItem, CustomSection, HabitStatus } from '../store/types'
import { useToast } from '@/composables/useToast'
import { useMediaManager } from '@/composables/useMediaManager'
import { useModalFocus } from '@/composables/useFocusTrap'
import { useHistoricalComparison } from '@/composables/useHistoricalComparison'

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

const selectedMoodDetails = computed(() => {
    return moodOptions.find(option => option.value === mood.value) || moodOptions[0]
})

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
.mood-option {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    border: 1px solid rgba(125, 90, 54, 0.2);
    background: rgba(250, 243, 224, 0.7);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.mood-option:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(78, 59, 43, 0.15);
}

.mood-option-active {
    border-color: rgba(125, 90, 54, 0.6);
    background: rgba(125, 90, 54, 0.1);
    box-shadow: 0 10px 28px rgba(78, 59, 43, 0.18);
}

.mood-label {
    font-size: 0.95rem;
    font-weight: 600;
    color: #4E3B2B;
}

.mood-caption {
    font-size: 0.75rem;
    color: rgba(125, 90, 54, 0.75);
}

:global(.theme-dark) .mood-option {
    border-color: rgba(99, 102, 241, 0.25);
    background: rgba(30, 41, 59, 0.7);
    color: var(--color-text);
    box-shadow: 0 6px 18px rgba(8, 16, 28, 0.35);
}

:global(.theme-dark) .mood-option:hover {
    box-shadow: 0 10px 26px rgba(8, 16, 28, 0.45);
}

:global(.theme-dark) .mood-option-active {
    border-color: rgba(129, 140, 248, 0.6);
    background: rgba(99, 102, 241, 0.2);
    box-shadow: 0 12px 30px rgba(8, 16, 28, 0.55);
}

:global(.theme-dark) .mood-caption {
    color: rgba(165, 180, 252, 0.75);
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

