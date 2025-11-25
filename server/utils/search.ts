export const splitWords = (text: string): string[] => {
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' })
  return Array.from(segmenter.segment(text))
    .map((segment) => segment.segment)
    .filter((word) => /\p{L}|\p{N}/u.test(word)) // letters/numbers
    .map((word) => word.toLowerCase())
}

export const proximityScore = (queryWords: string[], line: string): number => {
  const positions: number[] = []
  for (const word of queryWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    const match = regex.exec(line)
    if (match) positions.push(match.index)
    else return 0 // word not found, shouldn't happen with --and
  }
  if (positions.length < 2) return 1
  positions.sort((a, b) => a - b)
  // Smaller span = higher score
  return 1 / (positions[positions.length - 1] - positions[0] + 1)
}

export const matchScore2 = (queryWords: string[], line: string): number => {
  if (queryWords.length === 0) {
    return 0 // No query words, no score.
  }

  type MatchInfo = {
    word: string // The original query word
    matchedText: string // The actual text matched in the line
    index: number // Start index of the match
    order: number // Original order in queryWords
    isExactWordMatch: boolean // Was it a whole word match?
  }

  const matchesInfo: MatchInfo[] = []
  let allWordsFound = true

  // Step 1: Find all occurrences and record detailed match info
  for (let i = 0; i < queryWords.length; i++) {
    const word = queryWords[i]
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Attempt for exact whole word match first
    const wholeWordRegex = new RegExp(`\\b${escapedWord}\\b`, 'i')
    let match = wholeWordRegex.exec(line)

    let isExactWordMatch = false
    if (match) {
      isExactWordMatch = true
    } else {
      // If no whole word match, try for substring match
      const substringRegex = new RegExp(escapedWord, 'i')
      match = substringRegex.exec(line)
    }

    if (match) {
      matchesInfo.push({
        word: word,
        matchedText: match[0], // The actual matched substring
        index: match.index,
        order: i,
        isExactWordMatch: isExactWordMatch
      })
    } else {
      allWordsFound = false
      break // At least one word is not found, score is 0.
    }
  }

  if (!allWordsFound) {
    return 0 // Not all query words were found
  }

  // Handle single word query (if found, it's perfect)
  if (queryWords.length === 1) {
    // If the single word was an exact word match, it's 100
    // Otherwise, if it was just a substring, it's less
    return matchesInfo[0].isExactWordMatch ? 100 : 70 // 70 for substring single word
  }

  // --- Scoring Logic ---
  let score = 0

  // Component 1: Base score for all words being present (e.g., 20 points)
  score += 20

  // Component 2: Individual Word Match Quality Bonus (up to 40 points)
  let wordMatchQualityPoints = 0
  matchesInfo.forEach((match) => {
    if (match.isExactWordMatch) {
      wordMatchQualityPoints += 40 / queryWords.length // More points for exact word match
    } else {
      // If it's a substring match but not an exact word match
      wordMatchQualityPoints += 20 / queryWords.length // Fewer points for substring match
    }
  })
  score += wordMatchQualityPoints

  // Component 3: Order Bonus (up to 20 points)
  // Sort matches by their position in the line to check order and calculate span
  matchesInfo.sort((a, b) => a.index - b.index)

  let inCorrectOrder = true
  for (let i = 0; i < matchesInfo.length - 1; i++) {
    if (matchesInfo[i].order > matchesInfo[i + 1].order) {
      inCorrectOrder = false
      break
    }
  }

  if (inCorrectOrder) {
    score += 20 // Bonus for correct order
  }

  // Component 4: Proximity/Density Penalty (up to 20 points)
  const firstMatchIndex = matchesInfo[0].index
  const lastMatchIndex = matchesInfo[matchesInfo.length - 1].index
  const span = lastMatchIndex - firstMatchIndex

  const lineLength = line.length
  const normalizedSpan = span / Math.max(1, lineLength) // Normalize to [0, 1]

  // INCREASED PENALTY HERE: Increased proximityPower from 2 to 4
  const proximityPower = 20 // Tune this: 1 for linear, 2 for quadratic decay, 4 for steeper
  const proximityBonus = 20 * Math.pow(1 - normalizedSpan, proximityPower)
  score += proximityBonus

  // Final clamping and rounding
  return Math.max(0, Math.min(100, Math.round(score)))
}

