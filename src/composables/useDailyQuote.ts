import { ref, computed } from 'vue'
import quotesJson from '@/assets/quotes.json'

export interface DailyQuote {
  text: string
  author: string
}

interface StoredQuotePayload {
  date: string
  quote: DailyQuote
}

const STORAGE_KEY = 'moodnotes.dailyQuote'

const getTodayKey = () => new Date().toISOString().split('T')[0]

const localQuotes = quotesJson as DailyQuote[]

const pickLocalQuote = (): DailyQuote => {
  const index = Math.floor(Math.random() * localQuotes.length)
  return localQuotes[index]
}

const fetchQuoteFromAPI = async (): Promise<DailyQuote | null> => {
  // Placeholder for future external API integration.
  // Return null so the local fallback is used until the API is ready.
  return null
}

export function useDailyQuote() {
  const quote = ref<DailyQuote | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const hydrateFromStorage = () => {
    if (typeof window === 'undefined') return

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return

      const stored: StoredQuotePayload = JSON.parse(raw)
      if (stored.date === getTodayKey()) {
        quote.value = stored.quote
      }
    } catch (err) {
      console.warn('[useDailyQuote] Failed to restore cached quote', err)
    }
  }

  const persistQuote = (value: DailyQuote) => {
    if (typeof window === 'undefined') return

    const payload: StoredQuotePayload = {
      date: getTodayKey(),
      quote: value
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (err) {
      console.warn('[useDailyQuote] Failed to cache quote', err)
    }
  }

  const loadQuote = async (options: { forceRefresh?: boolean } = {}) => {
    if (quote.value && !options.forceRefresh) {
      return
    }

    hydrateFromStorage()
    if (quote.value && !options.forceRefresh) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const remoteQuote = await fetchQuoteFromAPI()
      if (remoteQuote) {
        quote.value = remoteQuote
        persistQuote(remoteQuote)
        return
      }

      const localQuote = pickLocalQuote()
      quote.value = localQuote
      persistQuote(localQuote)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load quote'
      const fallbackQuote = pickLocalQuote()
      quote.value = fallbackQuote
    } finally {
      isLoading.value = false
    }
  }

  const refreshQuote = async () => {
    // Force a new quote from the local pool for manual refresh scenarios.
    await loadQuote({ forceRefresh: true })
  }

  const quoteText = computed(() => quote.value?.text ?? '')
  const quoteAuthor = computed(() => quote.value?.author ?? '')

  return {
    quote,
    quoteText,
    quoteAuthor,
    isLoading,
    error,
    initializeQuote: loadQuote,
    refreshQuote
  }
}
