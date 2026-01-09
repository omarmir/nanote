/**
 * ESLint rule to enforce `authorize` calls in API route handlers
 *
 * This rule checks that any file in server/api/ that uses:
 * - defineEventHandler
 * - defineEventHandlerWithDB
 * - defineEventHandlerWithId
 *
 * Must have at least one call to `authorize()` in the handler function body.
 *
 * Exceptions (automatically excluded):
 * - server/wrappers/** (wrapper utility functions that define the handlers)
 * - server/api/[...].ts (catch-all route)
 * - server/api/auth/** (authentication endpoints)
 */

export default {
  meta: {
    type: /** @type {const} */ ('problem'),
    docs: {
      description: 'Require authorize() call in API route handlers for security',
      category: 'Security',
      recommended: true
    },
    messages: {
      missingAuthorize:
        'API route handler must call authorize() to secure the endpoint. If this endpoint should be public, add a comment: // eslint-disable-next-line local/require-authorize'
    },
    schema: []
  },

  create(context) {
    // Only check files in server/api directory
    const filename = context.filename || context.getFilename()

    // normalizes slash for cross-platform check (Windows uses backslash)
    const normalizedFilename = filename.split('\\').join('/')

    if (!normalizedFilename.includes('server/api/')) {
      return {}
    }

    // Skip wrapper files and specific files that don't need authorization
    const skipPatterns = [
      'server/wrappers/', // Wrapper utility functions
      'server/api/[...].ts', // Catch-all error handler
      'server/api/auth/' // Auth handlers
    ]

    if (skipPatterns.some(pattern => normalizedFilename.includes(pattern))) {
      return {}
    }

    // Track whether we found an authorize call
    let hasAuthorizeCall = false
    let exportDefaultNode = null
    let isNuxtAuthHandler = false

    return {
      // Find the main handler (default export)
      ExportDefaultDeclaration(node) {
        exportDefaultNode = node

        // Check if it's NuxtAuthHandler immediately
        if (
          node.declaration.type === 'CallExpression' &&
          node.declaration.callee.type === 'Identifier' &&
          node.declaration.callee.name === 'NuxtAuthHandler'
        ) {
          isNuxtAuthHandler = true
        }
      },

      // Check for valid authorize calls
      CallExpression(node) {
        // Check if this is an authorize call (authorize(...))
        if (node.callee.type === 'Identifier' && node.callee.name === 'authorize') {
          hasAuthorizeCall = true
        }
      },

      // Also check for AwaitExpression that wraps authorize calls
      AwaitExpression(node) {
        if (
          node.argument.type === 'CallExpression' &&
          node.argument.callee.type === 'Identifier' &&
          node.argument.callee.name === 'authorize'
        ) {
          hasAuthorizeCall = true
        }
      },

      // At the end of the program, check if we found a handler without authorize
      'Program:exit'() {
        // If we found a default export but no authorize call, report an error
        if (exportDefaultNode && !hasAuthorizeCall && !isNuxtAuthHandler) {
          context.report({
            node: exportDefaultNode,
            messageId: 'missingAuthorize'
          })
        }
      }
    }
  }
}
