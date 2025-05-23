import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  setting: text('setting').notNull().unique(),
  value: text('value').notNull()
})

export const shared = sqliteTable('shared', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  path: text('path').notNull(),
  key: text('key').notNull(),
  name: text('name'),
  isWriteable: integer('writable', { mode: 'boolean' }).notNull().default(false),
  expiry: integer({ mode: 'timestamp' })
})

export type SelectSetting = InferSelectModel<typeof settings>
export type InsertSetting = InferInsertModel<typeof settings>
export type SelectShared = InferSelectModel<typeof shared>
