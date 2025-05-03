import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('setting').notNull().unique(),
  email: text('value').notNull()
})
