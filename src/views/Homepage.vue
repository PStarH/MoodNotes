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
                        <router-link
                            to="/"
                            class="text-[#4E3B2B] no-underline flex items-center p-3 rounded-lg hover-lift transition-all duration-200 hover:bg-[#FAF3E0]"
                            :class="{ 'bg-[#FAF3E0]': $route.path === '/' }"
                        >
                            <List class="mr-3" :size="20" />
                            <span class="font-medium">{{ $t('nav.home') }}</span>
                        </router-link>
                    </li>
                    <li class="mb-3">
                        <router-link
                            to="/analytics"
                            class="text-[#4E3B2B] no-underline flex items-center p-3 rounded-lg hover-lift transition-all duration-200 hover:bg-[#FAF3E0]"
                            :class="{ 'bg-[#FAF3E0]': $route.path === '/analytics' }"
                        >
                            <BarChart3 class="mr-3" :size="20" />
                            <span class="font-medium">{{ $t('nav.analytics') }}</span>
                        </router-link>
                    </li>
                    <li class="mb-3">
                        <a href="#" class="text-[#4E3B2B] no-underline flex items-center p-3 rounded-lg hover-lift transition-all duration-200 hover:bg-[#FAF3E0]"
                            @click="openCalendar">
                            <Calendar class="mr-3" :size="20" />
                            <span class="font-medium">{{ $t('nav.calendar') }}</span>
                        </a>
                    </li>
                    <li class="mb-3">
                        <a href="#" class="text-[#4E3B2B] no-underline flex items-center p-3 rounded-lg hover-lift transition-all duration-200 hover:bg-[#FAF3E0]"
                            @click="isHabitPopupOpen = true">
                            <BookOpen class="mr-3" :size="20" />
                            <span class="font-medium">{{ $t('nav.habits') }}</span>
                        </a>
                    </li>
                    <li class="mb-3">
                        <a href="#" class="text-[#4E3B2B] no-underline flex items-center p-3 rounded-lg hover-lift transition-all duration-200 hover:bg-[#FAF3E0]"
                            @click="isSearchPanelOpen = true">
                            <Search class="mr-3" :size="20" />
                            <span class="font-medium">{{ $t('nav.search') }}</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" class="text-[#4E3B2B] no-underline flex items-center p-3 rounded-lg hover-lift transition-all duration-200 hover:bg-[#FAF3E0]"
                            @click="isBackupPanelOpen = true">
                            <Download class="mr-3" :size="20" />
                            <span class="font-medium">{{ $t('nav.backup') }}</span>
                        </a>
                    </li>
                </ul>
            </nav>

            <!-- Settings Link -->
            <div class="mt-4 pt-4 border-t border-[#C5B891]">
                <router-link
                    to="/settings"
                    class="text-[#4E3B2B] no-underline flex items-center p-3 rounded-lg hover-lift transition-all duration-200 hover:bg-[#FAF3E0]"
                    :class="{ 'bg-[#FAF3E0]': $route.path === '/settings' }"
                >
                    <Settings class="mr-3" :size="20" />
                    <span class="font-medium">{{ $t('nav.settings') }}</span>
                </router-link>
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
                :tabs="tabLabels"
                :activeTab="activeTab"
                @change="(tab) => activeTab = tab"
            />

            <!-- Dashboard Tab -->
            <div
                v-show="activeTab === 'dashboard'"
                id="dashboard-panel"
                role="tabpanel"
                aria-labelledby="dashboard-tab"
                class="space-y-6"
            >
                <div class="grid gap-6 lg:grid-cols-3">
                    <div class="glass-effect p-6 rounded-2xl warm-shadow-lg flex flex-col justify-between lg:col-span-2">
                        <div class="flex flex-col gap-6">
                            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                                <div>
                                    <p class="text-xs font-semibold uppercase tracking-widest text-[#7D5A36]/70">{{ formattedToday }}</p>
                                    <h2 class="text-3xl sm:text-4xl font-bold text-[#4E3B2B] mt-2">{{ greetingMessage }}, {{ $t('home.friend') }} 👋</h2>
                                    <p class="text-[#7D5A36] mt-3 max-w-xl">{{ $t('home.snapshot') }}</p>
                                </div>
                                <div class="glass-effect px-4 py-3 rounded-xl min-w-[180px] text-[#4E3B2B] border border-[#D3C9A6]/50">
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm font-semibold text-[#7D5A36]/80 uppercase tracking-wide">{{ $t('home.currentMood') }}</span>
                                        <span class="text-3xl">{{ currentMoodEmoji }}</span>
                                    </div>
                                    <p class="text-sm mt-2">{{ currentDaySummary?.mood ? $t(`mood.${currentDaySummary.mood}.label`) : $t('home.noEntryYet') }}</p>
                                    <div class="mt-3 flex items-center justify-between text-sm">
                                        <span class="text-[#7D5A36]/80 uppercase tracking-wide font-semibold">{{ $t('home.energy') }}</span>
                                        <span class="font-semibold text-[#4E3B2B]">{{ currentEnergyLevel !== null ? `${currentEnergyLevel}/10` : '—' }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-wrap gap-3">
                                <button @click="openJournalForToday"
                                    class="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white font-semibold hover-lift transition-all duration-200 warm-shadow">
                                    <FileText :size="18" />
                                    {{ $t('home.newEntry') }}
                                </button>
                                <router-link to="/analytics"
                                    class="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#A67C52] to-[#8B6848] text-white font-semibold hover-lift transition-all duration-200 warm-shadow">
                                    <BarChart3 :size="18" />
                                    {{ $t('home.viewAnalytics') }}
                                </router-link>
                                <button @click="openTaskModal"
                                    class="flex items-center gap-2 px-5 py-3 rounded-xl glass-effect border border-[#D3C9A6]/60 text-[#4E3B2B] font-semibold hover-lift transition-all duration-200">
                                    <Plus :size="18" />
                                    {{ $t('home.addTask') }}
                                </button>
                                <button @click="openSearchModal"
                                    class="flex items-center gap-2 px-5 py-3 rounded-xl glass-effect border border-[#D3C9A6]/60 text-[#4E3B2B] font-semibold hover-lift transition-all duration-200">
                                    <Search :size="18" />
                                    {{ $t('home.searchEntries') }}
                                </button>
                            </div>
                            <div
                                class="daily-quote-card glass-effect px-4 py-4 rounded-2xl text-[#4E3B2B] border border-[#D3C9A6]/40"
                                style="height: 180px; display: flex; flex-direction: column;"
                                role="note"
                                aria-live="polite"
                            >
                                <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4" style="flex: 1; min-height: 0;">
                                    <div class="flex items-start gap-3 flex-1" style="min-height: 0;">
                                        <span class="text-3xl sm:text-4xl flex-shrink-0" aria-hidden="true">✨</span>
                                        <div class="space-y-2 flex-1 flex flex-col justify-center" style="min-height: 0; overflow: hidden;">
                                            <p v-if="isQuoteLoading" class="text-sm sm:text-base text-[#7D5A36]">{{ $t('quote.loadingInspiration') }}</p>
                                            <template v-else-if="quoteText">
                                                <p class="text-base sm:text-lg font-medium leading-relaxed line-clamp-3 overflow-hidden">"{{ quoteText }}"</p>
                                                <p v-if="quoteAuthor" class="text-sm text-[#7D5A36]/80 truncate">— {{ quoteAuthor }}</p>
                                            </template>
                                            <p v-else-if="quoteError" class="text-sm text-red-600 truncate">{{ quoteError }}</p>
                                            <p v-else class="text-sm sm:text-base text-[#7D5A36]">{{ $t('quote.capturePlaceholder') }}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        class="inline-flex items-center gap-2 self-start sm:self-center px-4 py-2 rounded-xl bg-[#7D5A36] text-white text-sm font-semibold hover:bg-[#6B4A2E] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D5A36] disabled:opacity-60 disabled:cursor-not-allowed"
                                        @click="() => refreshQuote(getMostRecentMood())"
                                        :disabled="isQuoteLoading"
                                        :aria-busy="isQuoteLoading"
                                        aria-label="Refresh daily quote"
                                    >
                                        <RefreshCcw :size="16" aria-hidden="true" />
                                        <span>{{ isQuoteLoading ? $t('quote.refreshing') : $t('quote.newQuote') }}</span>
                                    </button>
                                </div>
                                <div class="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#7D5A36]/80 flex-shrink-0" style="height: 24px; overflow: hidden;">
                                    <span class="inline-flex items-center gap-1">
                                        <span class="w-2 h-2 rounded-full bg-[#7D5A36]" aria-hidden="true"></span>
                                        <span>{{ quoteSourceLabel }}</span>
                                    </span>
                                    <span v-if="quoteUpdatedLabel" :title="quoteUpdatedTitle">{{ $t('quote.updated') }} {{ quoteUpdatedLabel }}</span>
                                    <span v-else>{{ $t('quote.waitingForFirst') }}</span>
                                    <span v-if="quoteError" class="text-red-600 truncate">{{ $t('quote.offlineMode') }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="glass-effect p-6 rounded-2xl warm-shadow fade-in border border-[#7D5A36]/20 flex flex-col justify-between">
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="text-lg font-bold text-[#4E3B2B] flex items-center">
                                <span class="mr-2">🕰️</span>{{ $t('home.lastYearToday') }}
                            </h3>
                            <button
                                @click="selectedDate = lastYearDateString; isDaySummaryFormOpen = true"
                                class="text-[#7D5A36] hover:text-opacity-80 text-sm font-medium hover:underline"
                            >
                                {{ $t('home.viewEntry') }}
                            </button>
                        </div>
                        <div v-if="hasHistoricalData" class="space-y-3">
                            <div class="flex items-center justify-between">
                                <span class="text-[#4E3B2B] text-sm font-medium">{{ lastYearDateString }}</span>
                                <span class="text-3xl">{{ mapMoodToEmotion(lastYearMood || 'neutral').emoji }}</span>
                            </div>
                            <p class="text-[#7D5A36] text-sm italic line-clamp-3">{{ lastYearSummaryPreview || $t('home.noContent') }}</p>
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
                            <p class="font-medium mb-2">{{ $t('home.noHistoricalData') }}</p>
                            <p>{{ $t('home.captureThoughts') }}</p>
                        </div>
                    </div>
                </div>

                <!-- Today's Summary -->
                <TodaySummary
                    @open-entry="openJournalForToday"
                    @open-habits="isHabitPopupOpen = true"
                    @view-insights="activeTab = 'journal'"
                />

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
                                    {{ $t('home.latestEntry') }}
                                </h3>
                                <p class="text-sm text-[#7D5A36]/80">{{ $t('home.latestEntryDesc') }}</p>
                            </div>
                            <button v-if="latestSummary"
                                @click="handleSelectEntry(latestSummary)"
                                class="text-sm font-semibold text-[#7D5A36] hover:underline">
                                {{ $t('home.openEntryBtn') }}
                            </button>
                        </div>
                        <div v-if="latestSummary" class="space-y-4">
                            <div class="flex items-center justify-between text-sm text-[#7D5A36]/80">
                                <span>{{ new Date(latestSummary.date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) }}</span>
                                <span class="flex items-center gap-2">
                                    <span class="text-xl">{{ mapMoodToEmotion(latestSummary.mood || 'neutral').emoji }}</span>
                                    {{ latestSummary.mood ? $t(`mood.${latestSummary.mood}.label`) : $t('home.noEntryYet') }}
                                </span>
                            </div>
                            <p class="text-[#4E3B2B] leading-relaxed">{{ latestEntryPreview || $t('home.noContent') }}</p>
                            <div class="flex flex-wrap items-center gap-3 text-xs text-[#7D5A36]/70">
                                <span class="px-3 py-1.5 rounded-full bg-[#7D5A36]/10 text-[#7D5A36] font-semibold">
                                    {{ getWordCount(latestSummary.summary) }} {{ $t('home.words') }}
                                </span>
                                <span v-if="latestSummary.dailyCheck" class="px-3 py-1.5 rounded-full bg-[#7D5A36]/10 text-[#7D5A36] font-semibold">
                                    {{ $t('home.energy') }} {{ latestSummary.dailyCheck.energyLevel }}/10
                                </span>
                                <span v-if="latestSummary.tags && latestSummary.tags.length" class="flex items-center gap-2">
                                    <span class="text-[#7D5A36]">{{ $t('home.tags') }}:</span>
                                    <span v-for="tag in latestSummary.tags.slice(0, 3)" :key="tag" class="px-2 py-1 bg-[#7D5A36]/10 text-[#7D5A36] rounded-full">
                                        #{{ tag }}
                                    </span>
                                </span>
                            </div>
                        </div>
                        <div v-else class="text-sm text-[#7D5A36]/80">
                            <p class="font-medium mb-2">{{ $t('home.noEntriesYet') }}</p>
                            <p>{{ $t('home.startTimelineHint') }}</p>
                        </div>
                    </div>

                    <div class="glass-effect p-6 rounded-2xl warm-shadow-lg flex flex-col gap-4">
                        <div class="flex items-start justify-between">
                            <div>
                                <h3 class="text-xl font-bold text-[#4E3B2B] flex items-center gap-2">
                                    <span>🧾</span>
                                    {{ $t('home.upcomingTasks') }}
                                </h3>
                                <p class="text-sm text-[#7D5A36]/80">{{ $t('home.upcomingTasksDesc') }}</p>
                            </div>
                            <span class="text-xs font-semibold px-3 py-1 rounded-full"
                                :class="overdueTasksCount > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
                                {{ overdueTasksCount > 0 ? `${overdueTasksCount} ${$t('home.overdue')}` : $t('home.allClear') }}
                            </span>
                        </div>

                        <!-- 固定高度可滚动的任务列表 -->
                        <div v-if="upcomingTasks.length" class="tasks-scroll-container custom-scrollbar">
                            <ul class="space-y-3">
                                <li v-for="task in upcomingTasks" :key="task.id"
                                    class="border border-[#D3C9A6]/40 rounded-xl px-4 py-3 flex items-start justify-between gap-3">
                                    <div>
                                        <p class="font-semibold text-[#4E3B2B]">{{ task.description }}</p>
                                        <p class="text-xs text-[#7D5A36]/70 mt-1">{{ describeTaskDueDate(task.dueDate) }}</p>
                                    </div>
                                    <span class="text-xs px-2 py-1 rounded-full bg-[#7D5A36]/10 text-[#7D5A36] font-semibold">{{ task.priority }}</span>
                                </li>
                            </ul>
                        </div>
                        <div v-else class="text-sm text-[#7D5A36]/80">
                            <p class="font-medium mb-2">{{ $t('home.noTasksDue') }}</p>
                            <p>{{ $t('home.addTaskHint') }}</p>
                        </div>

                        <div v-if="tasksWithoutDueDateCount > 0" class="text-xs text-[#7D5A36]/70">
                            + {{ tasksWithoutDueDateCount }} {{ $t('home.tasksWithoutDue') }}
                        </div>

                        <button @click="openTaskModal"
                            class="self-start mt-auto px-5 py-3 rounded-xl bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white font-semibold hover-lift transition-all duration-200 warm-shadow">
                            {{ $t('home.addTask') }}
                        </button>
                    </div>
                </div>

                <div class="grid gap-6 lg:grid-cols-2">
                    <div class="glass-effect p-6 rounded-2xl warm-shadow flex flex-col gap-4">
                        <div class="flex items-start justify-between">
                            <h3 class="text-xl font-bold text-[#4E3B2B] flex items-center gap-2">
                                <span>🔥</span>
                                {{ $t('home.habitHighlight') }}
                            </h3>
                            <button @click="isHabitPopupOpen = true" class="text-xs font-semibold text-[#7D5A36] hover:underline">
                                {{ $t('home.manage') }}
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
                            <p class="text-sm text-[#7D5A36]/80">{{ $t('home.habitStreak') }}: <strong class="text-[#4E3B2B]">{{ highlightedHabitStreak }}</strong> {{ highlightedHabitStreak === 1 ? $t('home.day') : $t('home.days') }}</p>
                        </div>
                        <div v-else class="text-sm text-[#7D5A36]/80">
                            <p class="font-medium mb-2">{{ $t('home.noHabits') }}</p>
                            <p>{{ $t('home.addHabitHint') }}</p>
                        </div>
                    </div>

                    <div class="glass-effect p-6 rounded-2xl warm-shadow flex flex-col gap-4">
                        <div class="flex items-start justify-between">
                            <h3 class="text-xl font-bold text-[#4E3B2B] flex items-center gap-2">
                                <span>⚡</span>
                                {{ $t('home.recentSparks') }}
                            </h3>
                            <span class="text-xs text-[#7D5A36]/70">{{ recentSparks.length }} {{ $t('home.logged') }}</span>
                        </div>
                        <div v-if="recentSparks.length" class="space-y-3">
                            <div class="border border-[#D3C9A6]/40 rounded-xl px-4 py-3"
                                v-for="(spark, index) in recentSparks.slice(0, 3)" :key="index">
                                <p class="text-sm text-[#4E3B2B]">{{ spark }}</p>
                            </div>
                            <p v-if="recentSparks.length > 3" class="text-xs text-[#7D5A36]/70">+ {{ recentSparks.length - 3 }} {{ $t('home.moreSparks') }}</p>
                        </div>
                        <div v-else class="text-sm text-[#7D5A36]/80">
                            <p class="font-medium mb-2">{{ $t('home.captureSpark') }}</p>
                            <p>{{ $t('home.sparkHint') }}</p>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Journal Tab -->
            <div
                v-show="activeTab === 'journal'"
                id="journal-panel"
                role="tabpanel"
                aria-labelledby="journal-tab"
            >
                <div class="mb-6 fade-in">
                    <!-- Enhanced Header with Gradient Background -->
                    <div class="glass-effect rounded-2xl p-6 warm-shadow-lg mb-6 border border-[#D3C9A6]/30">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div class="flex-1">
                                <div class="flex items-center gap-3 mb-2">
                                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7D5A36] to-[#6B4A2E] flex items-center justify-center text-3xl shadow-lg">
                                        📖
                                    </div>
                                    <div>
                                        <h3 class="text-2xl font-bold text-[#4E3B2B]">{{ $t('home.journal') }}</h3>
                                        <p class="text-[#7D5A36] text-sm flex items-center gap-2">
                                            <span class="w-2 h-2 rounded-full bg-[#7D5A36] animate-pulse"></span>
                                            {{ daySummaries.length }} {{ $t('home.entriesCaptured') }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button
                                @click="isDaySummaryFormOpen = true; selectedDate = new Date().toISOString().split('T')[0]"
                                class="bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white px-6 py-3.5 rounded-xl hover-lift transition-all duration-200 flex items-center warm-shadow font-semibold gap-2 group"
                            >
                                <FileText class="group-hover:scale-110 transition-transform" :size="20" />
                                {{ $t('home.newEntry') }}
                            </button>
                        </div>
                    </div>

                    <!-- Today's Habit Completion Module -->
                    <div class="mb-6">
                        <TodayHabitCompletion @manage-habits="isHabitPopupOpen = true" />
                    </div>

                    <EmptyState
                        v-if="daySummaries.length === 0"
                        icon="📔"
                        :title="$t('home.startJourney')"
                        :description="$t('home.startJourneyDesc')"
                        :actionText="$t('home.writeFirstEntry')"
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
                                    :aria-label="`Journal entry from ${new Date(summary.date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}, mood: ${summary.mood || 'neutral'}`"
                                    class="journal-entry glass-effect rounded-2xl cursor-pointer hover-lift transition-all duration-300 warm-shadow overflow-hidden group border border-[#D3C9A6]/20 hover:border-[#7D5A36]/40"
                                >
                                    <!-- Entry Header with Enhanced Design -->
                                    <div class="bg-gradient-to-r from-[#7D5A36]/5 via-[#D3C9A6]/5 to-[#6B4A2E]/5 p-5 border-b border-[#D3C9A6]/30">
                                        <div class="flex justify-between items-start">
                                            <div class="flex-1">
                                                <div class="flex items-center gap-3 mb-2">
                                                    <div class="relative">
                                                        <div class="absolute inset-0 bg-gradient-to-br from-[#7D5A36]/20 to-transparent rounded-full blur-xl"></div>
                                                        <span class="text-5xl relative group-hover:scale-110 transition-transform duration-300" aria-hidden="true">{{ summary.mood ? mapMoodToEmotion(summary.mood).emoji : '😐' }}</span>
                                                    </div>
                                                    <div>
                                                        <h4 class="text-lg font-bold text-[#4E3B2B] group-hover:text-[#7D5A36] transition-colors">
                                                            {{ new Date(summary.date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) }}
                                                        </h4>
                                                        <p class="text-xs text-[#7D5A36]/70 flex items-center gap-1.5">
                                                            <span class="w-1.5 h-1.5 rounded-full bg-[#7D5A36] opacity-60"></span>
                                                            {{ formatRelativeTime(summary.date) }}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Entry Indicators with Better Styling -->
                                            <div class="flex gap-2">
                                                <span v-if="summary.media && summary.media.length > 0"
                                                    class="px-3 py-1.5 bg-gradient-to-r from-[#7D5A36]/10 to-[#6B4A2E]/10 rounded-xl text-xs text-[#7D5A36] font-semibold flex items-center gap-1.5 shadow-sm"
                                                    :title="`${summary.media.length} media file(s)`">
                                                    <Camera :size="14" aria-hidden="true" />
                                                    {{ summary.media.length }}
                                                </span>
                                                <span v-if="summary.habits && summary.habits.length > 0"
                                                    class="px-3 py-1.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl text-xs text-green-700 font-semibold flex items-center gap-1.5 shadow-sm"
                                                    :title="`${completedHabitCount(summary.habits)}/${summary.habits.length} habits completed`">
                                                    ✓ {{ completedHabitCount(summary.habits) }}/{{ summary.habits.length }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Entry Content with Better Typography -->
                                    <div class="p-6">
                                        <div class="relative mb-4">
                                            <div class="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-[#7D5A36] to-transparent rounded-full"></div>
                                            <p class="text-[#4E3B2B] text-base leading-relaxed line-clamp-4 pl-4">
                                                {{ stripHtml(summary.summary || '') || 'No content written yet...' }}
                                            </p>
                                        </div>

                                        <!-- Tags and Metadata with Enhanced Design -->
                                        <div class="flex flex-wrap items-center gap-3">
                                            <div v-if="summary.tags && summary.tags.length > 0" class="flex flex-wrap gap-2 flex-1">
                                                <span
                                                    v-for="tag in summary.tags.slice(0, 5)"
                                                    :key="tag"
                                                    class="text-xs px-3 py-1.5 bg-gradient-to-r from-[#7D5A36]/10 to-[#6B4A2E]/10 text-[#7D5A36] rounded-full font-semibold hover:from-[#7D5A36]/20 hover:to-[#6B4A2E]/20 transition-all shadow-sm hover:shadow"
                                                >
                                                    #{{ tag }}
                                                </span>
                                                <span v-if="summary.tags.length > 5" class="text-xs px-3 py-1.5 text-[#7D5A36]/60 font-medium">
                                                    +{{ summary.tags.length - 5 }}
                                                </span>
                                            </div>

                                            <!-- Word Count with Icon -->
                                            <div class="flex items-center gap-1.5 text-xs text-[#7D5A36]/60 font-semibold">
                                                <span>✍️</span>
                                                {{ getWordCount(summary.summary) }} {{ $t('home.words') }}
                                            </div>
                                        </div>

                                        <!-- Daily Check Preview with Better Design -->
                                        <div v-if="summary.dailyCheck" class="mt-4 pt-4 border-t border-[#D3C9A6]/30">
                                            <div class="grid grid-cols-3 gap-3">
                                                <div class="glass-effect rounded-lg p-2.5 flex flex-col items-center gap-1 hover-lift transition-all">
                                                    <span class="text-lg" aria-hidden="true">⚡</span>
                                                    <span class="text-xs text-[#7D5A36]/70 font-medium">{{ $t('home.energy') }}</span>
                                                    <span class="text-sm font-bold text-[#4E3B2B]">{{ summary.dailyCheck.energyLevel }}/10</span>
                                                </div>
                                                <div class="glass-effect rounded-lg p-2.5 flex flex-col items-center gap-1 hover-lift transition-all">
                                                    <span class="text-lg" aria-hidden="true">😅</span>
                                                    <span class="text-xs text-[#7D5A36]/70 font-medium">{{ $t('home.stress') }}</span>
                                                    <span class="text-sm font-bold text-[#4E3B2B]">{{ summary.dailyCheck.stressLevel }}/10</span>
                                                </div>
                                                <div class="glass-effect rounded-lg p-2.5 flex flex-col items-center gap-1 hover-lift transition-all">
                                                    <span class="text-lg" aria-hidden="true">🎨</span>
                                                    <span class="text-xs text-[#7D5A36]/70 font-medium">{{ $t('home.productivity') }}</span>
                                                    <span class="text-sm font-bold text-[#4E3B2B]">{{ summary.dailyCheck.productivity }}/10</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Enhanced Hover Action Hint -->
                                    <div class="bg-gradient-to-r from-[#7D5A36]/5 via-[#D3C9A6]/5 to-[#6B4A2E]/5 px-5 py-3 opacity-0 group-hover:opacity-100 transition-all duration-200 border-t border-[#D3C9A6]/20">
                                        <p class="text-xs text-[#7D5A36] text-center font-semibold flex items-center justify-center gap-2">
                                            <span>👆</span>
                                            {{ $t('home.clickToEdit') }}
                                        </p>
                                    </div>
                                </div>
                            </DynamicScrollerItem>
                        </template>
                    </DynamicScroller>
                </div>
            </div>

            <!-- Tasks Tab -->
            <div
                v-show="activeTab === 'tasks'"
                id="tasks-panel"
                role="tabpanel"
                aria-labelledby="tasks-tab"
            >
                <div class="bounce-in">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h3 class="text-2xl font-bold text-[#4E3B2B] mb-1 flex items-center">
                                <span class="mr-2">✅</span>{{ $t('home.tasks') }}
                            </h3>
                        </div>
                        <button @click="isTaskFormOpen = true"
                            class="flex items-center glass-effect p-4 rounded-xl border border-themed cursor-pointer hover-lift transition-all duration-200 warm-shadow font-semibold"
                            style="color: var(--color-text);">
                            <Plus :size="20" class="mr-2" />
                            <span>{{ $t('home.addNewTask') }}</span>
                        </button>
                    </div>

                    <EmptyState
                        v-if="tasks.length === 0"
                        icon="📋"
                        :title="$t('home.noTasksYet')"
                        :description="$t('home.noTasksDesc')"
                        :actionText="$t('home.addTask')"
                        :actionIcon="Plus"
                        @action="isTaskFormOpen = true"
                    />

                    <!-- Tasks Grid -->
                    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div v-for="(task, index) in tasks" :key="index"
                            class="group relative glass-effect rounded-xl hover-lift transition-all duration-300 overflow-hidden warm-shadow border border-themed">

                            <!-- 卡片内容 -->
                            <div class="relative p-4">
                                <!-- 顶部：优先级和操作按钮 -->
                                <div class="flex justify-between items-start mb-3">
                                    <span class="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-bold"
                                        :class="getPriorityBadgeStyle(task.priority)">
                                        <span class="text-base">{{ getPriorityIcon(task.priority) }}</span>
                                        <span>{{ $t(`priority.${task.priority.toLowerCase()}`) || task.priority }}</span>
                                    </span>

                                    <!-- 操作按钮 -->
                                    <div class="flex items-center gap-1.5">
                                        <button
                                            @click="editTask(task)"
                                            class="p-1.5 rounded-lg transition-all duration-200 opacity-70 hover:opacity-100"
                                            style="background: rgba(125, 90, 54, 0.1);"
                                            :aria-label="$t('home.editTask')"
                                            :title="$t('home.editTask')">
                                            <Edit2 :size="16" class="text-[#7D5A36]" />
                                        </button>
                                        <button
                                            @click="confirmDeleteTask(index)"
                                            class="p-1.5 rounded-lg transition-all duration-200 opacity-70 hover:opacity-100"
                                            style="background: rgba(220, 38, 38, 0.1);"
                                            :aria-label="$t('home.deleteTask')"
                                            :title="$t('home.deleteTask')">
                                            <Trash2 :size="16" class="text-red-600 dark:text-red-400" />
                                        </button>
                                    </div>
                                </div>

                                <!-- 任务描述 -->
                                <div class="mb-3">
                                    <p class="text-themed font-semibold text-base leading-snug line-clamp-2">
                                        {{ task.description }}
                                    </p>
                                </div>

                                <!-- 截止日期 -->
                                <div class="flex items-center gap-2 text-sm">
                                    <Calendar :size="14" class="text-themed-secondary opacity-70" />
                                    <span v-if="task.dueDate"
                                        class="font-medium"
                                        :class="getTaskDateClass(task.dueDate)">
                                        {{ formatTaskDueDate(task.dueDate) }}
                                    </span>
                                    <span v-else class="font-medium text-themed-secondary opacity-60">
                                        {{ $t('task.noDueDate') }}
                                    </span>
                                    <span v-if="task.dueDate" class="text-xs text-themed-secondary opacity-50 ml-auto">
                                        {{ getTaskDueDateLabel(task.dueDate) }}
                                    </span>
                                </div>
                            </div>

                            <!-- 左侧优先级颜色条 -->
                            <div class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                                :style="{ background: getPriorityColor(task.priority) }">
                            </div>
                        </div>
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
                    <h2 id="task-form-title" class="text-2xl font-bold text-[#4E3B2B] flex items-center">
                        <span class="mr-2">✒️</span>{{ editingTaskIndex !== null ? $t('home.editTask') : $t('home.createTask') }}
                    </h2>
                    <button type="button" @click="isTaskFormOpen = false" class="text-[#7D5A36] hover:text-opacity-80 p-2 hover:bg-[#7D5A36] hover:bg-opacity-10 rounded-lg transition-all" aria-label="Close task form">
                        <X :size="24" />
                    </button>
                </div>

                <form @submit.prevent="handleSaveTask" class="space-y-6">
                    <div class="space-y-2">
                        <label class="block text-sm font-semibold text-[#4E3B2B]" for="task-description">{{ $t('home.description') }}</label>
                        <textarea id="task-description" v-model="newTask.description"
                            class="w-full px-4 py-3 glass-effect text-[#4E3B2B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7D5A36] transition-all"
                            rows="3" placeholder="Take out the trash"></textarea>
                    </div>

                    <div class="space-y-2">
                        <label class="block text-sm font-semibold text-[#4E3B2B] mb-3">{{ $t('home.priority') }}</label>
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
                        <label class="block text-sm font-semibold text-themed" for="task-due-date">
                            <span class="flex items-center gap-2">
                                <span>📅</span>
                                {{ $t('home.dueDate') }}
                            </span>
                        </label>
                        <CustomDatePicker
                            v-model="newTask.dueDate"
                            :placeholder="$t('home.dueDate')"
                        />
                    </div>

                    <div class="flex justify-end">
                        <button type="submit"
                            class="px-6 py-3 bg-themed-primary text-white rounded-xl hover-lift transition-all duration-200 font-semibold warm-shadow">
                            {{ $t('home.saveTask') }}
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
                    <h2 id="detailed-calendar-title" class="text-xl font-bold text-[#4E3B2B]">{{ $t('calendar.title') }}</h2>
                    <button id="detailed-calendar-close" type="button" @click="isDetailedCalendarOpen = false" class="text-[#7D5A36] hover:text-opacity-80" :aria-label="$t('calendar.close')">
                        <X :size="24" />
                    </button>
                </div>

                <div class="mb-4">
                    <div class="flex justify-between items-center mb-2.5">
                        <button @click="prevMonth" class="bg-transparent border-0 cursor-pointer">
                            <ChevronLeft :color="iconColor" :size="24" />
                        </button>
                        <span class="font-bold text-themed">
                            {{ currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }) }}
                        </span>
                        <button @click="nextMonth" class="bg-transparent border-0 cursor-pointer">
                            <ChevronRight :color="iconColor" :size="24" />
                        </button>
                    </div>
                    <div class="grid grid-cols-7 gap-2.5 glass-effect p-4 rounded-lg">
                        <div v-for="day in weekDays" :key="day"
                            class="text-center font-bold text-themed-secondary">
                            {{ day }}
                        </div>
                        <template v-for="(day, index) in calendarDays" :key="index">
                            <div v-if="day.type === 'day'" class="calendar-day"
                                @click="handleDayClick(day.date)">
                                <div class="emotion-icon">{{ day.emotion.emoji }}</div>
                                <span>{{ day.day }}</span>
                                <div v-if="hasTasks(day.date)" class="task-indicator"></div>
                            </div>
                            <div v-else class="calendar-day empty"></div>

                        </template>
                    </div>
                </div>

                <div>
                    <div class="flex gap-5">
                        <div class="flex items-center">
                            <div class="w-3 h-3 rounded-full mr-1.5" style="background: var(--color-primary);"></div>
                            <span class="text-themed">{{ $t('calendar.tasks') }}</span>
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
                    <h2 id="habit-popup-title" class="text-xl font-bold text-[#4E3B2B]">{{ $t('nav.habits') }}</h2>
                    <button id="habit-popup-close" type="button" @click="isHabitPopupOpen = false" class="text-[#7D5A36] hover:text-opacity-80" aria-label="Close habits popup">
                        <X :size="24" />
                    </button>
                </div>

                <div class="mb-6">
                    <h3 class="text-lg font-semibold text-[#4E3B2B] mb-4">{{ $t('habit.myHabits') }}</h3>
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
                        class="mt-4 glass-effect border border-themed px-4 py-2 rounded-md hover-lift transition-all flex items-center font-semibold"
                        style="color: var(--color-text);">
                        <Plus :size="20" class="mr-2" />
                        {{ $t('habit.addHabit') }}
                    </button>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-[#4E3B2B] mb-4">{{ $t('habit.habitTracking') }}</h3>
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
    <div v-if="isSearchPanelOpen" class="fixed inset-0 modal-backdrop flex items-start justify-center z-50 overflow-y-auto py-8" role="presentation">
            <div class="w-full mx-4" style="max-width: min(1200px, 95vw);">
                <SearchPanel @close="isSearchPanelOpen = false" @select-entry="handleSelectEntry" />
            </div>
        </div>

        <!-- Backup Panel -->
    <div v-if="isBackupPanelOpen" class="fixed inset-0 modal-backdrop flex items-start justify-center z-50 overflow-y-auto py-8" role="presentation">
            <div class="w-full mx-4" style="max-width: min(900px, 95vw);">
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
                <h2 id="habit-modal-title" class="text-2xl font-bold text-[#4E3B2B] mb-4">{{ editingHabit ? $t('habit.editHabit') : $t('habit.addHabit') }}</h2>
                <form @submit.prevent="saveHabit">
                    <div class="mb-4">
                        <label for="habitName" class="block text-[#4E3B2B] mb-2">{{ $t('habit.habitName') }}</label>
                        <input id="habitName" v-model="currentHabit.name" type="text"
                            class="w-full p-2 border border-[#D3C9A6] rounded-md bg-[#F0E9D2] text-[#4E3B2B]" required>
                    </div>
                    <div class="mb-4">
                        <label for="habitDescription" class="block text-[#4E3B2B] mb-2">{{ $t('habit.habitDescription') }}</label>
                        <textarea id="habitDescription" v-model="currentHabit.description"
                            class="w-full p-2 border border-[#D3C9A6] rounded-md bg-[#F0E9D2] text-[#4E3B2B]"
                            rows="3"></textarea>
                    </div>
                    <div class="flex justify-end space-x-2">
                        <button type="button" @click="closeHabitModal"
                            class="px-4 py-2 bg-[#D3C9A6] text-[#4E3B2B] rounded-md hover:bg-opacity-90 transition-colors">
                            {{ $t('common.cancel') }}
                        </button>
                        <button type="submit"
                            class="px-4 py-2 bg-[#7D5A36] text-white rounded-md hover:bg-opacity-90 transition-colors">
                            {{ $t('common.save') }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Delete Task Confirmation Dialog -->
        <ConfirmDialog
            v-model:isOpen="isDeleteConfirmOpen"
            type="danger"
            icon="🗑️"
            :title="locale === 'zh' ? '确认删除' : 'Confirm Delete'"
            :message="locale === 'zh' ? '确定要删除这个任务吗？此操作无法撤销。' : 'Are you sure you want to delete this task? This action cannot be undone.'"
            :confirmText="locale === 'zh' ? '删除' : 'Delete'"
            :cancelText="locale === 'zh' ? '取消' : 'Cancel'"
            @confirm="handleDeleteConfirm"
            @cancel="handleDeleteCancel"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Calendar, Clock, BookOpen, List, Plus, Camera, Video, ChevronLeft, ChevronRight, ChevronDownIcon, X, CheckCircle2, XCircle, FileText, Edit2, Search, Download, Upload, RefreshCcw, BarChart3, Settings, Trash2 } from 'lucide-vue-next'
import DOMPurify from 'dompurify'
import { formatDate, formatRelativeTime, formatDateLong } from '@/utils/dateFormatters'
import DaySummary from './DaySummary.vue'
import SummaryCard from '../components/SummaryCard.vue'
import SearchPanel from '../components/SearchPanel.vue'
import BackupPanel from '../components/BackupPanel.vue'
import EmptyState from '../components/EmptyState.vue'
import HabitStreak from '../components/HabitStreak.vue'
import TabNavigation from '../components/TabNavigation.vue'
import TodayHabitCompletion from '../components/TodayHabitCompletion.vue'
import TodaySummary from '../components/TodaySummary.vue'
import CustomDatePicker from '../components/CustomDatePicker.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useSearch } from '@/composables/useSearch'
import { useToast } from '@/composables/useToast'
import { useHistoricalComparison } from '@/composables/useHistoricalComparison'
import { useDailyQuote } from '@/composables/useDailyQuote'
import { useModalFocus } from '@/composables/useFocusTrap'
import type { Task, DaySummary as DaySummaryEntry, Habit, HabitStatus, DaySummaryHabit } from '@/store/types'

const store = useStore()
const route = useRoute()
const { t, locale } = useI18n()
const { addShortcut } = useKeyboardShortcuts()
const { filteredSummaries } = useSearch()
const toast = useToast()

// Get the user's most recent mood from their latest entry
const getMostRecentMood = (): 'happy' | 'neutral' | 'sad' | 'excited' | 'angry' | undefined => {
    const summaries = store.state.daySummaries as DaySummaryEntry[]
    if (summaries.length === 0) return undefined
    
    // Sort by date descending and get the most recent entry
    const sortedSummaries = [...summaries].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    const recentMood = sortedSummaries[0]?.mood
    const validMoods = ['happy', 'neutral', 'sad', 'excited', 'angry']
    return validMoods.includes(recentMood) ? recentMood as any : undefined
}

const {
    quoteText,
    quoteAuthor,
    quoteSource,
    lastUpdated,
    isLoading: isQuoteLoading,
    error: quoteError,
    initializeQuote,
    refreshQuote,
    updateLanguage
} = useDailyQuote({ mood: getMostRecentMood(), language: locale.value as 'en' | 'zh' })

// Historical comparison for "Last Year Today" feature
const today = ref(new Date())
const {
  hasHistoricalData,
  lastYearDateString,
  lastYearMood,
  lastYearTags,
    lastYearSummaryPreview,
  lastYearDate
} = useHistoricalComparison(today)

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
            return t('quote.fetchedOnline')
        case 'local':
            return t('quote.localLibrary')
        case 'cache':
            return t('quote.cachedForToday')
        case 'fallback':
            return t('quote.offlineFallback')
        default:
            return t('quote.sourcePending')
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

// Dynamic icon color based on theme
const iconColor = computed(() => {
    return getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim() || '#4E3B2B'
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
const isDeleteConfirmOpen = ref(false)
const taskToDelete = ref<number | null>(null)
const editingTaskIndex = ref<number | null>(null)

const isOverlayActive = computed(() => [
    isTaskFormOpen.value,
    isDaySummaryFormOpen.value,
    isDetailedCalendarOpen.value,
    isHabitPopupOpen.value,
    isHabitModalOpen.value,
    isSearchPanelOpen.value,
    isBackupPanelOpen.value,
    isDeleteConfirmOpen.value
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
        // Use indexed getter for O(1) lookup instead of .find() O(n)
        const daySummary = store.getters.getDaySummary(dateString)

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
    // Sanitize HTML first to prevent XSS attacks
    const sanitized = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] })
    const tmp = document.createElement('DIV')
    tmp.textContent = sanitized
    return tmp.textContent || tmp.innerText || ''
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
    // Use indexed getter for O(1) lookup instead of .find() O(n)
    return store.getters.getDaySummary(dateString)
})

const greetingMessage = computed(() => {
    const hour = today.value.getHours()
    if (hour < 12) return t('home.greeting.morning')
    if (hour < 18) return t('home.greeting.afternoon')
    return t('home.greeting.evening')
})

const weekDays = computed(() => [
    t('calendar.weekDays.sun'),
    t('calendar.weekDays.mon'),
    t('calendar.weekDays.tue'),
    t('calendar.weekDays.wed'),
    t('calendar.weekDays.thu'),
    t('calendar.weekDays.fri'),
    t('calendar.weekDays.sat')
])

const tabLabels = computed(() => [
    { id: 'dashboard', label: t('home.dashboard'), icon: List },
    { id: 'journal', label: t('home.journal'), icon: BookOpen, badge: daySummaries.value.length },
    { id: 'tasks', label: t('home.tasks'), icon: CheckCircle2, badge: tasks.value.length },
])

const formattedToday = computed(() => {
    return today.value.toLocaleDateString(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
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
            label: t('home.entriesThisMonth'),
            icon: '🗓️',
            value: entriesThisMonthCount.value.toString(),
            description: entriesThisMonthCount.value > 0 ? t('home.greatConsistency') : t('home.startReflection')
        },
        {
            label: t('home.wordsWritten'),
            icon: '✍️',
            value: totalWordsThisMonth.value.toLocaleString(),
            description: t('home.thisMonth')
        },
        {
            label: t('home.averageEnergy'),
            icon: '⚡',
            value: averageEnergyLevel.value ? `${averageEnergyLevel.value}/10` : '—',
            description: t('home.basedOnCheckins')
        },
        {
            label: t('home.tasksQueued'),
            icon: '🧾',
            value: tasks.value.length.toString(),
            description: overdueTasksCount.value > 0 ? `${overdueTasksCount.value} ${t('home.overdue')}` : t('home.youAreOnTrack')
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
    if (editingTaskIndex.value !== null) {
        // Edit existing task
        const taskId = tasks.value[editingTaskIndex.value].id
        store.dispatch('updateTask', { id: taskId, ...newTask.value })
        toast.success(t('toast.updated'), t('toast.success'))
        editingTaskIndex.value = null
    } else {
        // Create new task
        store.dispatch('addTask', { ...newTask.value, id: Date.now() })
        toast.success('Task added successfully!', 'Task Created')
    }
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

// 获取优先级徽章样式（使用应用的暖色调）
const getPriorityBadgeStyle = (priority: string): string => {
    const styles: Record<string, string> = {
        'Lowest': 'bg-[#4E3B2B]/5 dark:bg-[#F5EFE7]/5 text-[#7D5A36] dark:text-[#C9B99A]',
        'Low': 'bg-[#7D5A36]/10 dark:bg-[#D4A574]/10 text-[#7D5A36] dark:text-[#D4A574]',
        'Normal': 'bg-[#7D5A36]/15 dark:bg-[#D4A574]/15 text-[#6B4A2E] dark:text-[#D4A574]',
        'Medium': 'bg-[#B8956A]/20 dark:bg-[#B8956A]/20 text-[#7D5A36] dark:text-[#D4A574]',
        'High': 'bg-[#D4A574]/25 dark:bg-[#D4A574]/25 text-[#6B4A2E] dark:text-[#F5EFE7]',
        'Highest': 'bg-gradient-to-r from-[#D4A574] to-[#B8956A] text-white'
    }
    return styles[priority] || styles['Normal']
}

// 获取优先级颜色（用于左侧颜色条）
const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
        'Lowest': '#8B7355',
        'Low': '#A67C52',
        'Normal': '#7D5A36',
        'Medium': '#D4A574',
        'High': '#B8956A',
        'Highest': 'linear-gradient(180deg, #D4A574 0%, #B8956A 100%)'
    }
    return colors[priority] || colors['Normal']
}

const getTaskDateClass = (dateString?: string): string => {
    if (!dateString) return 'text-themed-secondary'

    const dueDate = new Date(dateString)
    if (Number.isNaN(dueDate.getTime())) return 'text-themed-secondary'

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)

    const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'text-[#D4A574] dark:text-[#D4A574] font-bold' // Overdue - 用暖金色强调
    if (diffDays === 0) return 'text-[#B8956A] dark:text-[#B8956A] font-semibold' // Due today
    if (diffDays === 1) return 'text-[#7D5A36] dark:text-[#C9B99A]' // Due tomorrow
    return 'text-themed-secondary' // Future
}

// 获取任务截止日期的标签文字
const getTaskDueDateLabel = (dateString?: string): string => {
    if (!dateString) return ''
    
    const dueDate = new Date(dateString)
    if (Number.isNaN(dueDate.getTime())) return ''
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)
    
    const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return locale.value === 'zh' ? `逾期 ${Math.abs(diffDays)} 天` : `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} overdue`
    if (diffDays === 0) return locale.value === 'zh' ? '今天到期' : 'Due today'
    if (diffDays === 1) return locale.value === 'zh' ? '明天到期' : 'Due tomorrow'
    return locale.value === 'zh' ? `${diffDays} 天后到期` : `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`
}

// 编辑任务
const editTask = (task: Task) => {
    newTask.value = {
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate || ''
    }
    editingTaskIndex.value = tasks.value.findIndex(t => t.id === task.id)
    isTaskFormOpen.value = true
}

// 确认删除任务
const confirmDeleteTask = (index: number) => {
    taskToDelete.value = index
    isDeleteConfirmOpen.value = true
}

// 处理删除确认
const handleDeleteConfirm = () => {
    if (taskToDelete.value !== null) {
        store.commit('DELETE_TASK', taskToDelete.value)
        toast.success(t('toast.deleted'), t('toast.success'))
        taskToDelete.value = null
    }
}

// 处理删除取消
const handleDeleteCancel = () => {
    taskToDelete.value = null
}

const openJournalForToday = () => {
    isDaySummaryFormOpen.value = true
    selectedDate.value = new Date().toISOString().split('T')[0]
}

const openTaskModal = () => {
    newTask.value = { description: '', priority: 'Normal', dueDate: '' }
    editingTaskIndex.value = null
    isTaskFormOpen.value = true
}

const openSearchModal = () => {
    isSearchPanelOpen.value = true
}

const openCalendar = () => {
    // Reset to current month
    currentDate.value = new Date()
    isDetailedCalendarOpen.value = true
}

const formatTaskDueDate = (dateString?: string) => {
    if (!dateString) return 'No due date'
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return 'No due date'
    return date.toLocaleDateString(locale.value === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })
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
    // Collect all sparks from all day summaries, with their dates
    const allSparksWithDates: { spark: string; date: string }[] = []

    daySummaries.value.forEach((summary: DaySummaryEntry) => {
        if (summary.sparks && summary.sparks.length > 0) {
            summary.sparks.forEach(spark => {
                allSparksWithDates.push({ spark, date: summary.date })
            })
        }
    })

    // Sort by date (most recent first) and take last 10 sparks
    const sortedSparks = allSparksWithDates
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)
        .map(item => item.spark)

    return sortedSparks
})

