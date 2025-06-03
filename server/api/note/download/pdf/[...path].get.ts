// import { sendStream, setHeaders } from 'h3'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import contentDisposition from 'content-disposition'
import { defineEventHandlerWithNotebookAndNote } from '~/server/wrappers/note'
import { customAlphabet } from 'nanoid'
import { unlink } from 'node:fs/promises'
import jwt from 'jsonwebtoken'
import SECRET_KEY from '~/server/key'
import { convertMarkdownToHtml } from '~/server/utils/html-gen'
import { blockRegex } from 'milkdown-plugin-file/regex'
import puppeteer from 'puppeteer'
import { tempPath } from '~/server/folder'
import { join } from 'node:path'

const _deletePDF = async (pdfPath: string) => {
  // Wait 1 minute (60,000 milliseconds)
  await new Promise((resolve) => setTimeout(resolve, 60000))

  try {
    if (existsSync(pdfPath)) await unlink(pdfPath)
  } catch (error) {
    console.error(`Error deleting file ${pdfPath}:`, error)
  }
}

const printPDF = async (html: string) => {
  const browser = await puppeteer.launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    await page.screenshot({ path: '/tmp/puppeteer-debug.png', fullPage: true })
    const pdf = await page.pdf({ format: 'A4' })

    await browser.close()
    return pdf
  } catch {
    await browser.close()
  }
}

const appendTokenToUrl = (url: string, origin: string) => {
  const fileName = url.split('/').at(-1)
  const token = jwt.sign({ sub: fileName, exp: Math.floor(Date.now() / 1000) + 60 * 5 }, SECRET_KEY) // expires in 5 mins
  if (url.includes('?')) {
    return `${origin}${url}&token=${token}`
  } else {
    return `${origin}${url}?token=${token}`
  }
}

export default defineEventHandlerWithNotebookAndNote(
  async (event, _cleanNotebook, cleanNote, fullPath): Promise<Uint8Array<ArrayBufferLike> | undefined> => {
    const { origin } = getRequestURL(event)

    const nanoid = customAlphabet('abcdefghijklmnop')

    const content = readFileSync(fullPath, 'utf8')
    // const urlRegex = /(?<=\()\/?api\/attachment\/[^\s"')]+(?=\))|(?<=href=")\/api\/attachment\/[^\s"')]+/g
    const urlRegex = /(?<=\()\/?api\/attachment\/[^\s"')]+(?=\))/g // only for images since files wouldn't work anyway

    let newContent = ''
    newContent = content.replace(urlRegex, (matchedUrl) => {
      const newUrlWithToken = appendTokenToUrl(matchedUrl, origin)
      return newUrlWithToken
    })

    newContent = newContent.replace(blockRegex, (match, _hrefGroup, _titleGroup, _offset, _originalString, groups) => {
      // The `groups` object (the last argument) contains the named capture groups.
      // groups.title should contain the content of the title attribute.
      const title = groups?.title ?? 'N/A'
      if (title) {
        return `File: [${title.trim()}]` // .trim() to remove any potential leading/trailing spaces within the quotes
      }
      return match // Fallback: if title is not captured for some reason, return the original match.
    })

    const htmlContent: string = await convertMarkdownToHtml(newContent)
    const tempNotePath = join(tempPath, `${nanoid()}_${cleanNote}.html`)
    writeFileSync(tempNotePath, htmlContent, 'utf8')

    // Schedule the PDF deletion as soon as the path is known.
    // This ensures cleanup is attempted even if subsequent stream/send operations fail.
    // event.waitUntil(deletePDF(pdfPath))

    console.log(htmlContent)

    const pdf = await printPDF(htmlContent)

    // return htmlContent

    // // Set appropriate headers
    setHeaders(event, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': contentDisposition(`${cleanNote}.pdf`, { type: 'attachment' }),
      'Cache-Control': 'no-cache'
    })

    // // Return file stream
    return pdf
  }
)
