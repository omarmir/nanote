// import { sendStream, setHeaders } from 'h3'
import { readFileSync } from 'node:fs'
import contentDisposition from 'content-disposition'
import { defineEventHandlerWithNotebookAndNote } from '~~/server/wrappers/note'
import { blockRegex, regex as inlineRegex } from 'milkdown-plugin-file/regex'

export default defineEventHandlerWithNotebookAndNote(async (event, _cleanNotebook, cleanNote, fullPath) => {
  const { origin, host } = getRequestURL(event)

  const config = useRuntimeConfig()

  const content = readFileSync(fullPath, 'utf8')
  const newContent = content.replace(imageRegex, matchedUrl => `${origin}${matchedUrl}`)

  let htmlContent: string = await convertMarkdownToHtml(newContent)
  htmlContent = replaceFileContent(htmlContent, true, blockRegex)
  htmlContent = replaceFileContent(htmlContent, false, inlineRegex)

  const pdfSecret = getInternalSecret()
  const pdf = await printPDF(htmlContent, origin, host, pdfSecret)

  // Set appropriate headers
  setHeaders(event, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': contentDisposition(`${cleanNote}.pdf`, { type: 'attachment' }),
    'Cache-Control': 'no-cache'
  })

  return send(event, pdf)
})
