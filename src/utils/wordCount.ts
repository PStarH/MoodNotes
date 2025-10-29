/**
 * Utility function to count words in text that handles both English and Chinese
 * 
 * For English: counts words separated by spaces
 * For Chinese: counts individual characters (excluding whitespace and punctuation)
 * For mixed content: counts both appropriately
 */

/**
 * Count words/characters in plain text
 * @param text - Plain text string (not HTML)
 * @returns Number of words/characters
 */
export function countWords(text: string): number {
    if (!text || text.trim().length === 0) return 0

    // Remove extra whitespace
    const cleanText = text.trim()

    // Count Chinese/Japanese/Korean characters (CJK Unified Ideographs and related blocks)
    // Unicode ranges for CJK characters:
    // - 4E00-9FFF: CJK Unified Ideographs
    // - 3400-4DBF: CJK Unified Ideographs Extension A
    // - F900-FAFF: CJK Compatibility Ideographs
    // - 3040-309F: Hiragana
    // - 30A0-30FF: Katakana
    const cjkRegex = /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\u3040-\u309F\u30A0-\u30FF]/g
    const cjkMatches = cleanText.match(cjkRegex)
    const cjkCount = cjkMatches ? cjkMatches.length : 0

    // Remove CJK characters and count English words
    const textWithoutCJK = cleanText.replace(cjkRegex, ' ')
    const englishWords = textWithoutCJK
        .split(/\s+/)
        .filter(word => {
            // Filter out empty strings and non-word characters
            const trimmed = word.trim()
            return trimmed.length > 0 && /\w/.test(trimmed)
        })
        .length

    // Total count is CJK characters + English words
    return cjkCount + englishWords
}

/**
 * Count words/characters in HTML content
 * Strips HTML tags first, then counts words
 * @param html - HTML string
 * @returns Number of words/characters
 */
export function countWordsInHtml(html: string): number {
    if (!html) return 0

    // Use DOMParser for better performance and security
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const text = doc.body.textContent || doc.body.innerText || ''

    return countWords(text)
}
