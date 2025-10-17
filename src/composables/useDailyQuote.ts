import { ref, computed } from 'vue'
import quotesJson from '@/assets/quotes.json'

export interface DailyQuote {
  text: string
  author: string
}

export type QuoteSource = 'cache' | 'remote' | 'local' | 'fallback' | 'unknown'

export interface UseDailyQuoteOptions {
  /**
   * Optional storage key override. Useful when scoping quotes per profile.
   */
  storageKey?: string
  /**
   * Cache lifetime in milliseconds. Defaults to 24 hours.
   */
  cacheWindowMs?: number
  /**
   * Optional async fetcher for remote quotes. Return null to fall back to the local pool.
   */
  fetcher?: () => Promise<DailyQuote | null>
}

interface StoredQuotePayload {
  quote: DailyQuote
  cachedAt: string
  expiresAt: string
  source?: QuoteSource
}

const DEFAULT_STORAGE_KEY = 'moodnotes.dailyQuote'
const DEFAULT_CACHE_WINDOW = 1000 * 60 * 60 * 24 // 24 hours

const localQuotes = quotesJson as DailyQuote[]

const pickLocalQuote = (excludeText?: string): DailyQuote => {
  if (localQuotes.length === 0) {
    return { text: 'Keep writing your story one day at a time.', author: 'MoodNotes' }
  }

  if (localQuotes.length === 1) {
    return localQuotes[0]
  }

  let attempts = 0
  let candidate = localQuotes[Math.floor(Math.random() * localQuotes.length)]

  while (candidate.text === excludeText && attempts < 5) {
    candidate = localQuotes[Math.floor(Math.random() * localQuotes.length)]
    attempts += 1
  }

  return candidate
}

const defaultRemoteFetcher = async (): Promise<DailyQuote | null> => {
  // Placeholder for future external API integration.
  // Return null so the local fallback is used until the API is ready.
  return null
}

const isCacheValid = (payload: StoredQuotePayload, cacheWindow: number) => {
  const expiresAt = new Date(payload.expiresAt).getTime()
  if (Number.isNaN(expiresAt)) return false
  return Date.now() < expiresAt && Date.now() - new Date(payload.cachedAt).getTime() < cacheWindow * 2
}

export function useDailyQuote(options: UseDailyQuoteOptions = {}) {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY
  const cacheWindow = options.cacheWindowMs ?? DEFAULT_CACHE_WINDOW
  const remoteFetcher = options.fetcher ?? defaultRemoteFetcher

  const quote = ref<DailyQuote | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const source = ref<QuoteSource>('unknown')
  const lastUpdatedAt = ref<Date | null>(null)

  const hydrateFromStorage = () => {
    if (typeof window === 'undefined') return

    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) return

      const stored: StoredQuotePayload = JSON.parse(raw)
      if (!isCacheValid(stored, cacheWindow)) {
        window.localStorage.removeItem(storageKey)
        return
      }

      quote.value = stored.quote
      source.value = stored.source ?? 'cache'
      lastUpdatedAt.value = new Date(stored.cachedAt)
    } catch (err) {
      console.warn('[useDailyQuote] Failed to restore cached quote', err)
    }
  }

  const persistQuote = (value: DailyQuote, origin: QuoteSource) => {
    if (typeof window === 'undefined') return

    const cachedAt = new Date()
    const expiresAt = new Date(cachedAt.getTime() + cacheWindow)

    const payload: StoredQuotePayload = {
      quote: value,
      cachedAt: cachedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      source: origin
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(payload))
    } catch (err) {
      console.warn('[useDailyQuote] Failed to cache quote', err)
    }
  }

  const applyQuote = (value: DailyQuote, origin: QuoteSource) => {
    quote.value = value
    source.value = origin
    lastUpdatedAt.value = new Date()
    persistQuote(value, origin)
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
      const remoteQuote = await remoteFetcher()
      if (remoteQuote) {
        applyQuote(remoteQuote, 'remote')
        return
      }

      const localQuote = pickLocalQuote(quote.value?.text)
      applyQuote(localQuote, 'local')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load quote'
      const fallbackQuote = pickLocalQuote(quote.value?.text)
      applyQuote(fallbackQuote, 'fallback')
    } finally {
      isLoading.value = false
    }
  }

  const refreshQuote = async () => {
    await loadQuote({ forceRefresh: true })
  }

  const quoteText = computed(() => quote.value?.text ?? '')
  const quoteAuthor = computed(() => quote.value?.author ?? '')
  const quoteSource = computed(() => source.value)
  const lastUpdated = computed(() => lastUpdatedAt.value)

  return {
    quote,
    quoteText,
    quoteAuthor,
    quoteSource,
    lastUpdated,
    isLoading,
    error,
    initializeQuote: loadQuote,
    refreshQuote
  }
}