onMounted(() => {
    initializeQuote()
    store.dispatch('loadDaySummaries')
    store.dispatch('loadTasks')
    store.dispatch('loadHabits')
    store.dispatch('loadCalendarEntries')
    setupKeyboardShortcuts()

    // Check URL parameters to open modals
    if (route.query.openCalendar === 'true') {
        openCalendar()
    }
    if (route.query.openHabits === 'true') {
        isHabitPopupOpen.value = true
    }
})

// Watch for locale changes and refresh quote
watch(locale, (newLocale) => {
    updateLanguage(newLocale as 'en' | 'zh')
    refreshQuote()
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
    color: var(--color-text);
    transition: transform 0.2s;
    position: relative;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
}

.calendar-day:hover {
    transform: scale(1.05);
    background: var(--color-surface-hover);
}

.calendar-day.empty {
    background-color: transparent;
    border: none;
}

.emotion-icon {
    font-size: 20px;
    margin-bottom: 5px;
}

.task-indicator {
    position: absolute;
    bottom: 2px;
    left: 2px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #4E3B2B;
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

/* Enhanced Journal Entry Styling */
.journal-entry {
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.journal-entry::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(125, 90, 54, 0.08), transparent);
    transition: left 0.6s ease;
}

.journal-entry:hover::before {
    left: 100%;
}

.journal-entry:hover {
    transform: translateY(-6px) scale(1.005);
    box-shadow: 0 16px 40px rgba(78, 59, 43, 0.18);
}

.journal-entry:active {
    transform: translateY(-2px) scale(0.995);
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

/* Smooth scaling animation for emojis */
@keyframes emoji-bounce {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
}

.journal-entry:hover .text-5xl {
    animation: emoji-bounce 0.6s ease-in-out;
}

/* Enhanced gradient effects */
.warm-shadow-enhanced {
    box-shadow: 0 8px 32px rgba(125, 90, 54, 0.15), 
                0 2px 8px rgba(125, 90, 54, 0.1);
}

/* Improved spacing and typography */
.journal-entry h4 {
    letter-spacing: -0.02em;
}

/* Responsive improvements */
@media (max-width: 640px) {
    .journal-entry:hover {
        transform: translateY(-4px) scale(1.002);
    }
}

/* Tasks scroll container */
.tasks-scroll-container {
    max-height: 100px;
    overflow-y: auto;
    padding-right: 4px;
}

.tasks-scroll-container::-webkit-scrollbar {
    width: 6px;
}

.tasks-scroll-container::-webkit-scrollbar-track {
    background: rgba(211, 201, 166, 0.2);
    border-radius: 3px;
}

.tasks-scroll-container::-webkit-scrollbar-thumb {
    background: rgba(125, 90, 54, 0.4);
    border-radius: 3px;
}

/* Enhanced Task Card Styles */
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 2;
}

/* Task card hover effects */
.group:hover .opacity-60 {
    opacity: 1;
}

/* Task card animation */
@keyframes task-card-appear {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Staggered animation for task cards */
.grid > div:nth-child(1) {
    animation: task-card-appear 0.3s ease-out 0.05s backwards;
}

.grid > div:nth-child(2) {
    animation: task-card-appear 0.3s ease-out 0.1s backwards;
}

.grid > div:nth-child(3) {
    animation: task-card-appear 0.3s ease-out 0.15s backwards;
}

.grid > div:nth-child(4) {
    animation: task-card-appear 0.3s ease-out 0.2s backwards;
}

.grid > div:nth-child(5) {
    animation: task-card-appear 0.3s ease-out 0.25s backwards;
}

.grid > div:nth-child(6) {
    animation: task-card-appear 0.3s ease-out 0.3s backwards;
}



.tasks-scroll-container::-webkit-scrollbar-thumb:hover {
    background: rgba(125, 90, 54, 0.6);
}
</style>
