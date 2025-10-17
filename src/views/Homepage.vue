<template>
    <div class="h-screen flex gradient-bg">
        <!-- Sidebar -->
        <div
            class="w-64 sidebar-gradient p-6 warm-shadow-lg flex flex-col h-full"
            :aria-hidden="isOverlayActive ? 'true' : 'false'"
            :inert="isOverlayActive"
        >
            <h2 class="text-[#4E3B2B] mb-8 text-2xl font-bold tracking-wide">📝 MoodNotes</h2>
            <nav class="flex-1">
                <ul class="list-none p-0 space-y-2">
                    <li class="mb-3">
                        <a href="#" class="text-[#4E3B2B] no-underline flex items-center p-3 rounded-lg hover-lift transition-all duration-200 hover:bg-[#FAF3E0]">
                            <List class="mr-3" :size="20" />
                            <span class="font-medium">Home</span>
                        </a>
                    </li>
                    <li class="mb-3">
                        <a href="#" class="text-[#4E3B2B] no-underline flex items-center p-3 rounded-lg hover-lift transition-all duration-200 hover:bg-[#FAF3E0]"
                            @click="isDetailedCalendarOpen = true">
                            <Calendar class="mr-3" :size="20" />
                            <span class="font-medium">Calendar</span>
                        </a>
                    </li>
                    <li class="mb-3">
                        <a href="#" class="text-[#4E3B2B] no-underline flex items-center p-3 rounded-lg hover-lift transition-all duration-200 hover:bg-[#FAF3E0]"
                            @click="isHabitPopupOpen = true">
                            <BookOpen class="mr-3" :size="20" />
                            <span class="font-medium">Habits</span>
                        </a>
                    </li>
                    <li class="mb-3">
                        <a href="#" class="text-[#4E3B2B] no-underline flex items-center p-3 rounded-lg hover-lift transition-all duration-200 hover:bg-[#FAF3E0]"
                            @click="isSearchPanelOpen = true">
                            <Search class="mr-3" :size="20" />
                            <span class="font-medium">Search</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" class="text-[#4E3B2B] no-underline flex items-center p-3 rounded-lg hover-lift transition-all duration-200 hover:bg-[#FAF3E0]"
                            @click="isBackupPanelOpen = true">
                            <Download class="mr-3" :size="20" />
                            <span class="font-medium">Backup</span>
                        </a>
                    </li>
                </ul>
            </nav>
            
            <!-- Theme Switcher -->
            <div class="mt-4 pt-4 border-t border-[#C5B891]">
                <ThemeSwitcher />
            </div>
        </div>

        <!-- Main Content -->
        <div
            class="flex-1 p-6 overflow-y-auto custom-scrollbar"
            :aria-hidden="isOverlayActive ? 'true' : 'false'"
            :inert="isOverlayActive"
        >
            <!-- Tab Navigation -->
            <TabNavigation
                :tabs="[
                    { id: 'dashboard', label: 'Dashboard', icon: List },
                    { id: 'journal', label: 'Journal', icon: BookOpen, badge: daySummaries.length },
                    { id: 'tasks', label: 'Tasks', icon: CheckCircle2, badge: tasks.length },
                ]"
                :activeTab="activeTab"
                @change="(tab) => activeTab = tab"
            />

            <!-- Dashboard Tab -->
            <div v-show="activeTab === 'dashboard'" class="space-y-6">
                <!-- Today's Summary -->
                <TodaySummary
                    @open-entry="openJournalForToday"
                    @open-habits="isHabitPopupOpen = true"
                    @view-insights="activeTab = 'journal'"
                />

                <div class="grid gap-6 lg:grid-cols-3">
                    <div class="glass-effect p-6 rounded-2xl warm-shadow-lg flex flex-col justify-between lg:col-span-2">
                        <div class="flex flex-col gap-6">
                            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                                <div>
                                    <p class="text-xs font-semibold uppercase tracking-widest text-[#7D5A36]/70">{{ formattedToday }}</p>
                                    <h2 class="text-3xl sm:text-4xl font-bold text-[#4E3B2B] mt-2">{{ greetingMessage }}, friend 👋</h2>
                                    <p class="text-[#7D5A36] mt-3 max-w-xl">Here’s a quick snapshot of your mood and memories. Keep the streak going!</p>
                                </div>
                                <div class="glass-effect px-4 py-3 rounded-xl min-w-[180px] text-[#4E3B2B] border border-[#D3C9A6]/50">
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm font-semibold text-[#7D5A36]/80 uppercase tracking-wide">Current Mood</span>
                                        <span class="text-3xl">{{ currentMoodEmoji }}</span>
                                    </div>
                                    <p class="text-sm mt-2">{{ currentDaySummary?.mood ? currentDaySummary.mood.charAt(0).toUpperCase() + currentDaySummary.mood.slice(1) : 'No entry yet' }}</p>
                                    <div class="mt-3 flex items-center justify-between text-sm">
                                        <span class="text-[#7D5A36]/80 uppercase tracking-wide font-semibold">Energy</span>
                                        <span class="font-semibold text-[#4E3B2B]">{{ currentEnergyLevel !== null ? `${currentEnergyLevel}/10` : '—' }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-wrap gap-3">
                                <button @click="openJournalForToday"
                                    class="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white font-semibold hover-lift transition-all duration-200 warm-shadow">
                                    <FileText :size="18" />
                                    New Entry
                                </button>
                                <button @click="openTaskModal"
                                    class="flex items-center gap-2 px-5 py-3 rounded-xl glass-effect border border-[#D3C9A6]/60 text-[#4E3B2B] font-semibold hover-lift transition-all duration-200">
                                    <Plus :size="18" />
                                    Add Task
                                </button>
                                <button @click="openSearchModal"
                                    class="flex items-center gap-2 px-5 py-3 rounded-xl glass-effect border border-[#D3C9A6]/60 text-[#4E3B2B] font-semibold hover-lift transition-all duration-200">
                                    <Search :size="18" />
                                    Search Entries
                                </button>
                            </div>
                            <div
                                class="daily-quote-card glass-effect px-4 py-4 rounded-2xl text-[#4E3B2B] border border-[#D3C9A6]/40"
                                role="note"
                                aria-live="polite"
                            >
                                <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div class="flex items-start gap-3 flex-1">
                                        <span class="text-3xl sm:text-4xl" aria-hidden="true">✨</span>
                                        <div class="space-y-2">
                                            <p v-if="isQuoteLoading" class="text-sm sm:text-base text-[#7D5A36]">Loading today's inspiration...</p>
                                            <template v-else-if="quoteText">
                                                <p class="text-base sm:text-lg font-medium leading-relaxed">“{{ quoteText }}”</p>
                                                <p v-if="quoteAuthor" class="text-sm text-[#7D5A36]/80">— {{ quoteAuthor }}</p>
                                            </template>
                                            <p v-else-if="quoteError" class="text-sm text-red-600">{{ quoteError }}</p>
                                            <p v-else class="text-sm sm:text-base text-[#7D5A36]">{{ quotePlaceholderCopy }}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        class="inline-flex items-center gap-2 self-start sm:self-center px-4 py-2 rounded-xl bg-[#7D5A36] text-white text-sm font-semibold hover:bg-[#6B4A2E] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D5A36] disabled:opacity-60 disabled:cursor-not-allowed"
                                        @click="refreshQuote"
                                        :disabled="isQuoteLoading"
                                        :aria-busy="isQuoteLoading"
                                        aria-label="Refresh daily quote"
                                    >
                                        <RefreshCcw :size="16" aria-hidden="true" />
                                        <span>{{ isQuoteLoading ? 'Refreshing…' : 'New quote' }}</span>
                                    </button>
                                </div>
                                <div class="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#7D5A36]/80">
                                    <span class="inline-flex items-center gap-1">
                                        <span class="w-2 h-2 rounded-full bg-[#7D5A36]" aria-hidden="true"></span>
                                        <span>{{ quoteSourceLabel }}</span>
                                    </span>
                                    <span v-if="quoteUpdatedLabel" :title="quoteUpdatedTitle">Updated {{ quoteUpdatedLabel }}</span>
                                    <span v-else>Waiting for first quote</span>
                                    <span v-if="quoteError" class="text-red-600">Offline mode — {{ quoteError }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="glass-effect p-6 rounded-2xl warm-shadow fade-in border border-[#7D5A36]/20 flex flex-col justify-between">
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="text-lg font-bold text-[#4E3B2B] flex items-center">
                                <span class="mr-2">🕰️</span>Last Year Today
                            </h3>
                            <button
                                @click="selectedDate = lastYearDateString; isDaySummaryFormOpen = true"
                                class="text-[#7D5A36] hover:text-opacity-80 text-sm font-medium hover:underline"
                            >
                                View Entry →
                            </button>
                        </div>
                        <div v-if="hasHistoricalData" class="space-y-3">
                            <div class="flex items-center justify-between">
                                <span class="text-[#4E3B2B] text-sm font-medium">{{ lastYearDateString }}</span>
                                <span class="text-3xl">{{ mapMoodToEmotion(lastYearMood || 'neutral').emoji }}</span>
                            </div>
                            <p class="text-[#7D5A36] text-sm italic line-clamp-3">{{ lastYearSummaryPreview || 'No summary available' }}</p>
                            <div v-if="lastYearTags.length > 0" class="flex flex-wrap gap-2">
                                <span
                                    v-for="tag in lastYearTags.slice(0, 4)"
                                    :key="tag"
                                    class="text-xs px-2 py-1 bg-[#7D5A36]/10 text-[#7D5A36] rounded-full"
                                >
                                    {{ tag }}
                                </span>
                                <span v-if="lastYearTags.length > 4" class="text-xs px-2 py-1 text-[#7D5A36]">
                                    +{{ lastYearTags.length - 4 }} more
                                </span>
                            </div>
                        </div>
                        <div v-else class="text-sm text-[#7D5A36]/80">
                            <p class="font-medium mb-2">No entry from this day last year.</p>
                            <p>Capture today’s thoughts to unlock throwbacks in the future.</p>
                        </div>
                    </div>
                </div>

                <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div v-for="stat in dashboardStats" :key="stat.label"
                        class="glass-effect p-5 rounded-2xl warm-shadow hover-lift transition-all duration-200 flex flex-col gap-3">
                        <div class="flex items-center justify-between">
                            <span class="text-2xl">{{ stat.icon }}</span>
                            <span class="text-xs font-semibold uppercase tracking-wide text-[#7D5A36]/70">{{ stat.label }}</span>
                        </div>
                        <p class="text-3xl font-bold text-[#4E3B2B]">{{ stat.value }}</p>
                        <p class="text-sm text-[#7D5A36]/80">{{ stat.description }}</p>
                    </div>
                </div>

                <div class="grid gap-6 lg:grid-cols-3">
                    <div class="glass-effect p-6 rounded-2xl warm-shadow-lg flex flex-col gap-4 lg:col-span-2">
                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <h3 class="text-xl font-bold text-[#4E3B2B] flex items-center gap-2">
                                    <span>📖</span>
                                    Latest Entry
                                </h3>
                                <p class="text-sm text-[#7D5A36]/80">A quick peek at what you captured most recently.</p>
                            </div>
                            <button v-if="latestSummary"
                                @click="handleSelectEntry(latestSummary)"
                                class="text-sm font-semibold text-[#7D5A36] hover:underline">
                                Open Entry
                            </button>
                        </div>
                        <div v-if="latestSummary" class="space-y-4">
                            <div class="flex items-center justify-between text-sm text-[#7D5A36]/80">
                                <span>{{ new Date(latestSummary.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) }}</span>
                                <span class="flex items-center gap-2">
                                    <span class="text-xl">{{ mapMoodToEmotion(latestSummary.mood || 'neutral').emoji }}</span>
                                    {{ latestSummary.mood ? latestSummary.mood.charAt(0).toUpperCase() + latestSummary.mood.slice(1) : 'Mood not set' }}
                                </span>
                            </div>
                            <p class="text-[#4E3B2B] leading-relaxed">{{ latestEntryPreview || 'No content written yet...' }}</p>
                            <div class="flex flex-wrap items-center gap-3 text-xs text-[#7D5A36]/70">
                                <span class="px-3 py-1.5 rounded-full bg-[#7D5A36]/10 text-[#7D5A36] font-semibold">
                                    {{ getWordCount(latestSummary.summary) }} words
                                </span>
                                <span v-if="latestSummary.dailyCheck" class="px-3 py-1.5 rounded-full bg-[#7D5A36]/10 text-[#7D5A36] font-semibold">
                                    Energy {{ latestSummary.dailyCheck.energyLevel }}/10
                                </span>
                                <span v-if="latestSummary.tags && latestSummary.tags.length" class="flex items-center gap-2">
                                    <span class="text-[#7D5A36]">Tags:</span>
                                    <span v-for="tag in latestSummary.tags.slice(0, 3)" :key="tag" class="px-2 py-1 bg-[#7D5A36]/10 text-[#7D5A36] rounded-full">
                                        #{{ tag }}
                                    </span>
                                </span>
                            </div>
                        </div>
                        <div v-else class="text-sm text-[#7D5A36]/80">
                            <p class="font-medium mb-2">You haven’t logged anything yet.</p>
                            <p>Start with a quick diary entry to build your personal timeline.</p>
                        </div>
                    </div>

                    <div class="glass-effect p-6 rounded-2xl warm-shadow-lg flex flex-col gap-4">
                        <div class="flex items-start justify-between">
                            <div>
                                <h3 class="text-xl font-bold text-[#4E3B2B] flex items-center gap-2">
                                    <span>🧾</span>
                                    Upcoming Tasks
                                </h3>
                                <p class="text-sm text-[#7D5A36]/80">Stay ahead with the next few due items.</p>
                            </div>
                            <span class="text-xs font-semibold px-3 py-1 rounded-full"
                                :class="overdueTasksCount > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
                                {{ overdueTasksCount > 0 ? `${overdueTasksCount} overdue` : 'All clear' }}
                            </span>
                        </div>

                        <ul v-if="upcomingTasks.length" class="space-y-3">
                            <li v-for="task in upcomingTasks" :key="task.id"
                                class="border border-[#D3C9A6]/40 rounded-xl px-4 py-3 flex items-start justify-between gap-3">
                                <div>
                                    <p class="font-semibold text-[#4E3B2B]">{{ task.description }}</p>
                                    <p class="text-xs text-[#7D5A36]/70 mt-1">{{ describeTaskDueDate(task.dueDate) }}</p>
                                </div>
                                <span class="text-xs px-2 py-1 rounded-full bg-[#7D5A36]/10 text-[#7D5A36] font-semibold">{{ task.priority }}</span>
                            </li>
                        </ul>
                        <div v-else class="text-sm text-[#7D5A36]/80">
                            <p class="font-medium mb-2">No tasks due this week.</p>
                            <p>Add a task to keep your plans organized.</p>
                        </div>

                        <div v-if="tasksWithoutDueDateCount > 0" class="text-xs text-[#7D5A36]/70">
                            + {{ tasksWithoutDueDateCount }} task{{ tasksWithoutDueDateCount === 1 ? '' : 's' }} without a due date
                        </div>

                        <button @click="openTaskModal"
                            class="self-start mt-auto px-5 py-3 rounded-xl bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white font-semibold hover-lift transition-all duration-200 warm-shadow">
                            Add Task
                        </button>
                    </div>
                </div>

                <div class="grid gap-6 lg:grid-cols-3">
                    <div class="glass-effect p-6 rounded-2xl warm-shadow flex flex-col gap-4">
                        <div class="flex items-start justify-between">
                            <h3 class="text-xl font-bold text-[#4E3B2B] flex items-center gap-2">
                                <span>🔥</span>
                                Habit Highlight
                            </h3>
                            <button @click="isHabitPopupOpen = true" class="text-xs font-semibold text-[#7D5A36] hover:underline">
                                Manage
                            </button>
                        </div>
                        <div v-if="highlightedHabit" class="space-y-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="font-semibold text-[#4E3B2B]">{{ highlightedHabit.name }}</p>
                                    <p class="text-sm text-[#7D5A36]/80">{{ highlightedHabit.description || 'No description added yet.' }}</p>
                                </div>
                                <HabitStreak :habit-id="highlightedHabit.id" :statuses="highlightedHabit.statuses" />
                            </div>
                            <p class="text-sm text-[#7D5A36]/80">Current streak: <strong class="text-[#4E3B2B]">{{ highlightedHabitStreak }}</strong> day{{ highlightedHabitStreak === 1 ? '' : 's' }}</p>
                        </div>
                        <div v-else class="text-sm text-[#7D5A36]/80">
                            <p class="font-medium mb-2">No habits tracked yet.</p>
                            <p>Add a habit to build healthy routines and see it highlighted here.</p>
                        </div>
                    </div>

                    <div class="glass-effect p-6 rounded-2xl warm-shadow flex flex-col gap-4">
                        <div class="flex items-start justify-between">
                            <h3 class="text-xl font-bold text-[#4E3B2B] flex items-center gap-2">
                                <span>⚡</span>
                                Recent Sparks
                            </h3>
                            <span class="text-xs text-[#7D5A36]/70">{{ recentSparks.length }} logged</span>
                        </div>
                        <div v-if="recentSparks.length" class="space-y-3">
                            <div class="border border-[#D3C9A6]/40 rounded-xl px-4 py-3"
                                v-for="(spark, index) in recentSparks.slice(0, 3)" :key="index">
                                <p class="text-sm text-[#4E3B2B]">{{ spark }}</p>
                            </div>
                            <p v-if="recentSparks.length > 3" class="text-xs text-[#7D5A36]/70">+ {{ recentSparks.length - 3 }} more sparks</p>
                        </div>
                        <div v-else class="text-sm text-[#7D5A36]/80">
                            <p class="font-medium mb-2">Capture a bright idea.</p>
                            <p>Use the spark field below to jot down inspiration and highlights.</p>
                        </div>
                    </div>

                    <div class="glass-effect p-6 rounded-2xl warm-shadow flex flex-col gap-4">
                        <h3 class="text-xl font-bold text-[#4E3B2B] flex items-center gap-2">
                            <span>🧠</span>
                            Comparison Notes
                        </h3>
                        <div v-if="comparisonSummary.exists" class="space-y-3 text-sm text-[#7D5A36]/80">
                            <p><strong class="text-[#4E3B2B]">Mood match:</strong> {{ comparisonSummary.mood ? comparisonSummary.mood : 'n/a' }}</p>
                            <p v-if="comparisonSummary.tags && comparisonSummary.tags.length"><strong class="text-[#4E3B2B]">Tags:</strong> {{ comparisonSummary.tags.slice(0, 3).join(', ') }}<span v-if="comparisonSummary.tags.length > 3"> +{{ comparisonSummary.tags.length - 3 }} more</span></p>
                            <p>{{ comparisonSummary.preview }}</p>
                        </div>
                        <div v-else class="text-sm text-[#7D5A36]/80">
                            <p class="font-medium mb-2">Start your history.</p>
                            <p>Log entries consistently to see meaningful comparisons a year from now.</p>
                        </div>
                    </div>
                </div>

                <!-- Calendar -->
                <div class="mb-6 fade-in" @click="testClick">
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
                <div class="grid grid-cols-7 gap-3 glass-effect p-5 rounded-xl warm-shadow">
                    <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day"
                        class="text-center font-bold text-[#7D5A36]">
                        {{ day }}
                    </div>
                    <template v-for="(day, index) in calendarDays" :key="index">
                        <div v-if="day.type === 'day'" class="calendar-day"
                            :class="{ 'last-year-anniversary': day.isLastYearAnniversary }"
                            :style="{ backgroundColor: day.emotion.color || '#FFFFFF' }"
                            @click="handleDayClick(day.date)"
                            @keyup.enter="handleDayClick(day.date)"
                            @keyup.space="handleDayClick(day.date)"
                            tabindex="0"
                            role="button"
                            :aria-label="`Day ${day.day}, ${hasSummary(day.date) ? 'has summary' : 'no summary'}${day.isLastYearAnniversary ? ', anniversary of last year' : ''}`">
                            <div v-if="day.isLastYearAnniversary" class="anniversary-badge">🕰️</div>
                            <div v-if="hasSummary(day.date)" class="emotion-icon">{{ day.emotion.emoji || '⬜️' }}</div>
                            <span>{{ day.day }}</span>
                            <div v-if="hasTasks(day.date)" class="task-indicator"></div>
                            <div v-if="hasSummary(day.date)" class="summary-indicator"></div>
                        </div>
                        <div v-else class="calendar-day empty"></div>
                    </template>
                </div>
            </div>

            <!-- Analytics Charts -->
            <div class="grid gap-6 lg:grid-cols-2 mb-6">
                <MoodTrendChart />
                <WordCountChart />
            </div>

            <div class="mb-6">
                <EnergyStressChart />
            </div>

            <!-- Habit Trend Insights -->
            <div class="mb-6">
                <HabitTrendInsights @manage-habits="isHabitPopupOpen = true" />
            </div>

            <!-- Monthly Summary -->
            <div class="glass-effect rounded-xl warm-shadow-lg overflow-hidden mb-8 fade-in">
                <div @click="toggleMonthlySummary"
                    class="bg-gradient-to-r from-[#4E3B2B] to-[#5D4433] p-5 flex justify-between items-center cursor-pointer hover-lift">
                    <h3 class="text-xl font-bold text-white flex items-center"><span class="mr-2">📊</span>Monthly Summary</h3>
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

            </div>

            <!-- Journal Tab -->
            <div v-show="activeTab === 'journal'">
                <div class="mb-6 fade-in">
                    <!-- Header with Actions -->
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h3 class="text-2xl font-bold text-[#4E3B2B] flex items-center">
                                <span class="mr-3 text-3xl">📖</span>Your Journal
                            </h3>
                            <p class="text-[#7D5A36] text-sm mt-1">{{ daySummaries.length }} entries captured</p>
                        </div>
                        <button
                            @click="isDaySummaryFormOpen = true; selectedDate = new Date().toISOString().split('T')[0]"
                            class="bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white px-6 py-3 rounded-xl hover-lift transition-all duration-200 flex items-center warm-shadow font-semibold"
                        >
                            <FileText class="mr-2" :size="20" />
                            New Entry
                        </button>
                    </div>

                    <!-- Today's Habit Completion Module -->
                    <div class="mb-6">
                        <TodayHabitCompletion @manage-habits="isHabitPopupOpen = true" />
                    </div>

                    <EmptyState
                        v-if="daySummaries.length === 0"
                        icon="📔"
                        title="Start your journaling journey"
                        description="Capture your thoughts, feelings, and experiences. Your first entry is just a click away."
                        actionText="Write First Entry"
                        :actionIcon="FileText"
                        @action="isDaySummaryFormOpen = true; selectedDate = new Date().toISOString().split('T')[0]"
                    />

                    <!-- Journal Entries Grid with Virtual Scrolling -->
                    <DynamicScroller
                        v-else
                        :items="reversedDaySummaries"
                        :min-item-size="250"
                        class="space-y-4"
                        key-field="date"
                        :buffer="300"
                    >
                        <template #default="{ item: summary, index, active }">
                            <DynamicScrollerItem
                                :item="summary"
                                :active="active"
                                :size-dependencies="[
                                    summary.summary,
                                    summary.tags?.length,
                                    summary.dailyCheck
                                ]"
                                :data-index="index"
                                class="mb-4"
                            >
                                <div
                                    @click="selectedDate = summary.date; isDaySummaryFormOpen = true"
                                    @keydown.enter="selectedDate = summary.date; isDaySummaryFormOpen = true"
                                    @keydown.space.prevent="selectedDate = summary.date; isDaySummaryFormOpen = true"
                                    tabindex="0"
                                    role="button"
                                    :aria-label="`Journal entry from ${new Date(summary.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}, mood: ${summary.mood || 'neutral'}`"
                                    class="journal-entry glass-effect rounded-2xl cursor-pointer hover-lift transition-all duration-300 warm-shadow overflow-hidden group"
                                >
                                    <!-- Entry Header -->
                                    <div class="bg-gradient-to-r from-[#7D5A36]/5 to-[#6B4A2E]/5 p-5 border-b border-[#D3C9A6]/30">
                                        <div class="flex justify-between items-start">
                                            <div class="flex-1">
                                                <div class="flex items-center gap-3 mb-2">
                                                    <span class="text-4xl" aria-hidden="true">{{ summary.mood ? mapMoodToEmotion(summary.mood).emoji : '😐' }}</span>
                                                    <div>
                                                        <h4 class="text-lg font-bold text-[#4E3B2B]">
                                                            {{ new Date(summary.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) }}
                                                        </h4>
                                                        <p class="text-xs text-[#7D5A36]/70">{{ formatRelativeTime(summary.date) }}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Entry Indicators -->
                                            <div class="flex gap-2">
                                                <span v-if="summary.media && summary.media.length > 0"
                                                    class="px-2 py-1 bg-[#7D5A36]/10 rounded-lg text-xs text-[#7D5A36] flex items-center gap-1"
                                                    :title="`${summary.media.length} media file(s)`">
                                                    <Camera :size="14" aria-hidden="true" />
                                                    {{ summary.media.length }}
                                                </span>
                                                <span v-if="summary.habits && summary.habits.length > 0"
                                                    class="px-2 py-1 bg-green-500/10 rounded-lg text-xs text-green-700 flex items-center gap-1"
                                                    :title="`${completedHabitCount(summary.habits)}/${summary.habits.length} habits completed`">
                                                    ✓ {{ completedHabitCount(summary.habits) }}/{{ summary.habits.length }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Entry Content -->
                                    <div class="p-5">
                                        <p class="text-[#4E3B2B] text-base leading-relaxed line-clamp-4 mb-4">
                                            {{ stripHtml(summary.summary || '') || 'No content written yet...' }}
                                        </p>

                                        <!-- Tags and Metadata -->
                                        <div class="flex flex-wrap items-center gap-3">
                                            <div v-if="summary.tags && summary.tags.length > 0" class="flex flex-wrap gap-2 flex-1">
                                                <span
                                                    v-for="tag in summary.tags.slice(0, 5)"
                                                    :key="tag"
                                                    class="text-xs px-3 py-1.5 bg-[#7D5A36]/10 text-[#7D5A36] rounded-full font-medium hover:bg-[#7D5A36]/20 transition-colors"
                                                >
                                                    #{{ tag }}
                                                </span>
                                                <span v-if="summary.tags.length > 5" class="text-xs px-3 py-1.5 text-[#7D5A36]/60">
                                                    +{{ summary.tags.length - 5 }} more
                                                </span>
                                            </div>

                                            <!-- Word Count -->
                                            <div class="text-xs text-[#7D5A36]/60 font-medium">
                                                {{ getWordCount(summary.summary) }} words
                                            </div>
                                        </div>

                                        <!-- Daily Check Preview -->
                                        <div v-if="summary.dailyCheck" class="mt-4 pt-4 border-t border-[#D3C9A6]/30 flex gap-4 text-xs">
                                            <div class="flex items-center gap-1.5">
                                                <span aria-hidden="true">⚡</span>
                                                <span class="text-[#7D5A36]/70">Energy:</span>
                                                <span class="font-semibold text-[#4E3B2B]">{{ summary.dailyCheck.energyLevel }}/10</span>
                                            </div>
                                            <div class="flex items-center gap-1.5">
                                                <span aria-hidden="true">😅</span>
                                                <span class="text-[#7D5A36]/70">Stress:</span>
                                                <span class="font-semibold text-[#4E3B2B]">{{ summary.dailyCheck.stressLevel }}/10</span>
                                            </div>
                                            <div class="flex items-center gap-1.5">
                                                <span aria-hidden="true">🎨</span>
                                                <span class="text-[#7D5A36]/70">Productivity:</span>
                                                <span class="font-semibold text-[#4E3B2B]">{{ summary.dailyCheck.productivity }}/10</span>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Hover Action Hint -->
                                    <div class="bg-[#7D5A36]/5 px-5 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <p class="text-xs text-[#7D5A36] text-center font-medium">Click to view and edit this entry</p>
                                    </div>
                                </div>
                            </DynamicScrollerItem>
                        </template>
                    </DynamicScroller>
                </div>
            </div>

            <!-- Tasks Tab -->
            <div v-show="activeTab === 'tasks'">
                <div class="bounce-in">
                    <h3 class="text-xl font-bold text-[#4E3B2B] mb-4 flex items-center"><span class="mr-2">✅</span>All Tasks</h3>
                    <button @click="isTaskFormOpen = true"
                        class="flex items-center glass-effect p-4 rounded-xl border-0 cursor-pointer w-full mb-4 hover-lift transition-all duration-200 warm-shadow">
                        <Plus color="#7D5A36" :size="24" class="mr-3" />
                        <span class="text-[#4E3B2B] font-medium">Add new task</span>
                    </button>

                    <EmptyState
                        v-if="tasks.length === 0"
                        icon="📋"
                        title="No tasks yet"
                        description="Start organizing your day by adding your first task. Set priorities and due dates to stay on track."
                        actionText="Add Task"
                        :actionIcon="Plus"
                        @action="isTaskFormOpen = true"
                    />

                    <div v-else v-for="(task, index) in tasks" :key="index"
                        class="glass-effect p-4 rounded-lg mb-3 flex justify-between items-center hover-lift transition-all duration-200 warm-shadow">
                        <span class="text-[#4E3B2B] font-medium">{{ task.description }}</span>
                        <span class="text-[#7D5A36] text-sm font-semibold px-2 py-1 bg-[#7D5A36] bg-opacity-10 rounded-full">{{ task.priority }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Day Summary Modal -->
        <DaySummary
            v-if="isDaySummaryFormOpen"
            :selectedDate="selectedDate"
            @close="closeDaySummary"
        />

        <!-- Task Form Modal -->
        <div v-if="isTaskFormOpen" class="fixed inset-0 modal-backdrop flex items-center justify-center z-50" role="presentation">
            <div
                ref="taskFormRef"
                class="glass-effect max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto rounded-2xl p-8 warm-shadow-lg bounce-in"
                role="dialog"
                aria-modal="true"
                aria-labelledby="task-form-title"
            >
                <div class="flex justify-between items-center mb-6">
                    <h2 id="task-form-title" class="text-2xl font-bold text-[#4E3B2B] flex items-center"><span class="mr-2">✒️</span>Create Task</h2>
                    <button type="button" @click="isTaskFormOpen = false" class="text-[#7D5A36] hover:text-opacity-80 p-2 hover:bg-[#7D5A36] hover:bg-opacity-10 rounded-lg transition-all" aria-label="Close task form">
                        <X :size="24" />
                    </button>
                </div>

                <form @submit.prevent="handleSaveTask" class="space-y-6">
                    <div class="space-y-2">
                        <label class="block text-sm font-semibold text-[#4E3B2B]" for="task-description">Description</label>
                        <textarea id="task-description" v-model="newTask.description"
                            class="w-full px-4 py-3 glass-effect text-[#4E3B2B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7D5A36] transition-all"
                            rows="3" placeholder="Take out the trash"></textarea>
                    </div>

                    <div class="space-y-2">
                        <label class="block text-sm font-semibold text-[#4E3B2B] mb-3">Priority</label>
                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <label v-for="priority in ['Lowest', 'Low', 'Normal', 'Medium', 'High', 'Highest']"
                                :key="priority"
                                class="relative flex items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-200 border-2"
                                :class="newTask.priority === priority
                                    ? 'border-[#7D5A36] bg-gradient-to-br from-[#7D5A36]/10 to-[#6B4A2E]/10 warm-shadow scale-105'
                                    : 'border-[#D3C9A6]/40 glass-effect hover:border-[#7D5A36]/50 hover:bg-[#F0E9D2]/50'"
                            >
                                <input
                                    type="radio"
                                    :value="priority"
                                    v-model="newTask.priority"
                                    class="sr-only"
                                    name="task-priority"
                                />
                                <div class="flex flex-col items-center gap-1">
                                    <span class="text-lg" :class="newTask.priority === priority ? 'scale-110' : ''">
                                        {{ getPriorityIcon(priority) }}
                                    </span>
                                    <span
                                        class="text-sm font-semibold transition-colors"
                                        :class="newTask.priority === priority ? 'text-[#7D5A36]' : 'text-[#4E3B2B]'"
                                    >
                                        {{ priority }}
                                    </span>
                                </div>
                                <div
                                    v-if="newTask.priority === priority"
                                    class="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#7D5A36] flex items-center justify-center"
                                >
                                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label class="block text-sm font-semibold text-[#4E3B2B]" for="task-due-date">Due Date</label>
                        <input id="task-due-date" v-model="newTask.dueDate" type="date"
                            class="w-full px-4 py-3 glass-effect text-[#4E3B2B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7D5A36] transition-all" />
                    </div>

                    <div class="flex justify-end">
                        <button type="submit"
                            class="px-6 py-3 bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white rounded-xl hover-lift transition-all duration-200 font-semibold warm-shadow">
                            Save Task
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Detailed Calendar Popup -->
        <div v-if="isDetailedCalendarOpen"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            role="presentation">
            <div
                ref="detailedCalendarRef"
                class="bg-[#FAF3E0] max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg p-6"
                role="dialog"
                aria-modal="true"
                aria-labelledby="detailed-calendar-title"
            >
                <div class="flex justify-between items-center mb-4">
                    <h2 id="detailed-calendar-title" class="text-xl font-bold text-[#4E3B2B]">Detailed Calendar</h2>
                    <button id="detailed-calendar-close" type="button" @click="isDetailedCalendarOpen = false" class="text-[#7D5A36] hover:text-opacity-80" aria-label="Close detailed calendar">
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
        <div v-if="isHabitPopupOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" role="presentation">
            <div
                ref="habitPopupRef"
                class="bg-[#FAF3E0] max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg p-6"
                role="dialog"
                aria-modal="true"
                aria-labelledby="habit-popup-title"
            >
                <div class="flex justify-between items-center mb-4">
                    <h2 id="habit-popup-title" class="text-xl font-bold text-[#4E3B2B]">Habits</h2>
                    <button id="habit-popup-close" type="button" @click="isHabitPopupOpen = false" class="text-[#7D5A36] hover:text-opacity-80" aria-label="Close habits popup">
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
                                    <td class="p-3 text-[#4E3B2B]">
                                        <div class="flex items-center gap-2">
                                            <span>{{ habit.name }}</span>
                                            <HabitStreak v-if="habit.statuses" :habitId="habit.id" :statuses="habit.statuses" />
                                        </div>
                                    </td>
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

        <!-- Search Panel -->
    <div v-if="isSearchPanelOpen" class="fixed inset-0 modal-backdrop flex items-center justify-center z-50" role="presentation">
            <div class="max-w-6xl w-full mx-4">
                <SearchPanel @close="isSearchPanelOpen = false" @select-entry="handleSelectEntry" />
            </div>
        </div>

        <!-- Backup Panel -->
    <div v-if="isBackupPanelOpen" class="fixed inset-0 modal-backdrop flex items-center justify-center z-50" role="presentation">
            <div class="max-w-4xl w-full mx-4">
                <BackupPanel @close="isBackupPanelOpen = false" />
            </div>
        </div>

        <!-- Add/Edit Habit Modal -->
        <div v-if="isHabitModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" role="presentation">
            <div
                ref="habitModalRef"
                class="bg-[#FAF3E0] p-6 rounded-lg w-full max-w-md"
                role="dialog"
                aria-modal="true"
                aria-labelledby="habit-modal-title"
            >
                <h2 id="habit-modal-title" class="text-2xl font-bold text-[#4E3B2B] mb-4">{{ editingHabit ? 'Edit' : 'Add' }} Habit</h2>
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

    <!-- Developer Panel (only in development) -->
    <DevPanel />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { Calendar, Clock, BookOpen, List, Plus, Camera, Video, ChevronLeft, ChevronRight, ChevronDownIcon, X, CheckCircle2, XCircle, FileText, Edit2, Search, Download, Upload, RefreshCcw } from 'lucide-vue-next'
import DaySummary from './DaySummary.vue'
import SummaryCard from '../components/SummaryCard.vue'
import SearchPanel from '../components/SearchPanel.vue'
import BackupPanel from '../components/BackupPanel.vue'
import ThemeSwitcher from '../components/ThemeSwitcher.vue'
import DevPanel from '../components/DevPanel.vue'
import EmptyState from '../components/EmptyState.vue'
import HabitStreak from '../components/HabitStreak.vue'
import TabNavigation from '../components/TabNavigation.vue'
import MoodTrendChart from '../components/MoodTrendChart.vue'
import WordCountChart from '../components/WordCountChart.vue'
import EnergyStressChart from '../components/EnergyStressChart.vue'
import TodayHabitCompletion from '../components/TodayHabitCompletion.vue'
import TodaySummary from '../components/TodaySummary.vue'
import HabitTrendInsights from '../components/HabitTrendInsights.vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useSearch } from '@/composables/useSearch'
import { useToast } from '@/composables/useToast'
import { useHistoricalComparison } from '@/composables/useHistoricalComparison'
import { useDailyQuote } from '@/composables/useDailyQuote'
import { useModalFocus } from '@/composables/useFocusTrap'
import type { Task, DaySummary as DaySummaryEntry, Habit, HabitStatus, DaySummaryHabit } from '@/store/types'

const store = useStore()
const { addShortcut } = useKeyboardShortcuts()
const { filteredSummaries } = useSearch()
const toast = useToast()
const {
    quoteText,
    quoteAuthor,
    quoteSource,
    lastUpdated,
    isLoading: isQuoteLoading,
    error: quoteError,
    initializeQuote,
    refreshQuote
} = useDailyQuote()

// Historical comparison for "Last Year Today" feature
const today = ref(new Date())
const {
  hasHistoricalData,
  lastYearDateString,
  lastYearMood,
  lastYearTags,
  lastYearSummaryPreview,
  comparisonSummary,
  lastYearDate
} = useHistoricalComparison(today)

const quotePlaceholderCopy = 'Capture your thoughts to unlock more daily inspiration.'

const formatRelativeTimeFromNow = (date: Date) => {
    const diffMs = Date.now() - date.getTime()
    if (diffMs <= 0) return 'just now'

    const minutes = Math.round(diffMs / 60000)
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`

    const hours = Math.round(minutes / 60)
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`

    const days = Math.round(hours / 24)
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`

    const weeks = Math.round(days / 7)
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`
}

const quoteSourceLabel = computed(() => {
    switch (quoteSource.value) {
        case 'remote':
            return 'Fetched online'
        case 'local':
            return 'Local library'
        case 'cache':
            return 'Cached for today'
        case 'fallback':
            return 'Offline fallback'
        default:
            return 'Source pending'
    }
})

const quoteUpdatedLabel = computed(() => {
    if (!lastUpdated.value) return null
    return formatRelativeTimeFromNow(lastUpdated.value)
})

const quoteUpdatedTitle = computed(() => {
    if (!lastUpdated.value) return ''
    return lastUpdated.value.toLocaleString()
})

interface EmotionDetails {
    emoji: string
    color: string
}

const emotions: EmotionDetails[] = [
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
const tasks = computed<Task[]>(() => store.state.tasks as Task[])
const daySummaries = computed<DaySummaryEntry[]>(() => store.state.daySummaries as DaySummaryEntry[])
const habits = computed<Habit[]>(() => store.state.habits as Habit[])

// Reversed daySummaries for virtual scroller (avoids creating new array on each render)
const reversedDaySummaries = computed<DaySummaryEntry[]>(() => {
    return [...daySummaries.value].reverse()
})
const newTask = ref<{ description: string; priority: Task['priority']; dueDate: string }>({
    description: '',
    priority: 'Normal',
    dueDate: '',
})
const isMonthlySummaryOpen = ref(false)
const editingHabit = ref<Habit | null>(null)
const currentHabit = ref<{ name: string; description: string }>({ name: '', description: '' })
const selectedDate = ref('')
const isSearchPanelOpen = ref(false)
const isBackupPanelOpen = ref(false)
const activeTab = ref('dashboard')

const isOverlayActive = computed(() => [
    isTaskFormOpen.value,
    isDaySummaryFormOpen.value,
    isDetailedCalendarOpen.value,
    isHabitPopupOpen.value,
    isHabitModalOpen.value,
    isSearchPanelOpen.value,
    isBackupPanelOpen.value
].some(Boolean))

const previousOverflow = ref('')

watch(isOverlayActive, value => {
    if (typeof document === 'undefined') return

    if (value) {
        previousOverflow.value = document.body.style.overflow
        document.body.style.overflow = 'hidden'
    } else {
        document.body.style.overflow = previousOverflow.value
    }
})

onBeforeUnmount(() => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = previousOverflow.value
})

const { containerRef: taskFormRef } = useModalFocus({
    initialFocus: '#task-description',
    returnFocus: true,
    onEscape: () => {
        isTaskFormOpen.value = false
    }
})

const { containerRef: detailedCalendarRef } = useModalFocus({
    initialFocus: '#detailed-calendar-close',
    returnFocus: true,
    onEscape: () => {
        isDetailedCalendarOpen.value = false
    }
})

const { containerRef: habitPopupRef } = useModalFocus({
    initialFocus: '#habit-popup-close',
    returnFocus: true,
    onEscape: () => {
        isHabitPopupOpen.value = false
    }
})

const { containerRef: habitModalRef } = useModalFocus({
    initialFocus: '#habitName',
    returnFocus: true,
    onEscape: () => {
        isHabitModalOpen.value = false
    }
})

const toggleMonthlySummary = () => {
    isMonthlySummaryOpen.value = !isMonthlySummaryOpen.value
}

// Helper Functions
const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
}

const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// Updated calendarDays Computed Property
type CalendarDayItem =
    | { type: 'empty'; day: null; date: null; emotion: EmotionDetails; isLastYearAnniversary: false }
    | { type: 'day'; day: number; date: Date; emotion: EmotionDetails; isLastYearAnniversary: boolean }

const calendarDays = computed<CalendarDayItem[]>(() => {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)
    const days: CalendarDayItem[] = []

    // Get last year's date for highlighting
    const lastYearDay = lastYearDate.value.getDate()
    const lastYearMonth = lastYearDate.value.getMonth()

    // Fill empty slots for previous month days
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push({
            type: 'empty',
            day: null,
            date: null,
            emotion: { emoji: '', color: 'transparent' },
            isLastYearAnniversary: false
        })
    }

    // Populate days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        const dateString = formatDate(date)
        const daySummary = daySummaries.value.find(summary => summary.date === dateString)

        const emotion = daySummary && daySummary.mood
            ? mapMoodToEmotion(daySummary.mood)
            : { emoji: '', color: '#FFFFFF' } // Default blank

        // Check if this day is the anniversary of last year's date
        const isLastYearAnniversary = (day === lastYearDay && month === lastYearMonth)

        days.push({ type: 'day', day, date, emotion, isLastYearAnniversary })
    }

    return days
})

// Function to map Mood type to emotion details
const mapMoodToEmotion = (mood: string): EmotionDetails => {
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

// Utility function to strip HTML tags for safe display
const stripHtml = (html: string): string => {
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
}

// Format relative time (Today, Yesterday, 2 days ago, etc.)
const formatRelativeTime = (dateString: string): string => {
    const entryDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    entryDate.setHours(0, 0, 0, 0)

    const diffTime = today.getTime() - entryDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7)
        return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
    }
    if (diffDays < 365) {
        const months = Math.floor(diffDays / 30)
        return months === 1 ? '1 month ago' : `${months} months ago`
    }
    const years = Math.floor(diffDays / 365)
    return years === 1 ? '1 year ago' : `${years} years ago`
}

// Get word count from HTML content
const getWordCount = (html: string): number => {
    if (!html) return 0
    const text = stripHtml(html)
    return text.split(/\s+/).filter(word => word.length > 0).length
}

const completedHabitCount = (habits: DaySummaryHabit[] = []) => {
    return habits.filter(habit => habit?.completed).length
}

const currentDaySummary = computed<DaySummaryEntry | undefined>(() => {
    const dateString = currentDate.value.toISOString().split('T')[0]
    return daySummaries.value.find((summary: DaySummaryEntry) => summary.date === dateString)
})

const greetingMessage = computed(() => {
    const hour = today.value.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
})

const formattedToday = computed(() => {
    return today.value.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    })
})

