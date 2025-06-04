// markdownConverter.js
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkHtml from 'remark-html'

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
