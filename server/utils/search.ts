export const calculateScore = (queryWords: string[], matchedText: string): number => {
  // Normalize matched text to lowercase words array
  const lowerText = matchedText.toLowerCase()

  const matchedTextWords = splitWords(lowerText)

  // Check if all queryWords appear in order inside matchedTextWords
  function allWordsInOrder(query: string[], textWords: string[]): boolean {
    let qIndex = 0
    for (const word of textWords) {
      if (word === query[qIndex]) {
        qIndex++
        if (qIndex === query.length) return true
      }
    }
    return false
  }

  const matchedWords = queryWords.filter((word) => lowerText.includes(word))

  if (allWordsInOrder(queryWords, matchedTextWords)) {
    return 5
  } else {
    return Math.max(1, Math.floor((matchedWords.length / queryWords.length) * 5))
  }
}

export const splitWords = (text: string): string[] => {
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' })
  return Array.from(segmenter.segment(text))
    .map((segment) => segment.segment)
    .filter((word) => /\p{L}|\p{N}/u.test(word)) // letters/numbers
    .map((word) => word.toLowerCase())
}
