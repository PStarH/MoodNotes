export default {
  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    close: 'Close',
    confirm: 'Confirm',
    loading: 'Loading...',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort'
  },

  // Navigation
  nav: {
    home: 'Home',
    analytics: 'Analytics',
    calendar: 'Calendar',
    habits: 'Habits',
    search: 'Search',
    backup: 'Backup',
    settings: 'Settings'
  },

  // Calendar
  calendar: {
    title: 'Detailed Calendar',
    weekDays: {
      sun: 'Sun',
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat',
      days: 'days'
    },
    tasks: 'Tasks',
    daySummary: 'Day Summary',
    close: 'Close calendar'
  },

  // Backup
  backup: {
    title: 'Backup & Export',
    subtitle: 'Download your diary data in various formats',
    exportSection: 'Export Data',
    exportDescription: 'Download your diary data in various formats for backup or migration.',
    exportJson: 'Export JSON',
    exportJsonDesc: 'Complete backup with all data',
    exportCsv: 'Export CSV',
    exportCsvDesc: 'Spreadsheet format for analysis',
    exportMarkdown: 'Markdown',
    exportMarkdownDesc: 'Human-readable format',
    exportPdf: 'Export PDF',
    exportPdfDesc: 'Print-friendly format',
    exporting: 'Exporting...',
    exportProgress: 'Export Progress',
    importSection: 'Import Data',
    importDescription: 'Restore your data from a previous backup (JSON format only).',
    selectFile: 'Select Backup File',
    clickToSelect: 'Click to select backup file',
    jsonOnly: 'Only JSON backup files are supported',
    selectedFile: 'Selected File',
    importing: 'Importing...',
    importProgress: 'Import Progress',
    importBtn: 'Import Backup',
    tips: '💡 Backup Tips',
    tip1: 'Regular backups help prevent data loss',
    tip2: 'JSON format includes all data (moods, tasks, habits)',
    tip3: 'CSV format is great for analyzing in Excel or Google Sheets',
    close: 'Close backup panel',
    error: {
      unsupportedFormat: 'Only JSON files are supported for import',
      invalidStructure: 'Invalid backup file structure',
      invalidObject: 'Backup data is not a valid object',
      missingSummaries: 'Invalid backup structure: missing or invalid daySummaries array',
      invalidField: 'Invalid backup structure: {field} must be an array'
    }
  },

  // Storage
  storage: {
    warning: {
      criticalTitle: 'Storage Almost Full',
      criticalMessage: "You're using {percent}% of available storage ({usage} of {quota}). Consider exporting and deleting old entries to free up space.",
      criticalAction: 'Export & Clean',
      warningTitle: 'Storage Running Low',
      warningMessage: "You're using {percent}% of available storage ({usage} of {quota}). You may want to export your data soon.",
      warningAction: 'Export Data'
    },
    cleanup: {
      summariesMessage: 'Day summaries are using {size}. Consider archiving older entries.',
      summariesAction: 'Archive Old Entries',
      tasksMessage: 'Tasks are using {size}. Consider deleting completed tasks.',
      tasksAction: 'Clean Completed Tasks',
      habitsMessage: 'Habits are using {size}. Consider removing old habit tracking data.',
      habitsAction: 'Clean Habit History'
    }
  },

  // Data Migration
  migration: {
    title: 'Data Migration',
    description: 'Migrate legacy data URLs to the new file system for better performance and reliability.',
    upToDate: 'All data is up to date',
    upToDateDesc: 'Your media files are already using the new file system.',
    recommended: 'Migration recommended',
    foundFiles: 'Found {count} media file(s) using legacy data URLs.',
    whatHappens: 'What will happen:',
    step1: 'Media files will be converted from data URLs to proper file references',
    step2: 'Your data will be preserved - no information will be lost',
    step3: 'App performance will improve significantly',
    step4: 'Database size will be reduced',
    startMigration: 'Start Migration',
    inProgress: 'Migration in progress...',
    currentFile: 'Current file',
    filesProcessed: '{processed} / {total} files',
    estimatedTime: '⏱️ Estimated time remaining:',
    filesFailed: '{count} file(s) failed to migrate',
    fileStatus: '📋 File Status',
    inProgressFiles: '⏳ In Progress ({count})',
    completedFiles: '✓ Completed ({count})',
    completed: 'Migration completed!',
    successMessage: 'Successfully migrated {count} file(s).',
    partialMigration: '⚠️ Partial Migration',
    partialMessage: '{count} file(s) could not be migrated. Original data has been preserved.',
    migrationResults: '📋 Migration Results',
    retry: '🔄 Retry',
    close: 'Close',
    failed: 'Migration failed',
    failedMessage: 'An error occurred during migration. Your data has not been modified.',
    tryAgain: 'Try Again'
  },

  // Search
  search: {
    title: 'Search Entries',
    placeholder: 'Search moods, tags, content...',
    filters: 'Filters',
    dateRange: 'Date Range',
    moodFilter: 'Mood Filter',
    allMoods: 'All Moods',
    results: 'Search Results',
    noResults: 'No matching entries found',
    searching: 'Searching...',
    close: 'Close search panel',
    tags: 'Tags',
    tagsLabel: 'Tags',
    tagPlaceholder: 'Type to find tags...',
    tagHelper: 'Use ↑ ↓ to highlight a suggestion, then press Enter to add it.',
    noMatchingTags: 'No matching tags yet.',
    removeTag: 'Remove tag',
    addTag: 'Add tag',
    noTagsApplied: 'No tag filters applied.',
    appliedTags: 'Applied tags',
    hasMedia: 'Has Media',
    entriesFound: 'Entries Found',
    totalWords: 'Total Words',
    uniqueTags: 'Unique Tags',
    timeSpan: 'Time Span',
    clearAll: 'Clear All',
    applySearch: 'Apply Search',
    previewResults: 'Preview Results',
    startDate: 'Start Date',
    endDate: 'End Date',
    noEntriesMatch: 'No entries match yet — try broadening the filters or date range.',
    showing: 'Showing',
    entry: 'entry',
    entries: 'entries',
    tag: 'tag',
    activeFilter: 'active tag filter',
    activeFilters: 'active tag filters',
    noContent: 'No content',
    moreTags: 'more'
  },

  // Homepage
  home: {
    greeting: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening'
    },
    friend: 'friend',
    snapshot: "Here's a quick snapshot of your mood and memories. Keep the streak going!",
    currentMood: 'Current Mood',
    energy: 'Energy',
    noEntryYet: 'No entry yet',
    newEntry: 'New Entry',
    viewAnalytics: 'View Analytics',
    addTask: 'Add Task',
    searchEntries: 'Search Entries',
    dailyQuote: "Today's Inspiration",
    lastYearToday: 'Last Year Today',
    viewEntry: 'View Entry →',
    noHistoricalData: 'No entry from this day last year.',
    captureThoughts: 'Capture today\'s thoughts to unlock throwbacks in the future.',
    todaySummary: "Today's Summary",
    openEntry: 'Open Entry',
    openHabits: 'Open Habits',
    viewInsights: 'View Insights',
    totalEntries: 'Total Entries',
    currentStreak: 'Current Streak',
    daysInARow: 'days in a row',
    avgEnergy: 'Avg Energy',
    last30Days: 'last 30 days',
    activeHabits: 'Active Habits',
    trackingNow: 'tracking now',
    latestEntry: 'Latest Entry',
    latestEntryDesc: 'A quick peek at what you captured most recently.',
    openEntryBtn: 'Open Entry',
    noContent: 'No content written yet...',
    noEntriesYet: "You haven't logged anything yet.",
    startTimelineHint: 'Start with a quick diary entry to build your personal timeline.',
    words: 'words',
    tags: 'Tags',
    upcomingTasks: 'Upcoming Tasks',
    upcomingTasksDesc: 'Stay ahead with the next few due items.',
    overdue: 'overdue',
    allClear: 'All clear',
    noTasksDue: 'No tasks due this week.',
    addTaskHint: 'Add a task to keep your plans organized.',
    tasksWithoutDue: 'task(s) without a due date',
    habitHighlight: 'Habit Highlight',
    manage: 'Manage',
    noHabits: 'No habits tracked yet.',
    addHabitHint: 'Add a habit to build healthy routines and see it highlighted here.',
    habitStreak: 'Current streak',
    day: 'day',
    days: 'days',
    recentSparks: 'Recent Sparks',
    logged: 'logged',
    captureSpark: 'Capture a bright idea.',
    sparkHint: 'Use the spark field below to jot down inspiration and highlights.',
    moreSparks: 'more sparks',
    journal: 'Journal',
    tasks: 'Tasks',
    dashboard: 'Dashboard',
    entriesCaptured: 'entries captured',
    startJourney: 'Start your journaling journey',
    startJourneyDesc: 'Capture your thoughts, feelings, and experiences. Your first entry is just a click away.',
    writeFirstEntry: 'Write First Entry',
    noTasksYet: 'No tasks yet',
    noTasksDesc: 'Start organizing your day by adding your first task. Set priorities and due dates to stay on track.',
    addNewTask: 'Add new task',
    createTask: 'Create Task',
    editTask: 'Edit Task',
    deleteTask: 'Delete Task',
    description: 'Description',
    priority: 'Priority',
    dueDate: 'Due Date',
    saveTask: 'Save Task',
    entriesThisMonth: 'Entries this month',
    greatConsistency: 'Great consistency!',
    startReflection: 'Start with a reflection today',
    wordsWritten: 'Words written',
    thisMonth: 'This month',
    averageEnergy: 'Average energy',
    basedOnCheckins: 'Based on daily check-ins',
    tasksQueued: 'Tasks queued',
    youAreOnTrack: 'You are on track',
    // TodaySummary component
    todaysOverview: "Today's Overview",
    editEntry: 'Edit Entry',
    moodCard: 'Mood',
    habitsCard: 'Habits',
    wordsCard: 'Words',
    tagsCard: 'Tags',
    noTagsYet: 'No tags yet',
    startTodaysEntry: "Start Today's Entry",
    completeHabits: 'Complete Habits',
    viewInsightsBtn: 'View Insights',
    startYourDay: 'Start Your Day Right',
    startYourDayDesc: 'Capture your thoughts, track your habits, and make today count.',
    createFirstEntry: 'Create First Entry',
    clickToEdit: 'Click to view and edit',
    stress: 'Stress',
    noWordsYet: 'No words yet',
    justGettingStarted: 'Just getting started',
    goodProgress: 'Good progress!',
    greatReflection: 'Great reflection!',
    excellentDetail: 'Excellent detail!'
  },

  // Today Habit Completion
  habitCompletion: {
    title: "Today's Habits",
    subtitle: 'Track your daily progress',
    manage: 'Manage',
    noHabits: 'No habits yet',
    noHabitsDesc: 'Start building healthy routines by adding your first habit.',
    complete: 'Complete',
    done: 'Done',
    partial: 'Partial',
    todo: 'Todo',
    quickView: 'Quick View',
    perfect: '🎉 Perfect day! All habits completed!',
    excellent: '🌟 Excellent progress! Keep it up!',
    halfway: "💪 Good effort! You're halfway there!",
    keepGoing: '🌱 Every step counts! Keep going!',
    startNow: '⏰ Start your day right—complete a habit!'
  },

  // Analytics
  analytics: {
    title: 'Analytics',
    subtitle: 'Visualize your mood, energy, and habits to uncover insights.',
    totalEntries: 'Total Entries',
    entriesThisMonth: 'This Month',
    currentStreak: 'Current Streak',
    daysInARow: 'days',
    avgEnergy: 'Avg Energy',
    last30Days: 'Last 30 days',
    activeHabits: 'Active Habits',
    trackingNow: 'Tracking',
    moodTrend: 'Mood Trend',
    wordCount: 'Word Count',
    energyStress: 'Energy & Stress',
    habitTrends: 'Habit Trends'
  },

  // Charts
  charts: {
    // Mood Chart
    moodTrend: {
      title: 'Mood Trend',
      subtitle: 'Your emotional journey over time',
      resetZoom: '🔍 Reset',
      last7Days: 'Last 7 days',
      last14Days: 'Last 14 days',
      last30Days: 'Last 30 days',
      last60Days: 'Last 60 days',
      last90Days: 'Last 90 days',
      hint: '💡 Scroll to zoom horizontally, drag to pan left/right',
      moodLevel: 'Mood Level',
      mood: 'Mood',
      energy: 'Energy',
      stress: 'Stress',
      note: 'Note',
      angry: 'Angry 😠',
      sad: 'Sad 😢',
      neutral: 'Neutral 😐',
      happy: 'Happy 😄',
      excited: 'Excited 🎉',
      unknown: 'Unknown'
    },
    // Word Count Chart
    wordCount: {
      title: 'Word Count',
      subtitle: 'Track your writing volume over time',
      resetZoom: '🔍 Reset',
      last7Days: 'Last 7 days',
      last14Days: 'Last 14 days',
      last30Days: 'Last 30 days',
      last60Days: 'Last 60 days',
      last90Days: 'Last 90 days',
      hint: '💡 Scroll to zoom horizontally, drag to pan left/right',
      words: 'Words',
      totalWords: 'Total Words',
      avgWords: 'Avg Words'
    },
    // Energy & Stress Chart
    energyStress: {
      title: 'Energy & Stress',
      subtitle: 'Track your energy and stress levels',
      resetZoom: '🔍 Reset',
      last7Days: 'Last 7 days',
      last14Days: 'Last 14 days',
      last30Days: 'Last 30 days',
      last60Days: 'Last 60 days',
      last90Days: 'Last 90 days',
      hint: '💡 Scroll to zoom horizontally, drag to pan left/right',
      energy: 'Energy',
      stress: 'Stress',
      productivity: 'Productivity',
      level: 'Level',
      stressAxis: 'Stress Level →',
      energyAxis: '↑ Energy Level'
    },
    // Habit Insights
    habitInsights: {
      title: 'Habit Insights',
      subtitle: 'Track your progress and build better routines',
      manageHabits: 'Manage Habits',
      startBuilding: 'Start Building Better Habits',
      startBuildingDesc: 'Track your daily routines, build consistency, and watch your progress grow over time. Small steps lead to big changes!',
      addFirstHabit: 'Add Your First Habit',
      activeHabits: 'Active Habits',
      completedToday: 'completed today',
      thisWeek: 'This Week',
      bestStreak: 'Best Streak',
      keepGoing: 'Keep going!',
      habitPerformance: 'Habit Performance',
      currentStreak: 'current streak',
      thisMonth: 'This Month',
      totalDays: 'Total Days',
      lastCompleted: 'Last Completed',
      never: 'Never',
      today: 'Today',
      yesterday: 'Yesterday',
      daysAgo: '{count} days ago',
      allTimeRate: 'All-Time Rate'
    },
    // Common
    common: {
      noData: 'No data available',
      loading: 'Loading…'
    }
  },

  // Settings
  settings: {
    title: 'Settings',
    subtitle: 'Customize your MoodNotes experience',
    theme: 'Theme',
    themeDesc: 'Choose your preferred color scheme',
    themeOptions: {
      light: {
        title: 'Golden Light',
        subtitle: 'Bright & uplifting',
        description: 'Warm neutrals with crisp typography for daytime journaling sessions.'
      },
      dark: {
        title: 'Velvet Night',
        subtitle: 'Calm & focused',
        description: 'Low-light friendly tones with amber highlights to reduce eye strain.'
      },
      auto: {
        title: 'Match System',
        subtitle: 'Smart adaptive',
        description: 'Automatically follow your device appearance and switch throughout the day.'
      }
    },
    language: 'Language',
    languageDesc: 'Select your preferred language',
    autoSave: 'Auto-Save',
    autoSaveDesc: 'Configure automatic saving behavior',
    autoSaveOnClose: 'Auto-save on close',
    autoSaveOnCloseDesc: 'Automatically save your journal entry when closing the editor',
    autoSaveEnabled: 'Auto-save enabled',
    autoSaveDisabled: 'Auto-save disabled',
    autoSaveError: 'Failed to update auto-save setting',
    dailyQuoteBank: 'Daily Quote Bank',
    dailyQuoteBankDesc: 'Manage your inspirational quotes',
    customQuotes: 'Custom Quotes',
    addQuote: '+ Add Quote',
    addQuoteHint: 'Add your own inspirational quotes to the rotation',
    quoteText: 'Quote Text',
    quoteTextPlaceholder: 'Enter your inspirational quote...',
    author: 'Author (Optional)',
    authorPlaceholder: 'Author name',
    saveQuote: 'Save Quote',
    noQuotesYet: 'No custom quotes yet. Add your first inspirational quote!',
    quoteStats: 'Quote Bank Statistics',
    customQuotesInLibrary: 'Custom Quotes in Library',
    about: 'About MoodNotes',
    version: 'Version',
    build: 'Build',
    aboutDesc: 'MoodNotes is your personal journaling companion, designed to help you track your mood, habits, and memories with beautiful visualizations and insights.',
    english: 'English',
    defaultLanguage: 'Default language',
    chinese: '中文',
    simplifiedChinese: '简体中文'
  },

  // Day Summary
  daySummary: {
    title: 'Daily Review',
    weather: 'Weather',
    mood: 'Mood',
    chooseMood: 'Choose a mood',
    chooseMoodHint: 'Tap to set how the day feels',
    tags: 'Tags',
    addTag: 'Add a tag',
    sparks: 'Sparks',
    sparksDesc: 'Record highlights, ideas and beautiful moments from today',
    addSpark: 'Add',
    sparkPlaceholder: 'Enter a spark... (Enter to add, Shift+Enter for new line)',
    goalsReflection: 'Goals Reflection',
    goalsReflectionDesc: 'Reflect on your upcoming goals and track your progress.',
    goalReflectionPlaceholder: 'How are you progressing on this goal? What steps did you take today?',
    dueToday: 'Due Today',
    dueTomorrow: 'Due Tomorrow',
    habits: 'Daily Habits',
    habitsDesc: 'Track your daily habits and maintain a positive lifestyle',
    completed: 'Completed',
    partiallyCompleted: 'Partially Completed',
    notCompleted: 'Not Completed',
    dailyCheck: 'Daily Check',
    energyLevel: 'Energy Level',
    stressLevel: 'Stress Level',
    productivity: 'Productivity',
    media: 'Media',
    addImage: 'Add Image',
    addVideo: 'Add Video',
    addAudio: 'Add Audio',
    comfortZone: 'Comfort Zone Entry',
    comfortZonePlaceholder: 'Did you step out of your comfort zone today? How did it feel?',
    customSection: 'Custom Section',
    addCustomSection: '+ Add Custom Section',
    sectionTitle: 'Section Title',
    sectionContent: 'Section Content',
    saveSection: 'Save Section',
    saveAll: 'Save All',
    saving: 'Saving...',
    saved: 'Saved!',
    deleteEntry: 'Delete this entry',
    exportPdf: 'Export as PDF',
    exportMarkdown: 'Export as Markdown',
    exportHtml: 'Export as HTML',
    lastYearToday: 'Last Year Today',
    lastYearMood: 'Mood',
    reflecting: 'Reflecting on your journey helps you grow 🌱',
    optimalZone: 'Optimal Zone',
    highEnergyLowStress: 'High energy, Low stress',
    burnoutRisk: 'Burnout Risk',
    lowEnergyHighStress: 'Low energy, High stress'
  },

  // Tasks
  task: {
    priority: {
      lowest: 'Lowest',
      low: 'Low',
      normal: 'Normal',
      medium: 'Medium',
      high: 'High',
      highest: 'Highest'
    },
    dueToday: 'Due today',
    dueTomorrow: 'Due tomorrow',
    daysOverdue: 'day(s) overdue',
    dueIn: 'Due in',
    anytime: 'Anytime',
    noDueDate: 'No due date'
  },

  // Priority translations
  priority: {
    lowest: 'Lowest',
    low: 'Low',
    normal: 'Normal',
    medium: 'Medium',
    high: 'High',
    highest: 'Highest'
  },

  // Habits
  habit: {
    myHabits: 'My Habits',
    addHabit: 'Add New Habit',
    editHabit: 'Edit Habit',
    habitName: 'Habit Name',
    habitDescription: 'Description',
    habitTracking: 'Habit Tracking',
    streak: 'Streak'
  },

  // Mood options
  mood: {
    happy: {
      label: 'Happy',
      caption: 'Bright and optimistic vibes',
      description: 'Feeling great today!'
    },
    neutral: {
      label: 'Neutral',
      caption: 'Steady and grounded today',
      description: 'A steady day'
    },
    sad: {
      label: 'Sad',
      caption: 'A softer, reflective mood',
      description: 'Taking it easy'
    },
    excited: {
      label: 'Excited',
      caption: 'Energized and full of spark',
      description: 'Full of energy!'
    },
    angry: {
      label: 'Frustrated',
      caption: 'Tension worth unpacking',
      description: 'Feeling challenged'
    }
  },

  // Quotes
  quote: {
    refreshing: 'Refreshing…',
    newQuote: 'New quote',
    loadingInspiration: "Loading today's inspiration...",
    fetchedOnline: 'Fetched online',
    localLibrary: 'Local library',
    cachedForToday: 'Cached for today',
    offlineFallback: 'Offline fallback',
    sourcePending: 'Source pending',
    waitingForFirst: 'Waiting for first quote',
    offlineMode: 'Offline mode',
    capturePlaceholder: 'Capture your thoughts to unlock more daily inspiration.',
    updated: 'Updated'
  },

  // Toasts & Notifications
  toast: {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    saved: 'Saved successfully',
    deleted: 'Deleted successfully',
    updated: 'Updated successfully',
    failed: 'Operation failed'
  }
}
