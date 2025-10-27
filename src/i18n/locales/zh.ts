export default {
  // 通用
  common: {
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    close: '关闭',
    confirm: '确认',
    loading: '加载中，请稍候…',
    search: '搜索',
    filter: '筛选',
    sort: '排序'
  },

  // 导航
  nav: {
    home: '首页',
    analytics: '洞察',
    calendar: '日历',
    habits: '习惯',
    search: '搜索',
    backup: '备份',
    settings: '设置'
  },

  // 日历
  calendar: {
    title: '详细日历',
    weekDays: {
      sun: '周日',
      mon: '周一',
      tue: '周二',
      wed: '周三',
      thu: '周四',
      fri: '周五',
      sat: '周六',
      days: '天'
    },
    tasks: '任务',
    daySummary: '每日总结',
    close: '关闭日历'
  },

  // 备份与导出
  backup: {
    title: '备份与导出',
    subtitle: '将你的日记数据以多种格式导出保存',
    exportSection: '导出数据',
    exportDescription: '将日记数据以不同格式导出，用于备份或迁移。',
    exportJson: '导出 JSON',
    exportJsonDesc: '完整备份所有数据',
    exportCsv: '导出 CSV',
    exportCsvDesc: '适合在电子表格中分析',
    exportMarkdown: 'Markdown',
    exportMarkdownDesc: '人类可读的文本格式',
    exportPdf: '导出 PDF',
    exportPdfDesc: '适合打印的格式',
    exporting: '正在导出…',
    exportProgress: '导出进度',
    importSection: '导入数据',
    importDescription: '从以前的备份恢复数据（仅支持 JSON 格式）。',
    selectFile: '选择备份文件',
    clickToSelect: '点击选择备份文件',
    jsonOnly: '仅支持 JSON 备份文件',
    selectedFile: '已选择文件',
    importing: '正在导入…',
    importProgress: '导入进度',
    importBtn: '导入备份',
    tips: '💡 备份小贴士',
    tip1: '定期备份有助于防止数据丢失',
    tip2: 'JSON 格式包含所有数据（心情、任务、习惯）',
    tip3: 'CSV 格式适合在 Excel 或 Google Sheets 中分析',
    close: '关闭备份面板',
    error: {
      unsupportedFormat: '仅支持 JSON 文件导入',
      invalidStructure: '备份文件结构无效',
      invalidObject: '备份数据不是有效的对象',
      missingSummaries: '备份结构无效：缺少或无效的 daySummaries 数组',
      invalidField: '备份结构无效：{field} 必须是数组'
    }
  },

  // 存储空间
  storage: {
    warning: {
      criticalTitle: '存储空间即将用尽',
      criticalMessage: '你已使用 {percent}% 的可用存储空间（{usage} / {quota}）。请考虑导出并删除旧条目以释放空间。',
      criticalAction: '导出并清理',
      warningTitle: '存储空间不足',
      warningMessage: '你已使用 {percent}% 的可用存储空间（{usage} / {quota}）。你可能需要尽快导出数据。',
      warningAction: '导出数据'
    },
    cleanup: {
      summariesMessage: '每日总结占用 {size}。请考虑归档较旧的条目。',
      summariesAction: '归档旧条目',
      tasksMessage: '任务占用 {size}。请考虑删除已完成的任务。',
      tasksAction: '清理已完成任务',
      habitsMessage: '习惯占用 {size}。请考虑删除旧的习惯跟踪数据。',
      habitsAction: '清理习惯历史'
    }
  },

  // 数据迁移
  migration: {
    title: '数据迁移',
    description: '将旧版数据 URL 迁移到新的文件系统，以提高性能和可靠性。',
    upToDate: '所有数据均为最新',
    upToDateDesc: '你的媒体文件已在使用新的文件系统。',
    recommended: '建议进行迁移',
    foundFiles: '发现 {count} 个使用旧版数据 URL 的媒体文件。',
    whatHappens: '将会发生什么：',
    step1: '媒体文件将从数据 URL 转换为正确的文件引用',
    step2: '你的数据将被保留 - 不会丢失任何信息',
    step3: '应用性能将显著提高',
    step4: '数据库大小将减小',
    startMigration: '开始迁移',
    inProgress: '迁移进行中…',
    currentFile: '当前文件',
    filesProcessed: '{processed} / {total} 个文件',
    estimatedTime: '⏱️ 预计剩余时间：',
    filesFailed: '{count} 个文件迁移失败',
    fileStatus: '📋 文件状态',
    inProgressFiles: '⏳ 进行中 ({count})',
    completedFiles: '✓ 已完成 ({count})',
    completed: '迁移完成！',
    successMessage: '成功迁移 {count} 个文件。',
    partialMigration: '⚠️ 部分迁移',
    partialMessage: '{count} 个文件无法迁移。原始数据已保留。',
    migrationResults: '📋 迁移结果',
    retry: '🔄 重试',
    close: '关闭',
    failed: '迁移失败',
    failedMessage: '迁移过程中发生错误。你的数据未被修改。',
    tryAgain: '重试'
  },

  // 搜索
  search: {
    title: '搜索条目',
    placeholder: '搜索心情、标签、内容…',
    filters: '筛选器',
    dateRange: '日期范围',
    moodFilter: '心情筛选',
    allMoods: '所有心情',
    results: '搜索结果',
    noResults: '未找到匹配的条目',
    searching: '搜索中…',
    close: '关闭搜索面板',
    tags: '标签',
    tagsLabel: '标签',
    tagPlaceholder: '输入以查找标签…',
    tagHelper: '使用 ↑ ↓ 高亮显示建议，然后按 Enter 添加。',
    noMatchingTags: '暂无匹配的标签。',
    removeTag: '移除标签',
    addTag: '添加标签',
    noTagsApplied: '未应用标签筛选。',
    appliedTags: '已应用的标签',
    hasMedia: '包含媒体',
    entriesFound: '找到的条目',
    totalWords: '总字数',
    uniqueTags: '唯一标签',
    timeSpan: '时间跨度',
    clearAll: '清除全部',
    applySearch: '应用搜索',
    previewResults: '预览结果',
    startDate: '开始日期',
    endDate: '结束日期',
    noEntriesMatch: '暂无匹配的条目 - 尝试放宽筛选条件或日期范围。',
    showing: '显示',
    entry: '条',
    entries: '条',
    tag: '个标签',
    activeFilter: '个活动标签筛选',
    activeFilters: '个活动标签筛选',
    noContent: '无内容',
    moreTags: '更多'
  },

  // 首页
  home: {
    greeting: {
      morning: '早安，愿你今日从容',
      afternoon: '午安，继续前行',
      evening: '晚安，放松休息'
    },
    friend: '欢迎回来',
    snapshot: '这是心境与回忆的速写，愿你常记此刻温暖。',
    currentMood: '此刻心情',
    energy: '能量指数',
    noEntryYet: '还没有记录哦',
    newEntry: '开始书写',
    viewAnalytics: '查看洞察',
    addTask: '添加新任务',
    searchEntries: '搜索记录',
    dailyQuote: '每日一句',
  lastYearToday: '去年今日',
    viewEntry: '回顾 →',
    noHistoricalData: '去年今日暂无记录',
    captureThoughts: '记录当下所思，让未来回味。',
    todaySummary: '今日回顾',
    openEntry: '查看回顾',
    openHabits: '查看习惯',
    viewInsights: '查看洞察',
    totalEntries: '累计记录',
  currentStreak: '坚持天数',
    daysInARow: '天',
  avgEnergy: '平均能量',
  last30Days: '最近30天',
  activeHabits: '进行中',
  trackingNow: '追踪中',
    latestEntry: '最新记录',
    latestEntryDesc: '重温你最近的心情与思考。',
    openEntryBtn: '查看详情',
    noContent: '暂无内容，动笔写下心声吧…',
    words: '字数',
    tags: '标签',
    upcomingTasks: '即将到期',
    upcomingTasksDesc: '这些是你近期的安排。',
    overdue: '已逾期',
    allClear: '目前无逾期',
    noTasksDue: '本周没有到期任务',
    addTaskHint: '试试添加任务，让每一天更清晰。',
    tasksWithoutDue: '个未设截止日',
    habitHighlight: '习惯亮点',
    manage: '管理习惯',
    noHabits: '还没开始新的习惯哦',
    addHabitHint: '养成好习惯，让生活更美好。',
  habitStreak: '坚持天数',
    day: '天',
    days: '天',
    recentSparks: '最近的火花',
    logged: '已记录',
    captureSpark: '捕捉灵感',
    sparkHint: '在此记录触动你心的闪念。',
    moreSparks: '更多灵感',
    journal: '手记',
    tasks: '任务',
  dashboard: '总览',
    entriesCaptured: '篇手记',
    startJourney: '开启记录之旅',
  startJourneyDesc: '从这里开始，记录并珍视你的每一个瞬间。',
    writeFirstEntry: '写下首篇',
    noTasksYet: '还没有任务',
    noTasksDesc: '添加第一个任务，让计划更清晰。',
    addNewTask: '新增任务',
    createTask: '创建任务',
    editTask: '编辑任务',
    deleteTask: '删除任务',
    description: '描述',
    priority: '优先级',
    dueDate: '截止日期',
    saveTask: '保存任务',
    entriesThisMonth: '本月记录',
    greatConsistency: '坚持不易，赞一个！',
    startReflection: '开始今日反思',
    wordsWritten: '累计字数',
    thisMonth: '本月',
  averageEnergy: '平均能量',
    basedOnCheckins: '基于每日签到',
    tasksQueued: '任务队列',
    youAreOnTrack: '一切正在有序进行',
    // TodaySummary 组件
    todaysOverview: '今日总览',
    editEntry: '编辑日记',
    moodCard: '心情',
    habitsCard: '习惯',
    wordsCard: '字数',
    tagsCard: '标签',
    noTagsYet: '暂无标签',
    noWordsYet: '还没有字数',
    justGettingStarted: '刚刚开始',
    goodProgress: '进展不错',
    greatReflection: '深度思考',
    excellentDetail: '细致入微',
    startTodaysEntry: '开始今日记录',
    completeHabits: '完成习惯',
    viewInsightsBtn: '洞察',
    startYourDay: '开启美好的一天',
    startYourDayDesc: '记录你的想法，追踪习惯，让今天更有意义。',
    createFirstEntry: '创建首条记录'
  },

  // 今日习惯完成
  habitCompletion: {
    title: '今日习惯',
    subtitle: '追踪每日进展',
    manage: '管理',
    noHabits: '还没有习惯',
    noHabitsDesc: '开始建立健康的习惯，添加你的第一个习惯。',
    complete: '完成',
    done: '已完成',
    partial: '部分完成',
    todo: '待完成',
    quickView: '快速查看',
    perfect: '🎉 完美的一天！所有习惯都完成了！',
    excellent: '🌟 进展很好！继续保持！',
    halfway: '💪 不错的努力！你已经完成一半了！',
    keepGoing: '🌱 每一步都很重要！继续前进！',
    startNow: '⏰ 开启美好的一天——完成一个习惯！'
  },

  // 分析
  analytics: {
    title: '洞察数据',
    subtitle: '用数据映照你的心境、能量与习惯，倾听成长的声音。',
    totalEntries: '总记录',
  entriesThisMonth: '本月记录',
  currentStreak: '坚持天数',
    daysInARow: '天',
    avgEnergy: '平均能量',
    last30Days: '最近30天',
  activeHabits: '进行中',
  trackingNow: '追踪中',
    moodTrend: '心境变化',
    wordCount: '字数统计',
    energyStress: '能量与压力',
    habitTrends: '习惯变化'
  },

  // 图表
  charts: {
    // 心情趋势图
    moodTrend: {
      title: '心情趋势',
      subtitle: '你的情感旅程',
      resetZoom: '🔍 重置',
      last7Days: '最近 7 天',
      last14Days: '最近 14 天',
      last30Days: '最近 30 天',
      last60Days: '最近 60 天',
      last90Days: '最近 90 天',
      hint: '💡 滚动可横向缩放，拖动可左右平移',
      moodLevel: '心情水平',
      mood: '心情',
      energy: '能量',
      stress: '压力',
      note: '笔记',
      angry: '愤怒 😠',
      sad: '难过 😢',
      neutral: '平静 😐',
      happy: '开心 😄',
      excited: '激动 🎉',
      unknown: '未知'
    },
    // 字数统计图
    wordCount: {
      title: '字数统计',
      subtitle: '追踪你的书写量',
      resetZoom: '🔍 重置',
      last7Days: '最近 7 天',
      last14Days: '最近 14 天',
      last30Days: '最近 30 天',
      last60Days: '最近 60 天',
      last90Days: '最近 90 天',
      hint: '💡 滚动可横向缩放，拖动可左右平移',
      words: '字数',
      totalWords: '总字数',
      avgWords: '平均字数'
    },
    // 能量与压力图
    energyStress: {
      title: '能量与压力',
      subtitle: '追踪你的能量和压力水平',
      resetZoom: '🔍 重置',
      last7Days: '最近 7 天',
      last14Days: '最近 14 天',
      last30Days: '最近 30 天',
      last60Days: '最近 60 天',
      last90Days: '最近 90 天',
      hint: '💡 滚动可横向缩放，拖动可左右平移',
      energy: '能量',
      stress: '压力',
      productivity: '生产力',
      level: '水平',
      stressAxis: '压力水平 →',
      energyAxis: '↑ 能量水平'
    },
    // 习惯洞察
    habitInsights: {
      title: '习惯洞察',
      subtitle: '追踪你的进展，建立更好的习惯',
      manageHabits: '管理习惯',
      startBuilding: '开始建立更好的习惯',
      startBuildingDesc: '追踪日常习惯，建立一致性，见证进步的增长。小步骤带来大变化！',
      addFirstHabit: '添加你的第一个习惯',
      activeHabits: '进行中的习惯',
      completedToday: '今日已完成',
      thisWeek: '本周',
      bestStreak: '最佳连续',
      keepGoing: '继续保持！',
      habitPerformance: '习惯表现',
      currentStreak: '当前连续',
      thisMonth: '本月',
      totalDays: '总天数',
      lastCompleted: '最近完成',
      never: '从未',
      today: '今天',
      yesterday: '昨天',
      daysAgo: '{count} 天前',
      allTimeRate: '历史完成率'
    },
    // 通用
    common: {
      noData: '暂无数据',
      loading: '加载中…'
    }
  },

  // 设置
  settings: {
    title: '设置',
  subtitle: '自定义你的「晨暮」专属体验',
    theme: '主题',
  themeDesc: '选择最契合心情的色彩，让使用更惬意',
    themeOptions: {
      light: {
        title: '暖阳',
        subtitle: '明亮而温暖',
        description: '柔和的浅色调，适合在白日里记录灵感。'
      },
      dark: {
        title: '夜幕',
        subtitle: '沉静而专注',
        description: '静谧的深色背景，让夜间书写更显沉浸。'
      },
      auto: {
        title: '追随系统',
        subtitle: '明暗自如',
        description: '自动适应系统的色彩模式，无缝切换。'
      }
    },
    language: '语言',
    languageDesc: '选择最适合你的语言',
    autoSave: '自动保存',
    autoSaveDesc: '配置自动保存行为',
    autoSaveOnClose: '关闭时自动保存',
    autoSaveOnCloseDesc: '关闭日记编辑器时自动保存你的内容',
    autoSaveEnabled: '自动保存已启用',
    autoSaveDisabled: '自动保存已禁用',
    autoSaveError: '更新自动保存设置失败',
    dailyQuoteBank: '箴言之库',
  dailyQuoteBankDesc: '管理你的每日灵感库',
  customQuotes: '我的箴言收藏',
  addQuote: '+ 添加收藏',
  addQuoteHint: '收藏触动心灵的句子，让每一天都充满力量。',
    quoteText: '箴言内容',
  quoteTextPlaceholder: '写下能够激励你的那句话…',
    author: '出处（可选）',
    authorPlaceholder: '作者或来源',
    saveQuote: '收藏',
  noQuotesYet: '暂无收藏，赶快添加第一句吧！',
  quoteStats: '收藏统计',
  customQuotesInLibrary: '收藏数量',
    about: '关于晨暮',
    version: '版本',
    build: '构建',
    aboutDesc: '“晨暮”是你的私人日志与心灵伴侣，通过细腻的可视化与洞察，帮你梳理思绪、养成习惯、珍藏回忆。',
    english: 'English',
    defaultLanguage: '默认显示语言',
    chinese: '中文',
    simplifiedChinese: '简体中文'
  },

  // 每日回顾
  daySummary: {
    title: '今日回顾',
    weather: '今日天气',
    mood: '心情记录',
    chooseMood: '点亮今日心情',
    chooseMoodHint: '点选一个，代表你此刻的心情',
    tags: '话题标签',
    addTag: '添加标签',
    sparks: '灵感火花',
    sparksDesc: '记录那些激励你的瞬间',
    addSpark: '捕捉灵感',
    sparkPlaceholder: '记录这一刻的灵感…（Enter 发送，Shift+Enter 换行）',
    goalsReflection: '目标反思',
    goalsReflectionDesc: '回顾即将到期的目标，记录进展与思考。',
    goalReflectionPlaceholder: '这个目标进展如何？今天采取了哪些行动？',
    dueToday: '今日到期',
    dueTomorrow: '明日到期',
    habits: '今日习惯',
    habitsDesc: '追踪每个小进步，见证成长',
    completed: '已完成',
    partiallyCompleted: '部分达成',
    notCompleted: '未达成',
    dailyCheck: '每日打卡',
  energyLevel: '能量水平',
    stressLevel: '压力感受',
    productivity: '效率指数',
    media: '多媒体',
    addImage: '添加图片',
    addVideo: '添加视频',
    addAudio: '添加音频',
    comfortZone: '舒适区探索',
    comfortZonePlaceholder: '今天有哪些新尝试？写下突破与感受',
    customSection: '自定义区块',
    addCustomSection: '+ 新增自定义区块',
    sectionTitle: '区块标题',
    sectionContent: '区块内容',
    saveSection: '保存区块',
  saveAll: '全部保存',
    saving: '正在保存…',
    saved: '保存成功',
  deleteEntry: '删除本条',
    exportPdf: '导出 PDF',
    exportMarkdown: '导出 Markdown',
    exportHtml: '导出 HTML',
    lastYearToday: '去年今日',
    lastYearMood: '当时心情',
    reflecting: '回望过去，见证成长 🌱',
    clickToEdit: '点击查看和编辑',
    stress: '压力'
  },  // 任务
  task: {
    priority: {
      lowest: '最低优先',
      low: '低优先',
      normal: '中等优先',
      medium: '较高优先',
      high: '高优先',
      highest: '最高优先'
    },
    dueToday: '今日截止',
    dueTomorrow: '明日截止',
    daysOverdue: '逾期天数',
    dueIn: '剩余',
    anytime: '暂无期限',
    noDueDate: '未设截止'
  },

  // 优先级翻译
  priority: {
    lowest: '最低',
    low: '较低',
    normal: '普通',
    medium: '中等',
    high: '较高',
    highest: '最高'
  },

  // 习惯
  habit: {
    myHabits: '我的习惯',
    addHabit: '创建新习惯',
    editHabit: '修改习惯',
    habitName: '习惯名称',
    habitDescription: '习惯描述',
    habitTracking: '追踪方式',
    streak: '坚持天数'
  },

  // 心情选项
  mood: {
    happy: {
      label: '开心',
      caption: '心怀阳光，笑对生活',
      description: '你今天状态满分！'
    },
    neutral: {
      label: '平静',
      caption: '心如止水，安稳舒适',
      description: '享受片刻宁静'
    },
    sad: {
      label: '难过',
      caption: '心有阴霾，温柔以待',
      description: '给自己一个拥抱'
    },
    excited: {
      label: '激动',
      caption: '热情如火，跃跃欲试',
      description: '让激情引领前行'
    },
    angry: {
      label: '愤怒',
      caption: '怒火中烧，深呼吸一下',
      description: '给自己冷静的空间'
    }
  },

  // 引言
  quote: {
    refreshing: '正在刷新…',
  newQuote: '换一句',
    loadingInspiration: '正在加载灵感…',
    fetchedOnline: '在线获取',
    localLibrary: '本地收藏',
    cachedForToday: '今日已缓存',
    offlineFallback: '离线模式可用',
    sourcePending: '来源加载中',
    waitingForFirst: '等待第一条灵感',
    offlineMode: '当前离线',
    capturePlaceholder: '留下一句话，唤醒更多灵感。',
    updated: '更新于'
  },

  // 提示与通知
  toast: {
    success: '操作成功',
    error: '发生错误',
    warning: '请留意',
    info: '友情提示',
    saved: '已成功保存',
    deleted: '已删除',
    updated: '已更新',
    failed: '操作未完成，请重试'
  }
}
