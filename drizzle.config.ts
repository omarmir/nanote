import { defineConfig } from 'drizzle-kit'
import { dbPath } from './server/folder'

export default defineConfig({
  dialect: 'sqlite',
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  dbCredentials: {
    url: dbPath!
  }
})
