import { sendStream, setHeaders } from 'h3'
import { join } from 'node:path'
import { createReadStream, existsSync, readFileSync, writeFileSync } from 'node:fs'
import contentDisposition from 'content-disposition'
import { defineEventHandlerWithNotebookAndNote } from '~/server/wrappers/note'
// @ts-expect-error type error
import { convert } from 'mdpdf'
import { defaultPath, tempPath } from '~/server/folder'
import { customAlphabet } from 'nanoid'
import { unlink } from 'node:fs/promises'
import SECRET_KEY from '~/server/key'
import jwt from 'jsonwebtoken'

const deletePDF = async (filePath: string) => {
  // Wait 1 minute (60,000 milliseconds)
  await new Promise((resolve) => setTimeout(resolve, 60000))

  try {
    if (existsSync(filePath)) await unlink(filePath)
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error)
  }
}

const appendTokenToUrl = (url: string) => {
  const token = jwt.sign({ sub: url, exp: Math.floor(Date.now() / 1000) + 60 * 5 }, SECRET_KEY) // expires in 5 mins
  if (url.includes('?')) {
    return `${url}&token=${token}`
  } else {
    return `${url}?token=${token}`
  }
}

export default defineEventHandlerWithNotebookAndNote(
  async (event, _cleanNotebook, cleanNote, fullPath): Promise<void> => {
    // TODO: Find a cleaner way to do this
    const stylePath = import.meta.dev
      ? join(defaultPath, 'public', 'pdf.css')
      : join(defaultPath, '.output', 'public', 'pdf.css')

    const nanoid = customAlphabet('abcdefghijklmnop')

    const content = readFileSync(fullPath, 'utf8')
    // const urlRegex = /(?<=\()\/?api\/attachment\/[^\s"')]+(?=\))|(?<=href=")\/api\/attachment\/[^\s"')]+/g
    const urlRegex = /(?<=\()\/?api\/attachment\/[^\s"')]+(?=\))/g // only for images since files wouldn't work anyway

    const newContent = content.replace(urlRegex, (matchedUrl) => {
      const newUrlWithToken = appendTokenToUrl(matchedUrl)
      return newUrlWithToken
    })

    const tempNotePath = join(tempPath, `${nanoid()}_${cleanNote}`)
    writeFileSync(tempNotePath, newContent, 'utf8')

    const options = {
      source: tempNotePath,
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
