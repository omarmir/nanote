import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '~/server/db/schema'
import { dbPath } from '~/server/folder'

export const tables = schema

export function useDrizzle() {
  return drizzle(dbPath, { schema })
}

export type User = typeof schema.settings.$inferSelect
export { sql, eq, and, or } from 'drizzle-orm'
