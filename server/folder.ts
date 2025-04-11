import { join } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'

// Define the default path (e.g., a "notes" folder in your project directory)
const defaultNotesPath = join(process.cwd(), 'notes')
const defaultUploadsPath = join(process.cwd(), 'uploads')

// Get the environment variable value (if any)
const envNotesPath = process.env.NOTES_PATH
const envUploadsPath = process.env.UPLOAD_PATH

// Use the env variable if it's provided and the directory exists,
// otherwise fall back to the default path.
const notesPath = envNotesPath && existsSync(envNotesPath) ? envNotesPath : defaultNotesPath
const uploadPath = envUploadsPath && existsSync(envUploadsPath) ? envUploadsPath : defaultUploadsPath

try {
  // Ensure directories exist
  if (!existsSync(notesPath)) {
    mkdirSync(notesPath, { recursive: true })
  }

  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true })
  }
} catch (error) {
  console.log('Unable to create folders')
  console.log(error)
}

export { notesPath, uploadPath, envNotesPath, envUploadsPath }
