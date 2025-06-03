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

// --- Example Usage ---
// const markdownString = `
// # Welcome to Remark Example!

// This is a paragraph with **bold text** and *italic text*.

// ## Features:
// * Lists are easy.
// * Code blocks too:
//     \`\`\`javascript
//     const message = "Hello, Remark!";
//     console.log(message);
//     \`\`\`

// \`Inline code\` is also supported.

// [Remark's GitHub Repository](https://github.com/remarkjs/remark)
// `

// convertMarkdownToHtml(markdownString)
//   .then((htmlOutput) => {
//     console.log('--- Converted HTML ---')
//     console.log(htmlOutput)
//     console.log('----------------------')
//   })
//   .catch((error) => {
//     console.error('Failed to convert Markdown:', error)
//   })
