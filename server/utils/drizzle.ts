import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '~/server/db/schema'
import { dbPath } from '~/server/folder'

export const tables = schema

export const db = drizzle(dbPath, { schema })

export type Settings = typeof schema.settings.$inferSelect
export { sql, eq, and, or } from 'drizzle-orm'
