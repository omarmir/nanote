// markdownConverter.js
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkHtml from 'remark-html'
import jwt from 'jsonwebtoken'
import SECRET_KEY from '~/server/key'

export const convertMarkdownToHtml = async (markdownContent: string) => {
  try {
    const file = await unified()
      .use(remarkParse) // Parse the markdown string into an AST
      .use(remarkHtml) // Convert the AST into an HTML string
      .process(markdownContent) // Process the content

    return String(file) // Convert the VFile (virtual file) to a string
  } catch (error) {
    console.error('Error converting Markdown to HTML:', error)
    throw error
  }
}
export const appendTokenToUrl = (url: string, origin: string) => {
  const fileName = url.split('/').at(-1)
  const token = jwt.sign({ sub: fileName, exp: Math.floor(Date.now() / 1000) + 60 * 5 }, SECRET_KEY) // expires in 5 mins
  if (url.includes('?')) {
    return `${origin}${url}&token=${token}`
  } else {
    return `${origin}${url}?token=${token}`
  }
}
