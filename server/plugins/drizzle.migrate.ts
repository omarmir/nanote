// server/plugins/drizzle.migrate.ts
import { migrate } from 'drizzle-orm/libsql/migrator' // Or your SQLite driver's migrator
import { access, constants } from 'node:fs/promises'
import { dbSystemPath } from '~~/server/folder'
import { db } from '~~/server/utils/drizzle'
import { createError } from 'h3' // ← This import is mandatory

export default defineNitroPlugin(async (app) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Skipping automatic migrations in development mode.')
    return
  }

  console.log(`Checking database status for SQLite file at: ${dbSystemPath}`)

  try {
    await access(dbSystemPath, constants.R_OK | constants.W_OK)
  } catch (error) {
    console.error('Database error:', error)

    const err = error as NodeJS.ErrnoException
    const message = err.code === 'ENOENT' ? 'Database does not exist' : 'Database exists but is not accessible'

    console.error(`Failed to access database:`, message)

    const errorObj = createError({
      statusCode: 500,
      statusMessage: `Internal Server Error`,
      message: `Failed to acess database: ${message}. Application cannot start.`
    })

    app.hooks.hook('request', (event) => {
      return sendError(event, errorObj)
    })
  }

  try {
    console.log('Applying database migrations...')
    // 'db' is your Drizzle instance, already connected to the SQLite file.
    // Drizzle's migrate function will create the migrations table if it doesn't exist
    // and apply any pending migrations from the specified folder.
    await migrate(db, { migrationsFolder: 'server/db/migrations' }) // Adjust path if your migrations are elsewhere
    console.log('Database migrations applied successfully.')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('CRITICAL: Database migration failed:', error.message)

    const errorObj = createError({
      statusCode: 500,
      statusMessage: `Internal Server Error`,
      message: `A critical error occurred during database migrations: ${error.message}. Application cannot start.`
    })

    app.hooks.hook('request', (event) => {
      return sendError(event, errorObj)
    })
  }
})