const entriesThisMonthCount = computed(() => {
    return daySummaries.value.filter((summary: DaySummaryEntry) => {
        if (!summary?.date) return false
        const date = new Date(summary.date)
        return date.getFullYear() === currentYear.value && date.getMonth() === currentMonth.value
    }).length
})

type TaskWithMeta = Task & { dueDateObj: Date | null }

const tasksWithMeta = computed<TaskWithMeta[]>(() => {
    return tasks.value.map((task: Task) => {
        if (!task.dueDate) {
            return { ...task, dueDateObj: null }
        }

        const dueDateObj = new Date(task.dueDate)
        if (Number.isNaN(dueDateObj.getTime())) {
            return { ...task, dueDateObj: null }
        }

        dueDateObj.setHours(0, 0, 0, 0)
        return { ...task, dueDateObj }
    })
})

const sortedTasksByDueDate = computed<TaskWithMeta[]>(() => {
    return [...tasksWithMeta.value].sort((a, b) => {
        const aTime = a.dueDateObj ? a.dueDateObj.getTime() : Number.POSITIVE_INFINITY
        const bTime = b.dueDateObj ? b.dueDateObj.getTime() : Number.POSITIVE_INFINITY
        return aTime - bTime
    })
})

const overdueTasksCount = computed(() => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    return sortedTasksByDueDate.value.filter((task: TaskWithMeta) => task.dueDateObj && task.dueDateObj.getTime() < todayStart.getTime()).length
})

