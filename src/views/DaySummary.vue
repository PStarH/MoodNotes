<template>
    <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 overflow-auto p-4">
        <div
            ref="modalRef"
            class="glass-effect w-full max-w-5xl mx-auto my-4 max-h-[95vh] overflow-y-auto rounded-2xl p-4 sm:p-6 warm-shadow-lg bounce-in custom-scrollbar"
            role="dialog"
            aria-labelledby="day-summary-title"
            aria-modal="true"
        >
            <!-- Main Container with Padding to Avoid Overlap -->
            <div class="relative pb-20">

                <!-- Container for Close Button and Export Options -->
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 pb-3 border-b border-[#D3C9A6]">
                    <h2 id="day-summary-title" class="text-xl sm:text-2xl font-bold text-[#4E3B2B]">{{ $t('daySummary.title') }}</h2>
                    <div class="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Document actions">
                        <!-- Export Options -->
                        <button
                            @click="exportContent('pdf')"
                            class="bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white px-2.5 py-1.5 rounded-lg text-xs hover-lift transition-all duration-200 warm-shadow flex items-center"
                            :aria-label="$t('daySummary.exportPdf')"
                        >
                            <span aria-hidden="true">📜</span>
                        </button>
                        <button
                            @click="exportContent('md')"
                            class="bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white px-2.5 py-1.5 rounded-lg text-xs hover-lift transition-all duration-200 warm-shadow flex items-center"
                            :aria-label="$t('daySummary.exportMarkdown')"
                        >
                            <span aria-hidden="true">📝</span>
                        </button>
                        <button
                            @click="exportContent('html')"
                            class="bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white px-2.5 py-1.5 rounded-lg text-xs hover-lift transition-all duration-200 warm-shadow flex items-center"
                            :aria-label="$t('daySummary.exportHtml')"
                        >
                            <span aria-hidden="true">🌐</span>
                        </button>
                        <button
                            v-if="daySummary"
                            @click="deleteDaySummary"
                            class="bg-gradient-to-r from-red-500 to-red-600 text-white px-2.5 py-1.5 rounded-lg text-xs hover-lift transition-all duration-200 warm-shadow flex items-center"
                            :aria-label="$t('daySummary.deleteEntry')"
                        >
                            <span aria-hidden="true">🗑️</span>
                        </button>
                        <!-- Close Button -->
                        <button
                            type="button"
                            @click="$emit('close')"
                            class="text-[#7D5A36] hover:text-opacity-80 p-1.5 hover:bg-[#7D5A36] hover:bg-opacity-10 rounded-lg transition-all"
                            aria-label="Close daily review"
                        >
                            <X :size="20" aria-hidden="true" />
                        </button>
                    </div>
                </div>

                <div class="daily-review fade-in">
                    <div class="surface-card daily-review__info-card">
                        <div class="daily-review__row">
                            <div class="flex-1">
                                <label for="entry-date" class="sr-only">Entry date</label>
                                <CustomDatePicker
                                    v-model="currentDate"
                                    placeholder="选择日期"
                                />
                            </div>
                        </div>
                        <div class="daily-review__combined-row">
                            <div class="daily-review__row" role="status" aria-live="polite">
                                <div class="meta-icon" aria-hidden="true">
                                    <Cloud class="meta-icon__glyph" />
                                </div>
                                <div>
                                    <p class="meta-label">{{ $t('daySummary.weather') }}</p>
                                    <p class="meta-value">{{ weather.description }}</p>
                                </div>
                            </div>

                            <div class="daily-review__inline-section flex-1">
                                <div class="meta-icon" aria-hidden="true">
                                    <span class="meta-icon__glyph">🏷️</span>
                                </div>
                                <div class="daily-review__tags-flow-inline">
                                    <div
                                        v-for="tag in tags"
                                        :key="tag"
                                        class="tag-chip-small"
                                        role="group"
                                        :aria-label="`Tag: ${tag}`"
                                    >
                                        {{ tag }}
                                        <button
                                            @click="removeTag(tag)"
                                            class="tag-chip__remove-small"
                                            :aria-label="`Remove tag ${tag}`"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                    <label for="new-tag-input" class="sr-only">{{ $t('daySummary.addTag') }}</label>
                                    <input
                                        id="new-tag-input"
                                        v-model="newTag"
                                        @keyup.enter="addTag"
                                        type="text"
                                        :placeholder="$t('daySummary.addTag')"
                                        class="tag-input-small"
                                        :aria-label="$t('daySummary.addTag')"
                                    >
                                </div>
                            </div>

                            <div class="daily-review__mood-section">
                                <MoodPicker
                                    v-model="mood"
                                    :options="moodOptions"
                                    :default-caption="'😊 ' + $t('daySummary.chooseMood')"
                                    class="mood-picker-inline"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Sparks Section -->
                    <div class="surface-card p-4 rounded-xl mb-4 bounce-in" style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(250, 243, 224, 0.8) 100%);">
                        <div class="flex items-start gap-3">
                            <div class="meta-icon flex-shrink-0" aria-hidden="true">
                                <span class="meta-icon__glyph">✨</span>
                            </div>
                            <div class="flex-1">
                                <label class="block text-sm font-semibold text-[#4E3B2B] mb-2">{{ $t('daySummary.sparks') }}</label>
                                <p class="text-xs text-[#7D5A36]/80 mb-3">{{ $t('daySummary.sparksDesc') }}</p>

                                <!-- Sparks List -->
                                <div v-if="sparks.length > 0" class="space-y-2 mb-3">
                                    <div
                                        v-for="(spark, index) in sparks"
                                        :key="index"
                                        class="glass-effect p-3 rounded-lg flex items-start justify-between gap-2 hover-lift transition-all group"
                                    >
                                        <span class="text-sm text-[#4E3B2B] flex-1 whitespace-pre-wrap">{{ spark }}</span>
                                        <button
                                            @click="removeSpark(index)"
                                            class="flex-shrink-0 text-[#7D5A36]/60 hover:text-[#7D5A36] opacity-0 group-hover:opacity-100 transition-opacity"
                                            :aria-label="`Remove spark: ${spark.substring(0, 30)}`"
                                            :title="$t('common.delete')"
                                        >
                                            <X :size="16" />
                                        </button>
                                    </div>
                                </div>

                                <!-- Add Spark Input -->
                                <div class="flex gap-2">
                                    <textarea
                                        v-model="newSpark"
                                        @keydown="handleSparkKeydown"
                                        :placeholder="$t('daySummary.sparkPlaceholder')"
                                        class="flex-1 px-3 py-2 glass-effect text-[#4E3B2B] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#7D5A36] transition-all"
                                        rows="2"
                                        :aria-label="$t('daySummary.sparkPlaceholder')"
                                    ></textarea>
                                    <button
                                        @click="addSpark"
                                        :disabled="!newSpark.trim()"
                                        class="px-4 py-2 bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white rounded-lg text-sm font-semibold hover-lift transition-all warm-shadow disabled:opacity-50 disabled:cursor-not-allowed h-fit"
                                        :aria-label="$t('daySummary.addSpark')"
                                    >
                                        {{ $t('daySummary.addSpark') }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Daily Habits Section -->
                    <div v-if="habits.length > 0" class="surface-card p-4 rounded-xl mb-4 bounce-in" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(250, 243, 224, 0.8) 100%);">
                        <div class="flex items-start gap-3">
                            <div class="meta-icon flex-shrink-0" aria-hidden="true">
                                <span class="meta-icon__glyph">✅</span>
                            </div>
                            <div class="flex-1">
                                <label class="block text-sm font-semibold text-[#4E3B2B] mb-2">{{ $t('daySummary.habits') }}</label>
                                <p class="text-xs text-[#7D5A36]/80 mb-3">{{ $t('daySummary.habitsDesc') }}</p>

                                <!-- Habits List -->
                                <div class="space-y-2">
                                    <div
                                        v-for="(habit, index) in habits"
                                        :key="index"
                                        class="glass-effect p-3 rounded-lg flex items-center justify-between gap-3 hover-lift transition-all"
                                    >
                                        <div class="flex items-center gap-3 flex-1">
                                            <input
                                                type="checkbox"
                                                :id="'habit-' + index"
                                                v-model="habit.completed"
                                                class="w-4 h-4 text-[#7D5A36] rounded focus:ring-2 focus:ring-[#7D5A36] cursor-pointer"
                                                :aria-label="`Mark ${habit.name} as completed`"
                                            >
                                            <label :for="'habit-' + index" class="text-sm font-medium text-[#4E3B2B] cursor-pointer flex-1">
                                                {{ habit.name }}
                                            </label>
                                        </div>
                                        <div class="flex items-center gap-2" role="group" aria-label="Habit status options">
                                            <button
                                                @click="cycleHabitStatus(habit, 'did')"
                                                :class="{ 'bg-green-500 scale-110 shadow-md': habit.status === 'did' }"
                                                class="w-7 h-7 rounded-full border-2 border-green-500 hover:bg-green-100 transition-all duration-200 hover-lift flex-shrink-0"
                                                :aria-label="`Mark ${habit.name} as completed`"
                                                :aria-pressed="habit.status === 'did'"
                                                :title="$t('daySummary.completed')"
                                            ></button>
                                            <button
                                                @click="cycleHabitStatus(habit, 'partial')"
                                                :class="{ 'bg-yellow-500 scale-110 shadow-md': habit.status === 'partial' }"
                                                class="w-7 h-7 rounded-full border-2 border-yellow-500 hover:bg-yellow-100 transition-all duration-200 hover-lift flex-shrink-0"
                                                :aria-label="`Mark ${habit.name} as partially completed`"
                                                :aria-pressed="habit.status === 'partial'"
                                                :title="$t('daySummary.partiallyCompleted')"
                                            ></button>
                                            <button
                                                @click="cycleHabitStatus(habit, 'not')"
                                                :class="{ 'bg-red-500 scale-110 shadow-md': habit.status === 'not' }"
                                                class="w-7 h-7 rounded-full border-2 border-red-500 hover:bg-red-100 transition-all duration-200 hover-lift flex-shrink-0"
                                                :aria-label="`Mark ${habit.name} as not completed`"
                                                :aria-pressed="habit.status === 'not'"
                                                :title="$t('daySummary.notCompleted')"
                                            ></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="surface-card daily-review__editor-card bounce-in mb-6">
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
                                <p class="text-sm text-[#7D5A36] mt-3 text-center">{{ $t('common.loading') }}</p>
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

                <!-- Last Year Today Section -->
                <div v-if="hasHistoricalData" class="mb-6 fade-in">
                    <div class="glass-effect p-4 rounded-xl warm-shadow border border-[#7D5A36]/30">
                        <div class="flex items-start justify-between mb-3">
                            <h3 class="text-lg font-semibold text-[#4E3B2B] flex items-center gap-2">
                                <span aria-hidden="true">🕰️</span>
                                {{ $t('daySummary.lastYearToday') }}
                            </h3>
                            <span class="text-xs text-[#7D5A36]/70">{{ lastYearDateString }}</span>
                        </div>

                        <div class="space-y-3">
                            <!-- Mood Comparison -->
                            <div v-if="lastYearMood" class="flex items-center gap-2">
                                <span class="text-xs font-semibold text-[#7D5A36]/80 uppercase tracking-wide">{{ $t('daySummary.mood') }}:</span>
                                <div class="flex items-center gap-2">
                                    <span class="text-xl" aria-hidden="true">{{ moodOptions.find((opt: { value: string; emoji: string }) => opt.value === lastYearMood)?.emoji || '😐' }}</span>
                                    <span class="text-sm font-medium text-[#4E3B2B]">{{ lastYearMood.charAt(0).toUpperCase() + lastYearMood.slice(1) }}</span>
                                </div>
                            </div>

                            <!-- Summary Preview -->
                            <div v-if="lastYearSummaryPreview" class="glass-effect p-3 rounded-lg bg-[#F0E9D2]/50">
                                <p class="text-xs text-[#4E3B2B] italic leading-relaxed">{{ lastYearSummaryPreview }}</p>
                            </div>

                            <!-- Tags -->
                            <div v-if="lastYearTags.length > 0" class="flex flex-wrap gap-1.5">
                                <span class="text-xs font-semibold text-[#7D5A36]/80 uppercase tracking-wide">{{ $t('daySummary.tags') }}:</span>
                                <span
                                    v-for="tag in lastYearTags.slice(0, 6)"
                                    :key="tag"
                                    class="text-xs px-2 py-0.5 bg-[#7D5A36]/10 text-[#7D5A36] rounded-full font-medium"
                                >
                                    #{{ tag }}
                                </span>
                                <span v-if="lastYearTags.length > 6" class="text-xs text-[#7D5A36]/60">
                                    +{{ lastYearTags.length - 6 }} more
                                </span>
                            </div>

                            <!-- Daily Check Comparison -->
                            <div v-if="lastYearDailyCheck" class="grid grid-cols-3 gap-2 text-xs">
                                <div class="glass-effect p-2 rounded-lg text-center">
                                    <div class="font-semibold text-[#7D5A36]/70 text-xs">{{ $t('daySummary.energyLevel') }}</div>
                                    <div class="text-base font-bold text-[#4E3B2B]">{{ lastYearDailyCheck.energyLevel }}/10</div>
                                </div>
                                <div class="glass-effect p-2 rounded-lg text-center">
                                    <div class="font-semibold text-[#7D5A36]/70 text-xs">{{ $t('daySummary.stressLevel') }}</div>
                                    <div class="text-base font-bold text-[#4E3B2B]">{{ lastYearDailyCheck.stressLevel }}/10</div>
                                </div>
                                <div class="glass-effect p-2 rounded-lg text-center">
                                    <div class="font-semibold text-[#7D5A36]/70 text-xs">{{ $t('daySummary.productivity') }}</div>
                                    <div class="text-base font-bold text-[#4E3B2B]">{{ lastYearDailyCheck.productivity }}/10</div>
                                </div>
                            </div>

                            <p class="text-xs text-[#7D5A36]/60 text-center italic pt-1">
                                {{ $t('daySummary.reflecting') }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Daily Check -->
                <div class="mb-6 mt-8 slide-in">
                    <h2 id="daily-check-section" class="text-lg font-semibold text-[#4E3B2B] mb-3 flex items-center">
                        <span class="mr-2" aria-hidden="true">📊</span>{{ $t('daySummary.dailyCheck') }}
                    </h2>
                    <div class="glass-effect p-4 rounded-xl space-y-3 warm-shadow">
                        <div class="flex items-center justify-between">
                            <label for="energy-level" class="text-[#4E3B2B] font-medium flex items-center">
                                <span class="mr-2" aria-hidden="true">⚡</span>{{ $t('daySummary.energyLevel') }}:
                            </label>
                            <div class="flex items-center space-x-3">
                                <input
                                    id="energy-level"
                                    type="range"
                                    v-model.number="dailyCheck.energyLevel"
                                    min="1"
                                    max="10"
                                    class="flex-1 h-2 bg-[#F0E9D2] rounded-lg appearance-none cursor-pointer slider"
                                    :aria-label="`${$t('daySummary.energyLevel')}: ${dailyCheck.energyLevel} out of 10`"
                                    aria-valuemin="1"
                                    aria-valuemax="10"
                                    :aria-valuenow="dailyCheck.energyLevel"
                                >
                                <span class="text-[#7D5A36] font-bold w-8 text-center" aria-live="polite">{{ dailyCheck.energyLevel }}</span>
                            </div>
                        </div>
                        <div class="flex items-center justify-between">
                            <label for="stress-level" class="text-[#4E3B2B] font-medium flex items-center">
                                <span class="mr-2" aria-hidden="true">😅</span>{{ $t('daySummary.stressLevel') }}:
                            </label>
                            <div class="flex items-center space-x-3">
                                <input
                                    id="stress-level"
                                    type="range"
                                    v-model.number="dailyCheck.stressLevel"
                                    min="1"
                                    max="10"
                                    class="flex-1 h-2 bg-[#F0E9D2] rounded-lg appearance-none cursor-pointer slider"
                                    :aria-label="`${$t('daySummary.stressLevel')}: ${dailyCheck.stressLevel} out of 10`"
                                    aria-valuemin="1"
                                    aria-valuemax="10"
                                    :aria-valuenow="dailyCheck.stressLevel"
                                >
                                <span class="text-[#7D5A36] font-bold w-8 text-center" aria-live="polite">{{ dailyCheck.stressLevel }}</span>
                            </div>
                        </div>
                        <div class="flex items-center justify-between">
                            <label for="productivity-level" class="text-[#4E3B2B] font-medium flex items-center">
                                <span class="mr-2" aria-hidden="true">🎨</span>{{ $t('daySummary.productivity') }}:
                            </label>
                            <div class="flex items-center space-x-3">
                                <input
                                    id="productivity-level"
                                    type="range"
                                    v-model.number="dailyCheck.productivity"
                                    min="1"
                                    max="10"
                                    class="flex-1 h-2 bg-[#F0E9D2] rounded-lg appearance-none cursor-pointer slider"
                                    :aria-label="`${$t('daySummary.productivity')}: ${dailyCheck.productivity} out of 10`"
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
                <div class="mb-6 bounce-in">
                    <h2 id="media-section" class="text-lg font-semibold text-[#4E3B2B] mb-3 flex items-center">
                        <span class="mr-2" aria-hidden="true">📷</span>{{ $t('daySummary.media') }}
                    </h2>
                    <div class="flex space-x-3 mb-3" role="group" aria-labelledby="media-section">
                        <label class="cursor-pointer bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white px-4 py-2 rounded-xl hover-lift transition-all duration-200 flex items-center warm-shadow text-sm">
                            <Image class="mr-1.5" :size="18" aria-hidden="true" />
                            {{ $t('daySummary.addImage') }}
                            <input type="file" accept="image/*" @change="handleFileUpload" class="hidden" :aria-label="$t('daySummary.addImage')">
                        </label>
                        <label class="cursor-pointer bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white px-4 py-2 rounded-xl hover-lift transition-all duration-200 flex items-center warm-shadow text-sm">
                            <Video class="mr-1.5" :size="18" aria-hidden="true" />
                            {{ $t('daySummary.addVideo') }}
                            <input type="file" accept="video/*" @change="handleFileUpload" class="hidden" :aria-label="$t('daySummary.addVideo')">
                        </label>
                        <label class="cursor-pointer bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white px-4 py-2 rounded-xl hover-lift transition-all duration-200 flex items-center warm-shadow text-sm">
                            <Music class="mr-1.5" :size="18" aria-hidden="true" />
                            {{ $t('daySummary.addAudio') }}
                            <input type="file" accept="audio/*" @change="handleFileUpload" class="hidden" :aria-label="$t('daySummary.addAudio')">
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
                <div class="mb-6 fade-in">
                    <h2 id="comfort-zone-section" class="text-lg font-semibold text-[#4E3B2B] mb-3 flex items-center">
                        <span class="mr-2" aria-hidden="true">🌱</span>{{ $t('daySummary.comfortZone') }}
                    </h2>
                    <label for="comfort-zone-textarea" class="sr-only">{{ $t('daySummary.comfortZone') }}</label>
                    <textarea
                        id="comfort-zone-textarea"
                        v-model="comfortZoneEntry"
                        :placeholder="$t('daySummary.comfortZonePlaceholder')"
                        class="w-full h-28 glass-effect text-[#4E3B2B] p-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#7D5A36] transition-all warm-shadow text-sm"
                        :aria-label="$t('daySummary.comfortZone')"
                    ></textarea>
                </div>

                <!-- Custom Sections -->
                <div v-for="(section, index) in customSections" :key="index" class="mb-5 slide-in">
                    <h2 class="text-lg font-semibold text-[#4E3B2B] mb-2.5 flex items-center">
                        <span class="mr-2" aria-hidden="true">📋</span>{{ section.title }}
                    </h2>
                    <div class="glass-effect text-[#4E3B2B] p-3 rounded-xl warm-shadow text-sm">{{ section.content }}</div>
                </div>

                <!-- Add Custom Section -->
                <div class="mb-6 bounce-in">
                    <button
                        v-if="!showAddSection"
                        @click="showAddSection = true"
                        class="bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white px-5 py-2.5 rounded-xl hover-lift transition-all duration-200 flex items-center warm-shadow text-sm"
                        :aria-label="$t('daySummary.addCustomSection')"
                    >
                        <span class="mr-2" aria-hidden="true">➕</span>{{ $t('daySummary.addCustomSection') }}
                    </button>
                    <div v-if="showAddSection" class="glass-effect p-4 rounded-xl warm-shadow space-y-3" role="form" aria-label="Add custom section form">
                        <label for="section-title-input" class="sr-only">{{ $t('daySummary.sectionTitle') }}</label>
                        <input
                            id="section-title-input"
                            v-model="newSectionTitle"
                            type="text"
                            :placeholder="$t('daySummary.sectionTitle')"
                            class="w-full px-3 py-2.5 glass-effect rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7D5A36] transition-all text-sm"
                            :aria-label="$t('daySummary.sectionTitle')"
                        >
                        <label for="section-content-textarea" class="sr-only">{{ $t('daySummary.sectionContent') }}</label>
                        <textarea
                            id="section-content-textarea"
                            v-model="newSectionContent"
                            :placeholder="$t('daySummary.sectionContent')"
                            class="w-full h-28 glass-effect px-3 py-2.5 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#7D5A36] transition-all text-sm"
                            :aria-label="$t('daySummary.sectionContent')"
                        ></textarea>
                        <div class="flex justify-end space-x-2" role="group" aria-label="Section form actions">
                            <button
                                @click="saveCustomSection"
                                class="bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white px-5 py-2 rounded-xl hover-lift transition-all duration-200 font-semibold warm-shadow text-sm"
                                :aria-label="$t('daySummary.saveSection')"
                            >
                                {{ $t('daySummary.saveSection') }}
                            </button>
                            <button
                                @click="showAddSection = false"
                                class="bg-gray-300 text-gray-700 px-5 py-2 rounded-xl hover:bg-gray-400 transition-all duration-200 font-semibold text-sm"
                                :aria-label="$t('common.cancel')"
                            >
                                {{ $t('common.cancel') }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Save Button (Bottom Right Corner) -->
            <button
                @click="saveAll"
                :disabled="isSaving"
                class="sticky bottom-4 float-right mr-4 bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white px-6 py-3 rounded-full text-base font-bold hover-lift transition-all duration-200 warm-shadow-lg z-50 flex items-center disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                :class="{ 'bg-green-500': saveSuccess }"
                :aria-label="isSaving ? $t('daySummary.saving') : (saveSuccess ? $t('daySummary.saved') : $t('daySummary.saveAll'))"
                :aria-busy="isSaving"
            >
                <span class="mr-2" aria-hidden="true">{{ isSaving ? '⏳' : (saveSuccess ? '✅' : '💾') }}</span>
                {{ isSaving ? $t('daySummary.saving') : (saveSuccess ? $t('daySummary.saved') : $t('daySummary.saveAll')) }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, watchEffect, nextTick, onUnmounted, Ref } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { X, Cloud, Image, Video, Music } from 'lucide-vue-next'
import type Quill from 'quill'
import { jsPDF } from 'jspdf'
import DOMPurify from 'dompurify'
import { DaySummary as DaySummaryType, DaySummaryHabit, MediaItem, CustomSection, HabitStatus } from '../store/types'
import { useToast } from '@/composables/useToast'
import { useMediaManager } from '@/composables/useMediaManager'
import { useModalFocus } from '@/composables/useFocusTrap'
import { useHistoricalComparison } from '@/composables/useHistoricalComparison'
import { useDailyQuote } from '@/composables/useDailyQuote'
import MoodPicker from '@/components/MoodPicker.vue'
import CustomDatePicker from '@/components/CustomDatePicker.vue'

const emit = defineEmits(['close'])

const { t } = useI18n()
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
const mood = ref<'happy' | 'neutral' | 'sad' | 'excited' | 'angry'>('happy')

// Initialize mood-based daily quote (only keep updateMood for mood change handling)
const {
    updateMood: updateQuoteMood
} = useDailyQuote({ mood: mood.value })

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
const sparks: Ref<string[]> = ref([])
const newSpark = ref('')
const isSaving = ref(false)
const saveSuccess = ref(false)
const isQuillLoading = ref(false)

const moodOptions = computed(() => [
    {
        value: 'happy',
        label: t('mood.happy.label'),
        emoji: '😄',
        caption: t('mood.happy.caption'),
        defaultDailyCheck: { energyLevel: 8, stressLevel: 3, productivity: 7 }
    },
    {
        value: 'neutral',
        label: t('mood.neutral.label'),
        emoji: '😐',
        caption: t('mood.neutral.caption'),
        defaultDailyCheck: { energyLevel: 5, stressLevel: 5, productivity: 5 }
    },
    {
        value: 'sad',
        label: t('mood.sad.label'),
        emoji: '😢',
        caption: t('mood.sad.caption'),
        defaultDailyCheck: { energyLevel: 3, stressLevel: 6, productivity: 4 }
    },
    {
        value: 'excited',
        label: t('mood.excited.label'),
        emoji: '🎉',
        caption: t('mood.excited.caption'),
        defaultDailyCheck: { energyLevel: 9, stressLevel: 4, productivity: 8 }
    },
    {
        value: 'angry',
        label: t('mood.angry.label'),
        emoji: '😠',
        caption: t('mood.angry.caption'),
        defaultDailyCheck: { energyLevel: 6, stressLevel: 8, productivity: 4 }
    }
])

watchEffect(() => {
    if (!moodOptions.value.some(option => option.value === mood.value)) {
        mood.value = moodOptions.value[0].value as typeof mood.value
    }
})

// Watch mood changes and update daily check with defaults if values are still at default (5)
// Also update the mood-based quote when mood changes
watch(mood, (newMood) => {
    // Update quote mood
    updateQuoteMood(newMood)

    const selectedMood = moodOptions.value.find(opt => opt.value === newMood)
    if (selectedMood && selectedMood.defaultDailyCheck) {
        // Only update if the user hasn't customized the values yet (still at 5)
        const isDefaultValues =
            dailyCheck.value.energyLevel === 5 &&
            dailyCheck.value.stressLevel === 5 &&
            dailyCheck.value.productivity === 5

        if (isDefaultValues) {
            dailyCheck.value = { ...selectedMood.defaultDailyCheck }
        }
    }
})

const daySummary = computed(() => store.getters.getDaySummary(currentDate.value))

// Define helper functions first
const updateQuillContent = (newContent: string) => {
    if (quillInstance.value) {
        // Sanitize HTML before updating to prevent XSS attacks
        const sanitized = DOMPurify.sanitize(newContent)
        const currentContent = quillInstance.value.root.innerHTML
        if (currentContent !== sanitized) {
            // Use Quill's clipboard API for safer content insertion
            const delta = quillInstance.value.clipboard.convert({ html: sanitized })
            quillInstance.value.setContents(delta)
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
        sparks.value = existingSummary.sparks || []
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

const addSpark = () => {
    if (newSpark.value.trim()) {
        sparks.value.push(newSpark.value.trim())
        newSpark.value = ''
    }
}

const removeSpark = (index: number) => {
    sparks.value = sparks.value.filter((_, i) => i !== index)
}

const handleSparkKeydown = (event: KeyboardEvent) => {
    // Enter without Shift: add spark
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        addSpark()
    }
    // Shift+Enter: allow new line (default textarea behavior)
}

const saveAll = () => {
    isSaving.value = true
    saveSuccess.value = false

    try {
        // Clean and serialize habits data to ensure it's cloneable
        const cleanHabits = habits.value.map(habit => ({
            id: habit.id,
            name: habit.name,
            completed: habit.completed || false,
            status: habit.status || null
        }))

        // Clean media data
        const cleanMedia = media.value.map(item => ({
            type: item.type,
            url: item.url,
            filename: item.filename,
            id: item.id
        }))

        // Clean custom sections
        const cleanCustomSections = customSections.value.map(section => ({
            title: section.title,
            content: section.content
        }))

        const summaryData: DaySummaryType = {
            date: currentDate.value,
            summary: content.value || '',
            mood: mood.value,
            weather: weather.value.description,
            habits: cleanHabits,
            dailyCheck: {
                energyLevel: Math.min(Math.max(Number(dailyCheck.value.energyLevel) || 5, 1), 10),
                stressLevel: Math.min(Math.max(Number(dailyCheck.value.stressLevel) || 5, 1), 10),
                productivity: Math.min(Math.max(Number(dailyCheck.value.productivity) || 5, 1), 10)
            },
            comfortZoneEntry: comfortZoneEntry.value || '',
            customSections: cleanCustomSections,
            tags: [...tags.value],
            sparks: [...sparks.value],
            media: cleanMedia
        }

        console.log('💾 Saving day summary:', summaryData)

        // Save to store
        store.dispatch('updateDaySummary', summaryData)
            .then(() => {
                console.log('✅ Day summary saved successfully')
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
                console.error('Error details:', error.message, error.stack)
                isSaving.value = false
                toast.error(`Could not save your summary: ${error.message || 'Unknown error'}`, 'Save Failed')
            })
    } catch (error) {
        console.error('⚠️ Error preparing day summary:', error)
        isSaving.value = false
        toast.error('Failed to prepare summary data. Please check your input.', 'Save Failed')
    }
}

const deleteDaySummary = () => {
    if (confirm(t('daySummary.deleteEntry') + '? This action cannot be undone.')) {
        store.dispatch('deleteDaySummary', currentDate.value)
            .then(() => {
                toast.success(t('toast.deleted'), t('toast.success'))
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
        // Properly remove event listeners before destroying
        quillInstance.value.off('text-change')

        // Clear the instance reference
        quillInstance.value = null
    }
})
</script>

<style scoped>
.daily-review {
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #FAF8F4;
    border-radius: 28px;
    padding: 20px;
    box-shadow: 0 20px 40px rgba(78, 59, 43, 0.08);
}

.surface-card {
    background: #FFF9F0;
    border-radius: 16px;
    padding: 18px 20px;
    border: 1px solid rgba(125, 90, 54, 0.14);
    box-shadow: 0 12px 28px rgba(78, 59, 43, 0.08);
}

.daily-review__info-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.daily-review__row {
    display: flex;
    align-items: center;
    gap: 12px;
}

.daily-review__combined-row {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}

.daily-review__inline-section {
    display: flex;
    align-items: center;
    gap: 8px;
}

.daily-review__mood-section {
    margin-left: auto;
}

.daily-review__tags-flow-inline {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
}

.tag-chip-small {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 999px;
    background: linear-gradient(135deg, #7D5A36, #6B4A2E);
    color: #FFFFFF;
    font-size: 0.75rem;
    font-weight: 600;
    box-shadow: 0 8px 14px rgba(125, 90, 54, 0.15);
}

.tag-chip__remove-small {
    background: #FFFFFF;
    color: #7D5A36;
    border: none;
    width: 16px;
    height: 16px;
    line-height: 1;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    cursor: pointer;
    transition: background 0.2s ease;
}

.tag-chip__remove-small:hover {
    background: rgba(255, 255, 255, 0.7);
}

.tag-input-small {
    min-width: 100px;
    padding: 6px 10px;
    border-radius: 10px;
    border: 1px dashed rgba(125, 90, 54, 0.35);
    background: #FFFFFF;
    color: #4E3B2B;
    font-size: 0.75rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.tag-input-small:focus {
    outline: none;
    border-color: rgba(125, 90, 54, 0.6);
    box-shadow: 0 0 0 2px rgba(125, 90, 54, 0.2);
}

.mood-picker-inline {
    width: 260px;
}

.meta-icon__glyph {
    font-size: 18px;
}

.meta-icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(255, 244, 219, 0.85), rgba(255, 236, 200, 0.9));
    box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.6);
    flex-shrink: 0;
}

.meta-icon__glyph {
    width: 20px;
    height: 20px;
    color: #7D5A36;
}

.date-input {
    width: 100%;
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid rgba(125, 90, 54, 0.25);
    background: #FFFFFF;
    color: #4E3B2B;
    font-weight: 600;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
}

.date-input:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(125, 90, 54, 0.12);
    border-color: rgba(125, 90, 54, 0.4);
}

.date-input:focus {
    outline: none;
    border-color: #7D5A36;
    box-shadow: 0 0 0 3px rgba(125, 90, 54, 0.22);
    transform: translateY(-1px);
}

/* Custom date picker styling for DaySummary */
.date-input::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s ease;
}

.date-input::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
}

.date-input::-webkit-datetime-edit-month-field,
.date-input::-webkit-datetime-edit-day-field,
.date-input::-webkit-datetime-edit-year-field {
    padding: 0.2em 0.3em;
    border-radius: 4px;
    font-weight: 600;
}

.date-input::-webkit-datetime-edit-month-field:focus,
.date-input::-webkit-datetime-edit-day-field:focus,
.date-input::-webkit-datetime-edit-year-field:focus {
    background: rgba(125, 90, 54, 0.15);
    outline: none;
}

.meta-label {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(125, 90, 54, 0.6);
    margin-bottom: 2px;
}

.meta-value {
    font-size: 0.95rem;
    font-weight: 600;
    color: #4E3B2B;
}

.daily-review__editor-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.editor-shell {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.editor-surface {
    background: #FFFFFF;
    border-radius: 16px;
    border: 1px solid rgba(210, 196, 160, 0.45);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 14px;
}

.editor-surface--quill {
    padding: 0;
    overflow: hidden;
}

.editor-surface--loading .skeleton-chip {
    border-radius: 10px;
    background: rgba(242, 226, 201, 0.9);
    height: 28px;
}

.editor-surface--loading .skeleton-bar {
    height: 14px;
    border-radius: 8px;
    background: rgba(242, 226, 201, 0.9);
}

.editor-surface--loading .skeleton-bar.short {
    width: 60%;
}

:deep(.editor-surface--quill .ql-toolbar.ql-snow) {
    border: none;
    background: #FFF5E8;
    padding: 10px 14px;
}

:deep(.editor-surface--quill .ql-container.ql-snow) {
    border: none;
    padding: 14px;
}

:deep(.editor-surface--quill .ql-editor) {
    min-height: 200px;
    font-size: 0.95rem;
    color: #4E3B2B;
    font-family: inherit;
    background: #FFFFFF;
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

