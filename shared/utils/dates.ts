export const formatNoteDate = (dateStr: string, isISODate: boolean) => {
  const { date, time } = getSplitISO(dateStr, isISODate)
  return `${date} @ ${time}`
}

export const getSplitISO = (dateStr: string, isISODate: boolean): { date: string, time: string } => {
  const date = new Date(dateStr)
  if (isISODate) {
    const [isoDate, isoTime] = date.toISOString().split('T')
    return {
      date: isoDate as string,
      time: isoTime?.split('.')[0] as string
    }
  } else {
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    }
  }
}
