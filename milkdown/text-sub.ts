import type { MilkdownPlugin } from '@milkdown/kit/ctx'
import { $inputRule } from '@milkdown/kit/utils'
import { InputRule } from '@milkdown/prose/inputrules'
export const today = /::today/
export const now = /::now/
export const timeNow = /::time/
export const yesterday = /::yesterday/
export const tomorrow = /::tomorrow/

const settingsStore = useSettingsStore()

export const todayInputRule = $inputRule(
  (_ctx) =>
    new InputRule(today, (state, _match, start, end) => {
      const { date } = getSplitISO(new Date().toString(), settingsStore.settings.isISODate)
      const { tr } = state
      tr.deleteRange(start, end)
      tr.insertText(date)
      return tr
    })
)

export const nowInputRule = $inputRule(
  (_ctx) =>
    new InputRule(now, (state, _match, start, end) => {
      const currentDate = formatNoteDate(new Date().toString(), settingsStore.settings.isISODate)
      const { tr } = state
      tr.deleteRange(start, end)
      tr.insertText(currentDate)
      return tr
    })
)
export const timeNowInputRule = $inputRule(
  (_ctx) =>
    new InputRule(timeNow, (state, _match, start, end) => {
      const { time } = getSplitISO(new Date().toString(), settingsStore.settings.isISODate)
      const { tr } = state
      tr.deleteRange(start, end)
      tr.insertText(time)
      return tr
    })
)
export const yesterdayInputRule = $inputRule(
  (_ctx) =>
    new InputRule(yesterday, (state, _match, start, end) => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const { date } = getSplitISO(yesterday.toString(), settingsStore.settings.isISODate)
      const { tr } = state
      tr.deleteRange(start, end)
      tr.insertText(date)
      return tr
    })
)

export const tomorrowInputRule = $inputRule(
  (_ctx) =>
    new InputRule(tomorrow, (state, _match, start, end) => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const { date } = getSplitISO(tomorrow.toString(), settingsStore.settings.isISODate)
      const { tr } = state
      tr.deleteRange(start, end)
      tr.insertText(date)
      return tr
    })
)

export const dateTimeTextSubs: MilkdownPlugin[] = [
  todayInputRule,
  nowInputRule,
  timeNowInputRule,
  yesterdayInputRule,
  tomorrowInputRule
].flat()
