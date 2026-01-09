export const getFileNameAndExtension = (filename: string) => {
  if (typeof filename !== 'string') {
    return { name: '', extension: '' } // Or throw an error, or return null
  }

  let name = filename // Default name is the full string
  let extension = '' // Default extension is empty

  const lastDotIndex = filename.lastIndexOf('.')

  // A dot exists and it's not the very first character (unless it's the only char like ".")
  // AND it's not the very last character of the string.
  if (lastDotIndex > -1 && lastDotIndex < filename.length - 1) {
    // This condition handles:
    // 1. Standard files: "file.txt" (lastDotIndex > 0)
    //    name = "file", extension = "txt"
    // 2. Hidden files with extensions: ".config.json" (lastDotIndex > 0)
    //    name = ".config", extension = "json"
    // 3. Hidden files treated as extensions: ".bashrc" (lastDotIndex == 0)
    //    name = "", extension = "bashrc"
    name = filename.substring(0, lastDotIndex)
    extension = filename.substring(lastDotIndex + 1)
  } else if (lastDotIndex > -1 && lastDotIndex === filename.length - 1 && filename.length > 1) {
    // Handles filenames ending with a dot, but are not just "."
    // e.g., "archive."
    // name = "archive", extension = ""
    name = filename.substring(0, lastDotIndex)
    // extension remains ""
  }
  // Other cases not explicitly handled by the 'if' or 'else if':
  // 1. No dot: "myfile" -> name = "myfile", extension = "" (defaults are correct)
  // 2. Just a dot: "." -> name = ".", extension = "" (defaults are correct)
  // 3. Empty string: "" -> name = "", extension = "" (defaults are correct)

  return { name, extension }
}
