import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'
import { getIcon } from 'material-file-icons'
import puppeteer from 'puppeteer'
import { settings } from '~~/server/db/schema'

export const fullRegex = /(?<=\(<|\()\/api\/attachment\/.*?(?=[)>])|(?<=href=")\/api\/attachment\/.*?(?=")/g
export const imageRegex = /(?<=\(<|\()\/api\/attachment\/.*?(?=[)>])/g

export const convertMarkdownToHtml = async (markdownContent: string) => {
  try {
    const file = await unified()
      .use(remarkParse) // Parse the markdown string into an AST
      .use(remarkGfm)
      .use(remarkHtml) // Convert the AST into an HTML string
      .process(markdownContent) // Process the content

    return String(file) // Convert the VFile (virtual file) to a string
  } catch (error) {
    console.error('Error converting Markdown to HTML:', error)
    throw error
  }
}

export const replaceFileContent = (htmlContent: string, isBlock: boolean, regex: RegExp) => {
  htmlContent = htmlContent.replace(regex, (match, _hrefGroup, _titleGroup, _offset, _originalString, groups) => {
    // The `groups` object (the last argument) contains the named capture groups.
    // groups.title should contain the content of the title attribute.
    const title = groups?.title ?? 'N/A'
    const icon = getIcon(title)
    if (title) {
      return `
            <span style="display: inline-flex; flex-direction: row; align-items: center; gap: 0.25rem;">
            ${isBlock ? 'File: ' : ''}[<span style="display: inline-block; width: 1rem; height: 1rem;">${icon.svg}</span> ${title.trim()}]
            </span>
            ` // .trim() to remove any potential leading/trailing spaces within the quotes
    }
    return match // Fallback: if title is not captured for some reason, return the original match.
  })
  return htmlContent
}

export const printPDF = async (html: string, origin: string, hostname: string, pdfToken?: string) => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const context = await browser.createBrowserContext()

  try {
    const page = await context.newPage()

    if (pdfToken) {
      await page.setExtraHTTPHeaders({
        'x-pdf-token': pdfToken
      })
    }

    await page.goto(origin)

    await page.setContent(html, { waitUntil: 'networkidle0' })
    await page.addStyleTag({
      content: `@media print {
        @page {
          margin: 1cm 1.5cm; /* top-bottom, left-right */
        }
        html {
          font-family: sans-serif;
        }

        img {
          max-width: 100%;
        }

        body {
          /* Optional: avoid extra spacing issues */
          margin: 0;
        }
      }`
    })

    const paraSpacing = await db.query.settings.findFirst({
      where: eq(settings.setting, 'isParagraphSpaced')
    })
    if (paraSpacing?.value === 'true') {
      await page.addStyleTag({ content: 'p {padding-bottom: 0.5rem}' })
    }

    const pdf = await page.pdf({ format: 'A4' })

    await browser.close()
    return pdf
  } catch (error) {
    console.log(error)
    await browser.close()
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}
