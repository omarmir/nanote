import { DatabaseSync } from 'node:sqlite'
export default defineNitroPlugin(() => {
  const database = new DatabaseSync('./data.db')

  const initDatabase = /* sql */ `
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
  );
  `

  database.exec(initDatabase)
})
