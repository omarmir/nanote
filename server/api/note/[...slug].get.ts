// import { stat } from 'node:fs/promises'

// import { defineEventHandlerWithNotebookAndNote } from '~/server/wrappers/note'

export default defineEventHandler((event) => {
  const { slug } = event.context.params
  return {
    path: slug, // Returns the array of path segments
    fullPath: `/api/${slug.join('/')}`
  }
})

// export default defineEventHandlerWithNotebookAndNote(async (_event, cleanNotebook, cleanNote, fullPath) => {
//   try {
//     // Read file contents and stats
//     const stats = await stat(fullPath)
//     const createdAtTime = stats.birthtime.getTime() !== 0 ? stats.birthtime : stats.ctime

//     return {
//       name: cleanNote,
//       notebook: cleanNotebook,
//       createdAt: createdAtTime.toISOString(),
//       updatedAt: stats.mtime.toISOString(),
//       size: stats.size // Optional: Remove if not needed
//     }
//   } catch (error) {
//     console.error('Error reading note:', error)
//     throw createError({
//       statusCode: 500,
//       statusMessage: 'Internal Server Error',
//       message: 'Failed to retrieve note'
//     })
//   }
// })
