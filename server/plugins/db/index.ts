import { DatabaseSync } from 'node:sqlite'

export default defineNitroPlugin(() => {
  const database = new DatabaseSync('data.db')

  const initDatabase = /* sql */ `
  CREATE TABLE IF NOT EXISTS settings (
    setting TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL
  );
  `

  try {
    database.exec(initDatabase)
    console.log('Database initialized successfully.')
  } catch (error) {
    console.error('Failed to initialize database:', error)
  }
})
