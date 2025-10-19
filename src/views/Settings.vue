<template>
  <div class="h-screen flex gradient-bg">
    <!-- Sidebar -->
    <div class="w-64 sidebar-gradient p-6 warm-shadow-lg flex flex-col h-full">
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
            <a
              href="#"
              class="text-[#4E3B2B] no-underline flex items-center p-3 rounded-lg hover-lift transition-all duration-200 hover:bg-[#FAF3E0]"
              @click.prevent="openCalendar"
            >
              <Calendar class="mr-3" :size="20" />
              <span class="font-medium">{{ $t('nav.calendar') }}</span>
            </a>
          </li>
          <li class="mb-3">
            <a
              href="#"
              class="text-[#4E3B2B] no-underline flex items-center p-3 rounded-lg hover-lift transition-all duration-200 hover:bg-[#FAF3E0]"
              @click.prevent="openHabits"
            >
              <BookOpen class="mr-3" :size="20" />
              <span class="font-medium">{{ $t('nav.habits') }}</span>
            </a>
          </li>
          <li class="mb-3">
            <a
              href="#"
              class="text-[#4E3B2B] no-underline flex items-center p-3 rounded-lg hover-lift transition-all duration-200 hover:bg-[#FAF3E0]"
              @click.prevent="$router.push('/')"
            >
              <Search class="mr-3" :size="20" />
              <span class="font-medium">{{ $t('nav.search') }}</span>
            </a>
          </li>
          <li class="mb-3">
            <a
              href="#"
              class="text-[#4E3B2B] no-underline flex items-center p-3 rounded-lg hover-lift transition-all duration-200 hover:bg-[#FAF3E0]"
              @click.prevent="$router.push('/')"
            >
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
    <div class="flex-1 p-6 overflow-y-auto custom-scrollbar">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-[#4E3B2B] flex items-center">
          <span class="mr-3 text-4xl">⚙️</span>
          {{ $t('settings.title') }}
        </h1>
        <p class="text-[#7D5A36] mt-2">
          {{ $t('settings.subtitle') }}
        </p>
      </div>

      <!-- Settings Sections -->
      <div class="space-y-6 max-w-4xl">
        <!-- Theme Settings -->
        <div class="glass-effect p-6 rounded-2xl warm-shadow-lg">
          <h2 class="text-xl font-bold text-[#4E3B2B] mb-4 flex items-center">
            <span class="mr-2">🎨</span>
            {{ $t('settings.theme') }}
          </h2>
          <p class="text-sm text-[#7D5A36]/80 mb-4">{{ $t('settings.themeDesc') }}</p>
          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <button
              v-for="card in themeCards"
              :key="card.key"
              type="button"
              @click="setTheme(card.key)"
              class="group relative overflow-hidden rounded-2xl border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7D5A36]"
              :class="currentTheme === card.key ? 'border-[#7D5A36] warm-shadow-lg bg-white/80 shadow-xl' : 'border-transparent glass-effect hover:border-[#7D5A36]/40 hover:-translate-y-0.5'"
            >
              <div
                class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-80"
                :style="{ background: card.previewGradient }"
              ></div>
              <div class="relative space-y-5 p-5">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[#7D5A36]/70">
                      {{ card.subtitle }}
                    </p>
                    <div class="mt-1 flex items-center gap-2">
                      <component :is="card.icon" class="h-5 w-5 text-[#7D5A36]" />
                      <h3 class="text-xl font-bold text-[#4E3B2B]">
                        {{ card.title }}
                      </h3>
                    </div>
                  </div>
                  <div
                    class="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200"
                    :class="currentTheme === card.key ? 'bg-[#7D5A36] text-white shadow-md' : 'border border-[#D3C9A6]/60 text-[#7D5A36]/70 bg-white/70'"
                  >
                    <Check v-if="currentTheme === card.key" class="h-4 w-4" />
                    <component v-else :is="card.icon" class="h-4 w-4" />
                  </div>
                </div>
                <p class="text-sm leading-relaxed text-[#7D5A36]/80">
                  {{ card.description }}
                </p>
                <div class="rounded-xl border border-white/40 bg-white/60 shadow-inner">
                  <div class="relative h-24 overflow-hidden rounded-xl">
                    <div class="absolute inset-0" :style="{ background: card.previewGradient }"></div>
                    <div
                      class="absolute inset-3 flex h-[calc(100%-24px)] flex-col justify-between rounded-xl p-3"
                      :style="{ background: card.surfaceColor }"
                    >
                      <div class="flex gap-1">
                        <span class="h-2 flex-1 rounded-full" :style="{ background: card.primaryBarColor }"></span>
                        <span class="h-2 flex-1 rounded-full opacity-50" :style="{ background: card.accentColor }"></span>
                      </div>
                      <div class="space-y-2">
                        <span class="block h-1.5 w-3/4 rounded-full" :style="{ background: card.textColor, opacity: 0.85 }"></span>
                        <span class="block h-1.5 w-2/3 rounded-full" :style="{ background: card.textMutedColor, opacity: 0.6 }"></span>
                        <span class="block h-1.5 w-1/2 rounded-full" :style="{ background: card.textMutedColor, opacity: 0.35 }"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Language Settings -->
        <div class="glass-effect p-6 rounded-2xl warm-shadow-lg">
          <h2 class="text-xl font-bold text-[#4E3B2B] mb-4 flex items-center">
            <span class="mr-2">🌐</span>
            {{ $t('settings.language') }} / 语言
          </h2>
          <p class="text-sm text-[#7D5A36]/80 mb-4">{{ $t('settings.languageDesc') }}</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              @click="setLanguage('en')"
              :class="currentLanguage === 'en' ? 'border-[#7D5A36] bg-gradient-to-br from-[#7D5A36]/10 to-[#6B4A2E]/10 warm-shadow scale-105' : 'border-[#D3C9A6]/40 glass-effect hover:border-[#7D5A36]/50'"
              class="relative flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 hover-lift"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">🇺🇸</span>
                <div class="text-left">
                  <p class="font-semibold text-[#4E3B2B]">{{ $t('settings.english') }}</p>
                  <p class="text-xs text-[#7D5A36]/70">{{ $t('settings.defaultLanguage') }}</p>
                </div>
              </div>
              <div v-if="currentLanguage === 'en'" class="w-5 h-5 rounded-full bg-[#7D5A36] flex items-center justify-center">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </button>

            <button
              @click="setLanguage('zh')"
              :class="currentLanguage === 'zh' ? 'border-[#7D5A36] bg-gradient-to-br from-[#7D5A36]/10 to-[#6B4A2E]/10 warm-shadow scale-105' : 'border-[#D3C9A6]/40 glass-effect hover:border-[#7D5A36]/50'"
              class="relative flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 hover-lift"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">🇨🇳</span>
                <div class="text-left">
                  <p class="font-semibold text-[#4E3B2B]">{{ $t('settings.chinese') }}</p>
                  <p class="text-xs text-[#7D5A36]/70">{{ $t('settings.simplifiedChinese') }}</p>
                </div>
              </div>
              <div v-if="currentLanguage === 'zh'" class="w-5 h-5 rounded-full bg-[#7D5A36] flex items-center justify-center">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        <!-- Daily Quote Bank Settings -->
        <div class="glass-effect p-6 rounded-2xl warm-shadow-lg">
          <h2 class="text-xl font-bold text-[#4E3B2B] mb-4 flex items-center">
            <span class="mr-2">💬</span>
            {{ $t('settings.dailyQuoteBank') }} / 每日引言库
          </h2>
          <p class="text-sm text-[#7D5A36]/80 mb-4">{{ $t('settings.dailyQuoteBankDesc') }}</p>

          <div class="space-y-4">
            <!-- Custom Quotes -->
            <div class="p-4 glass-effect rounded-xl">
              <div class="flex items-center justify-between mb-3">
                <p class="font-semibold text-[#4E3B2B]">{{ $t('settings.customQuotes') }}</p>
                <button
                  @click="showAddQuoteForm = true"
                  class="px-3 py-1.5 bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white rounded-lg text-sm font-semibold hover-lift transition-all warm-shadow"
                >
                  {{ $t('settings.addQuote') }}
                </button>
              </div>
              <p class="text-xs text-[#7D5A36]/70 mb-3">{{ $t('settings.addQuoteHint') }}</p>

              <!-- Add Quote Form -->
              <div v-if="showAddQuoteForm" class="mb-4 p-4 bg-[#FAF3E0]/50 rounded-lg space-y-3">
                <div>
                  <label class="block text-sm font-semibold text-[#4E3B2B] mb-1">{{ $t('settings.quoteText') }}</label>
                  <textarea
                    v-model="newQuote.text"
                    :placeholder="$t('settings.quoteTextPlaceholder')"
                    class="w-full px-3 py-2 glass-effect text-[#4E3B2B] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#7D5A36]"
                    rows="3"
                  ></textarea>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-[#4E3B2B] mb-1">{{ $t('settings.author') }}</label>
                  <input
                    v-model="newQuote.author"
                    type="text"
                    :placeholder="$t('settings.authorPlaceholder')"
                    class="w-full px-3 py-2 glass-effect text-[#4E3B2B] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7D5A36]"
                  >
                </div>
                <div class="flex justify-end gap-2">
                  <button
                    @click="showAddQuoteForm = false; newQuote = { text: '', author: '' }"
                    class="px-4 py-2 bg-[#D3C9A6]/30 text-[#4E3B2B] rounded-lg text-sm font-semibold hover:bg-[#D3C9A6]/50 transition-all"
                  >
                    {{ $t('common.cancel') }}
                  </button>
                  <button
                    @click="addCustomQuote"
                    :disabled="!newQuote.text.trim()"
                    class="px-4 py-2 bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white rounded-lg text-sm font-semibold hover-lift transition-all warm-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ $t('settings.saveQuote') }}
                  </button>
                </div>
              </div>

              <!-- Custom Quotes List -->
              <div v-if="customQuotes.length > 0" class="space-y-2">
                <div
                  v-for="(quote, index) in customQuotes"
                  :key="index"
                  class="p-3 bg-white/50 rounded-lg flex items-start justify-between gap-3 group hover:bg-white/70 transition-all"
                >
                  <div class="flex-1">
                    <p class="text-sm text-[#4E3B2B] italic">"{{ quote.text }}"</p>
                    <p v-if="quote.author" class="text-xs text-[#7D5A36]/70 mt-1">— {{ quote.author }}</p>
                  </div>
                  <button
                    @click="removeCustomQuote(index)"
                    class="flex-shrink-0 text-[#7D5A36]/60 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    :title="$t('common.delete')"
                  >
                    <X :size="16" />
                  </button>
                </div>
              </div>
              <div v-else class="text-sm text-[#7D5A36]/60 text-center py-4">
                {{ $t('settings.noQuotesYet') }}
              </div>
            </div>

            <!-- Quote Statistics -->
            <div class="p-4 glass-effect rounded-xl">
              <p class="font-semibold text-[#4E3B2B] mb-2">{{ $t('settings.quoteStats') }}</p>
              <div class="text-center">
                <p class="text-3xl font-bold text-[#7D5A36]">{{ customQuotes.length }}</p>
                <p class="text-sm text-[#7D5A36]/70 mt-1">{{ $t('settings.customQuotesInLibrary') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- About Section -->
        <div class="glass-effect p-6 rounded-2xl warm-shadow-lg">
          <h2 class="text-xl font-bold text-[#4E3B2B] mb-4 flex items-center">
            <span class="mr-2">ℹ️</span>
            {{ $t('settings.about') }}
          </h2>
          <div class="space-y-2 text-sm text-[#7D5A36]">
            <p><strong>{{ $t('settings.version') }}:</strong> 1.0.0</p>
            <p><strong>{{ $t('settings.build') }}:</strong> 2025.10.19</p>
            <p class="pt-2 text-xs">
              {{ $t('settings.aboutDesc') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  List,
  BarChart3,
  Calendar,
  BookOpen,
  Search,
  Download,
  Settings,
  X,
  Sun,
  Moon,
  Monitor,
  Check
} from 'lucide-vue-next'
import { useTheme, type Theme } from '@/composables/useTheme'
import localforage from 'localforage'

const router = useRouter()
const { locale, t } = useI18n()
const { currentTheme, themes, setTheme } = useTheme()

interface ThemeCard {
  key: Theme
  icon: any
  title: string
  subtitle: string
  description: string
  previewGradient: string
  surfaceColor: string
  primaryBarColor: string
  accentColor: string
  textColor: string
  textMutedColor: string
}

const themeCards = computed<ThemeCard[]>(() => {
  const base = [
    {
      key: 'light' as Theme,
      icon: Sun,
      titleKey: 'settings.themeOptions.light.title',
      subtitleKey: 'settings.themeOptions.light.subtitle',
      descriptionKey: 'settings.themeOptions.light.description'
    },
    {
      key: 'dark' as Theme,
      icon: Moon,
      titleKey: 'settings.themeOptions.dark.title',
      subtitleKey: 'settings.themeOptions.dark.subtitle',
      descriptionKey: 'settings.themeOptions.dark.description'
    },
    {
      key: 'auto' as Theme,
      icon: Monitor,
      titleKey: 'settings.themeOptions.auto.title',
      subtitleKey: 'settings.themeOptions.auto.subtitle',
      descriptionKey: 'settings.themeOptions.auto.description'
    }
  ] as const

  return base.map((entry) => {
    const palette = themes[entry.key]

    return {
      key: entry.key,
      icon: entry.icon,
      title: t(entry.titleKey),
      subtitle: t(entry.subtitleKey),
      description: t(entry.descriptionKey),
      previewGradient: `linear-gradient(135deg, ${palette.colors.background}, ${palette.colors.surface})`,
      surfaceColor: palette.colors.surface,
      primaryBarColor: palette.colors.primary,
      accentColor: palette.colors.accent,
      textColor: palette.colors.text,
      textMutedColor: palette.colors.textSecondary
    }
  })
})

// Language settings
const currentLanguage = ref('en')

const setLanguage = async (lang: 'en' | 'zh') => {
  currentLanguage.value = lang
  locale.value = lang // Update i18n locale
  await localforage.setItem('settings:language', lang)
}

// Quote settings
const customQuotes = ref<Array<{ text: string; author: string }>>([])
const showAddQuoteForm = ref(false)
const newQuote = ref({ text: '', author: '' })

const addCustomQuote = async () => {
  if (newQuote.value.text.trim()) {
    customQuotes.value.push({
      text: newQuote.value.text.trim(),
      author: newQuote.value.author.trim()
    })
    await localforage.setItem('settings:customQuotes', customQuotes.value)
    newQuote.value = { text: '', author: '' }
    showAddQuoteForm.value = false
  }
}

const removeCustomQuote = async (index: number) => {
  customQuotes.value.splice(index, 1)
  await localforage.setItem('settings:customQuotes', customQuotes.value)
}

// Navigation helpers
const openCalendar = () => {
  router.push({ path: '/', query: { openCalendar: 'true' } })
}

const openHabits = () => {
  router.push({ path: '/', query: { openHabits: 'true' } })
}

// Load settings on mount
onMounted(async () => {
  const savedLanguage = await localforage.getItem('settings:language') as string | null
  if (savedLanguage) {
    currentLanguage.value = savedLanguage
    locale.value = savedLanguage // Update i18n locale
  }

  const savedCustomQuotes = await localforage.getItem('settings:customQuotes') as Array<{ text: string; author: string }> | null
  if (savedCustomQuotes) {
    customQuotes.value = savedCustomQuotes
  }
})
</script>

<style scoped>
/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(212, 165, 116, 0.1);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(125, 90, 54, 0.3);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(125, 90, 54, 0.5);
}
</style>