export const matchScore = (queryWords: string[], line: string): number => {
  if (queryWords.length === 0) {
    return 0 // No query words, no score.
  }

  type MatchInfo = {
    word: string // The original query word
    matchedText: string // The actual text matched in the line
    index: number // Start index of the match
    order: number // Original order in queryWords
    isExactWordMatch: boolean // Was it a whole word match?
  }

  const matchesInfo: MatchInfo[] = []
  let allWordsFound = true

  // Step 1: Find all occurrences and record detailed match info
  for (let i = 0; i < queryWords.length; i++) {
    const word = queryWords[i]
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Attempt for exact whole word match first
    const wholeWordRegex = new RegExp(`\\b${escapedWord}\\b`, 'i')
    let match = wholeWordRegex.exec(line)

    let isExactWordMatch = false
    if (match) {
      isExactWordMatch = true
    } else {
      // If no whole word match, try for substring match
      const substringRegex = new RegExp(escapedWord, 'i')
      match = substringRegex.exec(line)
    }

    if (match) {
      matchesInfo.push({
        word: word,
        matchedText: match[0], // The actual matched substring
        index: match.index,
        order: i,
        isExactWordMatch: isExactWordMatch
      })
    } else {
      allWordsFound = false
      break // At least one word is not found, score is 0.
    }
  }

  if (!allWordsFound) {
    return 0 // Not all query words were found
  }

  // Handle single word query (if found, it's perfect)
  if (queryWords.length === 1) {
    // If the single word was an exact word match, it's 100
    // Otherwise, if it was just a substring, it's less
    return matchesInfo[0].isExactWordMatch ? 100 : 70 // 70 for substring single word
  }

  // --- Scoring Logic ---
  let score = 0

  // Component 1: Base score for all words being present (20 points)
  score += 20

  // Component 2: Individual Word Match Quality Bonus (up to 40 points)
  let wordMatchQualityPoints = 0
  matchesInfo.forEach((match) => {
    if (match.isExactWordMatch) {
      wordMatchQualityPoints += 40 / queryWords.length // More points for exact word match
    } else {
      // If it's a substring match but not an exact word match
      wordMatchQualityPoints += 20 / queryWords.length // Fewer points for substring match
    }
  })
  score += wordMatchQualityPoints

  // Component 3: Order Bonus (up to 20 points)
  // Sort matches by their position in the line to check order and calculate span
  matchesInfo.sort((a, b) => a.index - b.index)

  let inCorrectOrder = true
  for (let i = 0; i < matchesInfo.length - 1; i++) {
    if (matchesInfo[i].order > matchesInfo[i + 1].order) {
      inCorrectOrder = false
      break
    }
  }

  if (inCorrectOrder) {
    score += 20 // Bonus for correct order
  }

  // Component 4: NEW PROXIMITY LOGIC (up to 20 points)
  const firstMatchIndex = matchesInfo[0].index
  const lastMatchInfo = matchesInfo[matchesInfo.length - 1] // Get info about the last matched word

  // Calculate the actual length occupied by the matched phrase from start of first to end of last
  const actualOccupiedLength = lastMatchInfo.index + lastMatchInfo.matchedText.length - firstMatchIndex

  // Calculate the minimum possible length if words were perfectly packed with single spaces
  let minimumRequiredLength = 0
  matchesInfo.forEach((match, index) => {
    minimumRequiredLength += match.matchedText.length
    if (index < matchesInfo.length - 1) {
      minimumRequiredLength += 1 // Add 1 for the mandatory space between words
    }
  })

  // Calculate the "excess" spread beyond the minimum required
  let excessSpread = actualOccupiedLength - minimumRequiredLength
  excessSpread = Math.max(0, excessSpread) // Ensure it's not negative

  let proximityBonus = 0
  const maxProximityPoints = 20 // Max points this component can contribute

  if (excessSpread === 0) {
    proximityBonus = maxProximityPoints // Perfect packing, full bonus
  } else {
    // Normalize excessSpread against the actual occupied length for context
    // A larger actualOccupiedLength for the same excessSpread might be less penalized
    const normalizedExcessSpread = excessSpread / actualOccupiedLength

    // Use a power to control the decay of the penalty
    const proximityPower = 2 // Tune this: 1 for linear, 2 for quadratic decay, etc. Higher = steeper penalty

    proximityBonus = maxProximityPoints * Math.pow(1 - normalizedExcessSpread, proximityPower)
  }

  score += Math.max(0, proximityBonus) // Ensure non-negative bonus

  // Final clamping and rounding
  return Math.max(0, Math.min(100, Math.round(score)))
}
