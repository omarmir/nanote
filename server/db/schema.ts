import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  setting: text('setting').notNull().unique(),
  value: text('value').notNull()
})

export type SelectSetting = InferSelectModel<typeof settings>
export type InsertSetting = InferInsertModel<typeof settings>
