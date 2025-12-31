const { execSync } = require('node:child_process')
const path = require('node:path')
const os = require('node:os')
const fs = require('fs')

// Mock folder
const notesPath = path.resolve('./notes_test')
if (!fs.existsSync(notesPath)) {
  fs.mkdirSync(notesPath, { recursive: true })
}
// Create a file
fs.writeFileSync(path.join(notesPath, 'findme.md'), 'some content')
// Create a folder
const subDir = path.join(notesPath, 'subfolder')
if (!fs.existsSync(subDir)) fs.mkdirSync(subDir)
fs.writeFileSync(path.join(subDir, 'nested.md'), 'nested content')

const platform = os.platform()
const query = 'findme'

console.log('Platform:', platform)
console.log('Searching in:', notesPath)

let command
if (platform === 'win32') {
  console.log('Skipping windows logic test on linux')
} else {
  // shell-escape replacement
  const escape = (args) => {
    return args.map((arg) => `'${arg.replace(/'/g, "'\\''")}'`).join(' ')
  }
  const searchPath = escape([notesPath])
  command = `find ${searchPath} -type d -printf "dir:%p\n" -o -type f -printf "file:%p\n"`
  console.log('Command:', command)

  try {
    const output = execSync(command, { encoding: 'utf-8' })
    console.log('Raw Output:\n', output)

    const lines = output.split('\n').filter((l) => l.trim())
    lines.forEach((line) => {
      // Logic from wrapper
      const [type, full] = line.split(':', 2)
      // Re-simulate loose split if that was the issue? No, explicit 2 limit used in code.

      if (!type || !full) return

      const relativePath = full.replace(notesPath, '').split(/[/\\]/).filter(Boolean)
      const baseName = relativePath[relativePath.length - 1]

      console.log(`Type: ${type}, Full: ${full}, BaseName: ${baseName}`)

      if (baseName.includes(query)) {
        console.log('MATCH FOUND:', baseName)
      }
    })
  } catch (e) {
    console.error(e)
  }
}
