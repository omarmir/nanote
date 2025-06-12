export const formatNoteDate = (dateStr: string, isISODate: boolean) => {
  const { date, time } = getSplitISO(dateStr, isISODate)
  return `${date} @ ${time}`
}

export const getSplitISO = (dateStr: string, isISODate: boolean): { date: string; time: string } => {
  const date = new Date(dateStr)
  if (isISODate) {
    const [isoDate, isoTime] = date.toISOString().split('T')
    return {
      date: isoDate,
      time: isoTime.split('.')[0]
    }
  } else {
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    }
  }
}
