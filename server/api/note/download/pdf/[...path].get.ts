import { sendStream, setHeaders } from 'h3'
import { join } from 'node:path'
import { createReadStream, existsSync } from 'node:fs'
import contentDisposition from 'content-disposition'
import { defineEventHandlerWithNotebookAndNote } from '~/server/wrappers/note'
// @ts-expect-error type error
import { convert } from 'mdpdf'
import { tempPath, defaultPath } from '~/server/folder'
import { customAlphabet } from 'nanoid'
import { unlink } from 'node:fs/promises'

const deletePDF = async (filePath: string) => {
  // Wait 1 minute (60,000 milliseconds)
  await new Promise((resolve) => setTimeout(resolve, 60000))

  try {
    if (existsSync(filePath)) await unlink(filePath)
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error)
  }
}

export default defineEventHandlerWithNotebookAndNote(
  async (event, _cleanNotebook, cleanNote, fullPath): Promise<void> => {
    const stylePath = join(defaultPath, 'public', 'pdf.css')
    const nanoid = customAlphabet('abcdefghijklmnop')

    const options = {
      source: fullPath,
      destination: join(tempPath, `${nanoid()}_${cleanNote}.pdf`),
      styles: stylePath,
      pdf: {
        format: 'A4',
        orientation: 'portrait',
        header: {
          height: '20mm'
        }
      }
    }

    const pdfPath: string = await convert(options)
    // Schedule the PDF deletion as soon as the path is known.
    // This ensures cleanup is attempted even if subsequent stream/send operations fail.
    event.waitUntil(deletePDF(pdfPath))

    // Set appropriate headers
    setHeaders(event, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': contentDisposition(`${cleanNote}.pdf`, { type: 'attachment' }),
      'Cache-Control': 'no-cache'
    })

    // Return file stream
    return sendStream(event, createReadStream(pdfPath))
  }
)