const upcomingTasks = computed<TaskWithMeta[]>(() => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const withinWeek = new Date(todayStart)
    withinWeek.setDate(withinWeek.getDate() + 7)

    return sortedTasksByDueDate.value
        .filter((task: TaskWithMeta) => task.dueDateObj && task.dueDateObj.getTime() >= todayStart.getTime() && task.dueDateObj.getTime() <= withinWeek.getTime())
        .slice(0, 3)
})

const tasksWithoutDueDateCount = computed(() => {
    return tasksWithMeta.value.filter((task: TaskWithMeta) => !task.dueDateObj).length
})

const latestSummary = computed<DaySummaryEntry | null>(() => {
    if (!daySummaries.value.length) return null
    return [...daySummaries.value]
        .sort((a: DaySummaryEntry, b: DaySummaryEntry) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
})

const latestEntryPreview = computed(() => {
    if (!latestSummary.value || !latestSummary.value.summary) return ''
    const text = stripHtml(latestSummary.value.summary)
    return text.length > 140 ? `${text.slice(0, 140)}…` : text
})

const currentMoodEmoji = computed(() => {
    if (!currentDaySummary.value || !currentDaySummary.value.mood) return '🙂'
    return mapMoodToEmotion(currentDaySummary.value.mood).emoji
})

const currentEnergyLevel = computed(() => {
    return currentDaySummary.value?.dailyCheck?.energyLevel ?? null
})

const highlightedHabit = computed<Habit | null>(() => {
    if (!habits.value || habits.value.length === 0) return null
    return [...habits.value]
        .sort((a: Habit, b: Habit) => (b.statuses?.length || 0) - (a.statuses?.length || 0))[0]
})

const highlightedHabitStreak = computed(() => {
    const habit = highlightedHabit.value
    if (!habit || !habit.statuses || habit.statuses.length === 0) return 0

    const sortedStatuses = [...habit.statuses].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    let streak = 0

    for (let i = 0; i < sortedStatuses.length; i++) {
        const statusDate = new Date(sortedStatuses[i].date)
        statusDate.setHours(0, 0, 0, 0)

        const diffDays = Math.floor((todayStart.getTime() - statusDate.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays !== i) break

        if (sortedStatuses[i].status === 'did') {
            streak++
        } else {
            break
        }
    }

    return streak
})

interface DashboardStat {
    label: string
    icon: string
    value: string
    description: string
}

const dashboardStats = computed<DashboardStat[]>(() => {
    return [
        {
            label: 'Entries this month',
            icon: '🗓️',
            value: entriesThisMonthCount.value.toString(),
            description: entriesThisMonthCount.value > 0 ? 'Great consistency!' : 'Start with a reflection today'
        },
        {
            label: 'Words written',
            icon: '✍️',
            value: totalWordsThisMonth.value.toLocaleString(),
            description: 'This month'
        },
        {
            label: 'Average energy',
            icon: '⚡',
            value: averageEnergyLevel.value ? `${averageEnergyLevel.value}/10` : '—',
            description: 'Based on daily check-ins'
        },
        {
            label: 'Tasks queued',
            icon: '🧾',
            value: tasks.value.length.toString(),
            description: overdueTasksCount.value > 0 ? `${overdueTasksCount.value} overdue` : 'You are on track'
        }
    ]
})

const handleAddSpark = () => {
    if (newSpark.value.trim()) {
        store.dispatch('addSpark', newSpark.value.trim())
        toast.success('Spark added!', 'Success')
        newSpark.value = ''
    }
}

const handleSaveTask = () => {
    store.dispatch('addTask', { ...newTask.value, id: Date.now() })
    toast.success('Task added successfully!', 'Task Created')
    newTask.value = { description: '', priority: 'Normal', dueDate: '' }
    isTaskFormOpen.value = false
}

const getPriorityIcon = (priority: string): string => {
    const icons: Record<string, string> = {
        'Lowest': '⬇️',
        'Low': '↘️',
        'Normal': '➡️',
        'Medium': '↗️',
        'High': '⬆️',
        'Highest': '🔥'
    }
    return icons[priority] || '➡️'
}

const openJournalForToday = () => {
    isDaySummaryFormOpen.value = true
    selectedDate.value = new Date().toISOString().split('T')[0]
}

const openTaskModal = () => {
    isTaskFormOpen.value = true
}

const openSearchModal = () => {
    isSearchPanelOpen.value = true
}

const formatTaskDueDate = (dateString?: string) => {
    if (!dateString) return 'No due date'
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return 'No due date'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const describeTaskDueDate = (dateString?: string) => {
    if (!dateString) return 'Anytime'
    const due = new Date(dateString)
    if (Number.isNaN(due.getTime())) return 'Anytime'

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    due.setHours(0, 0, 0, 0)

    const diffDays = Math.floor((due.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    if (diffDays < 0) return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} overdue`
    return `Due in ${diffDays} days`
}

// Handle day click event
const handleDayClick = (date?: Date) => {
    if (!date) return
    selectedDate.value = formatDate(date)
    isDaySummaryFormOpen.value = true
}

const closeDaySummary = () => {
    isDaySummaryFormOpen.value = false
}

const nextMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const prevMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const hasTasks = (date?: Date) => {
    if (!date) return false
    const dateString = formatDate(date)
    return tasks.value.some((task: Task) => task.dueDate === dateString)
}

const hasSummary = (date?: Date) => {
    if (!date) return false
    const dateString = formatDate(date)
    return daySummaries.value.some((summary: DaySummaryEntry) => summary.date === dateString)
}

const getDateXDaysAgo = (x: number) => {
    const date = new Date()
    date.setDate(date.getDate() - x)
    return date
}

const openAddHabitModal = () => {
    editingHabit.value = null
    currentHabit.value = { name: '', description: '' }
    isHabitModalOpen.value = true
}

const openEditHabitModal = (habit: Habit) => {
    editingHabit.value = habit
    currentHabit.value = { ...habit }
    isHabitModalOpen.value = true
}

const closeHabitModal = () => {
    isHabitModalOpen.value = false
}

const saveHabit = () => {
    if (editingHabit.value) {
        const updatedHabit: Habit = {
            ...editingHabit.value,
            name: currentHabit.value.name,
            description: currentHabit.value.description,
        }
        store.dispatch('updateHabit', updatedHabit)
    } else {
        const newHabit = { id: Date.now(), ...currentHabit.value, statuses: [] }
        store.dispatch('addHabit', newHabit)
    }
    closeHabitModal()
}

const getHabitStatusClass = (habit: Habit, date: Date) => {
    const dateString = formatDate(date)
    const statusEntry = habit.statuses?.find((s: HabitStatus) => s.date === dateString)
    const status = statusEntry?.status

    if (status === 'did') return 'bg-green-500'
    if (status === 'partial') return 'bg-yellow-500'
    if (status === 'not') return 'bg-red-500'
    return 'bg-gray-200'
}

const cycleHabitStatus = async (habit: Habit, date: Date) => {
    const dateString = formatDate(date)
    const statusEntry = habit.statuses?.find((s: HabitStatus) => s.date === dateString)
    const currentStatus = statusEntry?.status

    let newStatus: 'did' | 'partial' | 'not' | null = null

    if (!currentStatus) {
        newStatus = 'did'
    } else if (currentStatus === 'did') {
        newStatus = 'partial'
    } else if (currentStatus === 'partial') {
        newStatus = 'not'
    } else {
        newStatus = null // Reset to no status
    }

    try {
        await store.dispatch('updateHabitStatus', {
            habitId: habit.id,
            date: dateString,
            status: newStatus
        })
    } catch (error) {
        toast.error('Failed to update habit status', 'Error')
    }
}

const testClick = () => {
    // Calendar container click handler
}

const handleSelectEntry = (summary: DaySummaryEntry) => {
    selectedDate.value = summary.date
    isDaySummaryFormOpen.value = true
    isSearchPanelOpen.value = false
}

// Setup keyboard shortcuts
const setupKeyboardShortcuts = () => {
    addShortcut({
        key: 'n',
        ctrl: true,
        action: () => {
            isDaySummaryFormOpen.value = true
            selectedDate.value = new Date().toISOString().split('T')[0]
        },
        description: 'Create new diary entry'
    })

    addShortcut({
        key: 'f',
        ctrl: true,
        action: () => {
            isSearchPanelOpen.value = true
        },
        description: 'Open search panel'
    })

    addShortcut({
        key: 'b',
        ctrl: true,
        action: () => {
            isBackupPanelOpen.value = true
        },
        description: 'Open backup panel'
    })

    addShortcut({
        key: 'Escape',
        action: () => {
            isDaySummaryFormOpen.value = false
            isSearchPanelOpen.value = false
            isBackupPanelOpen.value = false
            isDetailedCalendarOpen.value = false
            isHabitPopupOpen.value = false
            isHabitModalOpen.value = false
            isTaskFormOpen.value = false
        },
        description: 'Close modals'
    })
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
    daySummaries.value.forEach((summary: DaySummaryEntry) => {
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
            const wordCount = summary.summary.split(/\s+/).filter(word => word.length > 0).length
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
            totalWords += summary.summary.split(/\s+/).filter(word => word.length > 0).length
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
            total += summary.summary.split(/\s+/).filter(word => word.length > 0).length
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
            return acc + summary.summary.split(/\s+/).filter(word => word.length > 0).length
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
    initializeQuote()
    store.dispatch('loadDaySummaries')
    store.dispatch('loadTasks')
    store.dispatch('loadHabits')
    store.dispatch('loadSparks')
    store.dispatch('loadCalendarEntries')
    setupKeyboardShortcuts()
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

/* Anniversary highlighting for last year's date */
.last-year-anniversary {
    border: 2px solid #7D5A36 !important;
    box-shadow: 0 0 12px rgba(125, 90, 54, 0.4);
    animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
    0%, 100% {
        box-shadow: 0 0 12px rgba(125, 90, 54, 0.4);
    }
    50% {
        box-shadow: 0 0 20px rgba(125, 90, 54, 0.6);
    }
}

.anniversary-badge {
    position: absolute;
    top: 2px;
    left: 2px;
    font-size: 12px;
    z-index: 10;
}

/* Journal Entry Styling */
.journal-entry {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.journal-entry:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(78, 59, 43, 0.15);
}

.journal-entry .line-clamp-4 {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    line-clamp: 4;
    overflow: hidden;
}

.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    line-clamp: 3;
    overflow: hidden;
}
</style>
