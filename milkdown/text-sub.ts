import type { MilkdownPlugin } from '@milkdown/kit/ctx'
import { $inputRule } from '@milkdown/kit/utils'
import { InputRule } from '@milkdown/prose/inputrules'
export const today = /::today/
export const now = /::now/
export const timeNow = /::time/
export const yesterday = /::yesterday/
export const tomorrow = /::tomorrow/

export const todayInputRule = $inputRule(
  (_ctx) =>
    new InputRule(today, (state, _match, start, end) => {
      const currentDate = new Date().toLocaleDateString()
      const { tr } = state
      tr.deleteRange(start, end)
      tr.insertText(currentDate)
      return tr
    })
)

export const nowInputRule = $inputRule(
  (_ctx) =>
    new InputRule(now, (state, _match, start, end) => {
      const currentDate = new Date().toLocaleString()
      const { tr } = state
      tr.deleteRange(start, end)
      tr.insertText(currentDate)
      return tr
    })
)
export const timeNowInputRule = $inputRule(
  (_ctx) =>
    new InputRule(timeNow, (state, _match, start, end) => {
      const currentDate = new Date().toLocaleTimeString()
      const { tr } = state
      tr.deleteRange(start, end)
      tr.insertText(currentDate)
      return tr
    })
)
export const yesterdayInputRule = $inputRule(
  (_ctx) =>
    new InputRule(yesterday, (state, _match, start, end) => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      const currentDate = date.toLocaleDateString()
      const { tr } = state
      tr.deleteRange(start, end)
      tr.insertText(currentDate)
      return tr
    })
)

export const tomorrowInputRule = $inputRule(
  (_ctx) =>
    new InputRule(tomorrow, (state, _match, start, end) => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      const currentDate = date.toLocaleDateString()
      const { tr } = state
      tr.deleteRange(start, end)
      tr.insertText(currentDate)
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
