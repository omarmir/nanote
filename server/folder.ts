import { join } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'

// Define the default path (e.g., a "notes" folder in your project directory)
const defaultNotesPath = join(process.cwd(), 'notes')
const defaultUploadsPath = join(process.cwd(), 'uploads')
const defaultConfigPath = join(process.cwd(), 'config')
// Get the environment variable value (if any)
const envNotesPath = process.env.NOTES_PATH
const envUploadsPath = process.env.UPLOAD_PATH
const envConfigPath = process.env.CONFIG_PATH

// Use the env variable if it's provided and the directory exists,
// otherwise fall back to the default path.
const notesPath = envNotesPath && existsSync(envNotesPath) ? envNotesPath : defaultNotesPath
const uploadPath = envUploadsPath && existsSync(envUploadsPath) ? envUploadsPath : defaultUploadsPath
const configPath = envConfigPath && existsSync(envConfigPath) ? envConfigPath : defaultConfigPath

try {
  // Ensure directories exist
  if (!existsSync(notesPath)) {
    mkdirSync(notesPath, { recursive: true })
  }

  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true })
  }

  if (!existsSync(configPath)) {
    mkdirSync(configPath, { recursive: true })
  }
} catch (error) {
  console.log('Unable to create folders')
  console.log(error)
}

const dbSystemPath = join(configPath, 'data.db')
const dbPath = `file:${dbSystemPath}`

export { notesPath, uploadPath, envNotesPath, envUploadsPath, envConfigPath, configPath, dbPath, dbSystemPath }
