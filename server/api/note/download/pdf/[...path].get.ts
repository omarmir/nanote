// import { sendStream, setHeaders } from 'h3'
import { readFileSync, writeFileSync } from 'node:fs'
import contentDisposition from 'content-disposition'
import { defineEventHandlerWithNotebookAndNote } from '~/server/wrappers/note'
import { customAlphabet } from 'nanoid'
import { appendTokenToUrl, convertMarkdownToHtml } from '~/server/utils/html-gen'
import { blockRegex, regex as inlineRegex } from 'milkdown-plugin-file/regex'
import puppeteer from 'puppeteer'
import { tempPath } from '~/server/folder'
import { join } from 'node:path'
import { getIcon } from 'material-file-icons'
import { settings } from '~/server/db/schema'

const printPDF = async (html: string) => {
  const browser = await puppeteer.launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    await page.addStyleTag({ content: 'img {max-width: 100%;} html { margin: 2rem; font-family: sans-serif; }' })

    const paraSpacing = await db.query.settings.findFirst({
      where: eq(settings.setting, 'isParagraphSpaced')
    })
    if (paraSpacing?.value === 'true') {
      await page.addStyleTag({ content: 'p {padding-bottom: 0.25rem}' })
    }

    const pdf = await page.pdf({ format: 'A4' })

    await browser.close()
    return pdf
  } catch (error) {
    console.log(error)
    await browser.close()
  }
}

const replaceFileContent = (htmlContent: string, regex: RegExp) => {
  htmlContent = htmlContent.replace(regex, (match, _hrefGroup, _titleGroup, _offset, _originalString, groups) => {
    // The `groups` object (the last argument) contains the named capture groups.
    // groups.title should contain the content of the title attribute.
    const title = groups?.title ?? 'N/A'
    const icon = getIcon(title)
    if (title) {
      return `
            <span style="display:flex; flex-direction: row; align-items: center; gap: 0.25rem">
              File: [<span style="width: 1rem; height: 1rem">${icon.svg}</span> ${title.trim()}]
            </span>
            ` // .trim() to remove any potential leading/trailing spaces within the quotes
    }
    return match // Fallback: if title is not captured for some reason, return the original match.
  })
  return htmlContent
}

export default defineEventHandlerWithNotebookAndNote(
  async (event, _cleanNotebook, cleanNote, fullPath): Promise<Uint8Array<ArrayBufferLike> | undefined> => {
    const { origin } = getRequestURL(event)

    const nanoid = customAlphabet('abcdefghijklmnop')

    const content = readFileSync(fullPath, 'utf8')
    // const urlRegex = /(?<=\()\/?api\/attachment\/[^\s"')]+(?=\))/g // only for images since files wouldn't work anyway
    const urlRegex = /(?<=\(<|\()\/api\/attachment\/.*?(?=[)>])/g

    let newContent = ''
    newContent = content.replace(urlRegex, (matchedUrl) => {
      const newUrlWithToken = appendTokenToUrl(matchedUrl, origin)
      return newUrlWithToken
    })

    let htmlContent: string = await convertMarkdownToHtml(newContent)
    htmlContent = replaceFileContent(htmlContent, blockRegex)
    htmlContent = replaceFileContent(htmlContent, inlineRegex)

    const tempNotePath = join(tempPath, `${nanoid()}_${cleanNote}.html`)
    writeFileSync(tempNotePath, htmlContent, 'utf8')

    const pdf = await printPDF(htmlContent)

    // Set appropriate headers
    setHeaders(event, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': contentDisposition(`${cleanNote}.pdf`, { type: 'attachment' }),
      'Cache-Control': 'no-cache'
    })

    return pdf
  }
)
