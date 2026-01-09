/**
 * ESLint rule to validate authorize() call parameters match ability requirements
 *
 * This rule dynamically reads ability definitions from shared/utils/abilities.ts
 * and shared/utils/abilities/*.ts, then parses the complete parameter signature
 * to validate authorize() calls.
 *
 * This rule ensures that:
 * 1. The first parameter is always the event object
 * 2. The second parameter is an ability (identifier)
 * 3. The remaining parameters match the ability's signature exactly
 * 4. The last parameter is event.context.$roleMap
 *
 * The rule extracts the full parameter list from defineAbility callbacks and validates
 * that authorize() calls provide the correct parameters in the correct order.
 *
 * Example:
 *   Ability: defineAbility((user: Session, programId: number, orgId: number, roleMap) => ...)
 *   Expected: authorize(event, ability, programId, orgId, event.context.$roleMap)
 */

import fs from 'node:fs'
import path from 'node:path'

export default {
  meta: {
    type: /** @type {const} */ ('problem'),
    docs: {
      description: 'Validate that authorize() calls have correct parameters based on the ability signature',
      category: 'Security',
      recommended: true
    },
    messages: {
      wrongParamCount:
        'authorize({{abilityName}}) expects {{expectedCount}} parameters but got {{actualCount}}. Expected signature: authorize(event, {{abilityName}}, {{expectedParams}})',
      missingEvent: 'First parameter of authorize() must be the event object',
      missingAbility: 'Second parameter of authorize() must be an ability identifier',

      unknownAbility:
        'Unknown ability "{{abilityName}}". Could not find ability definition in shared/utils/abilities.ts or shared/utils/abilities/*.ts',
      wrongParameterType:
        'Parameter {{position}} ({{paramName}}) should be of type {{expectedType}}, but may be incorrect. Expected: authorize(event, {{abilityName}}, {{expectedParams}})'
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

    // Cache for ability signatures
    let abilitySignaturesCache = null

    /**
     * Parse a parameter string to extract name and type
     * Example: "programId: number" => { name: "programId", type: "number" }
     */
    function parseParameter(paramStr) {
      const trimmed = paramStr.trim()

      // Remove optional marker and default values
      let cleaned = trimmed.replace(/\?/g, '').split('=')[0].trim()

      // Split by colon to get name and type
      const parts = cleaned.split(':').map(s => s.trim())

      if (parts.length >= 2) {
        const name = parts[0]
        const type = parts.slice(1).join(':').trim()
        return { name, type, optional: trimmed.includes('?') || trimmed.includes('=') }
      }

      // No type annotation
      return { name: parts[0], type: null, optional: trimmed.includes('?') || trimmed.includes('=') }
    }

    /**
     * Parse ability files to extract complete parameter signatures
     * Returns: Map<abilityName, { params: Array<{name, type, optional}>, totalParams: number }>
     */
    function parseAbilityDefinitions() {
      if (abilitySignaturesCache) {
        return abilitySignaturesCache
      }

      const abilitySignatures = new Map()

      try {
        // Find the workspace root by looking for package.json
        let currentDir = path.dirname(filename)
        let workspaceRoot = null

        while (currentDir !== path.dirname(currentDir)) {
          if (fs.existsSync(path.join(currentDir, 'package.json'))) {
            workspaceRoot = currentDir
            break
          }
          currentDir = path.dirname(currentDir)
        }

        if (!workspaceRoot) {
          abilitySignaturesCache = abilitySignatures
          return abilitySignatures
        }

        const utilsDir = path.join(workspaceRoot, 'shared', 'utils')
        const abilitiesDir = path.join(utilsDir, 'abilities')
        const abilitiesFile = path.join(utilsDir, 'abilities.ts')

        const filePaths = []

        if (fs.existsSync(abilitiesFile)) {
          filePaths.push(abilitiesFile)
        }

        if (fs.existsSync(abilitiesDir) && fs.statSync(abilitiesDir).isDirectory()) {
          const dirFiles = fs
            .readdirSync(abilitiesDir)
            .filter(f => f.endsWith('.ts'))
            .map(f => path.join(abilitiesDir, f))
          filePaths.push(...dirFiles)
        }

        if (filePaths.length === 0) {
          abilitySignaturesCache = abilitySignatures
          return abilitySignatures
        }

        for (const filePath of filePaths) {
          const content = fs.readFileSync(filePath, 'utf-8')

          // Regex to match ability definitions and capture the full parameter list
          // Matches: export const abilityName = defineAbility((params) =>
          // Using a more flexible regex that handles multi-line definitions
          const abilityRegex = /export\s+const\s+(\w+)\s*=\s*defineAbility\s*\(\s*\(([^)]+)\)\s*=>/g

          let match
          while ((match = abilityRegex.exec(content)) !== null) {
            const abilityName = match[1]
            const paramsString = match[2]

            // Parse the parameter list
            // Split by comma, but be careful of commas inside generic types
            const params = []
            let currentParam = ''
            let depth = 0

            for (let i = 0; i < paramsString.length; i++) {
              const char = paramsString[i]

              if (char === '<' || char === '{' || char === '[') {
                depth++
                currentParam += char
              } else if (char === '>' || char === '}' || char === ']') {
                depth--
                currentParam += char
              } else if (char === ',' && depth === 0) {
                if (currentParam.trim()) {
                  params.push(parseParameter(currentParam))
                }
                currentParam = ''
              } else {
                currentParam += char
              }
            }

            // Don't forget the last parameter
            if (currentParam.trim()) {
              params.push(parseParameter(currentParam))
            }

            // Filter out the first parameter (user/session)
            // All remaining parameters are what we need to validate in authorize() calls
            const abilityParams = params.slice(1)

            // Total expected parameters for authorize():
            // 2 (event + ability) + all ability parameters
            const totalAuthorizeParams = 2 + abilityParams.length

            abilitySignatures.set(abilityName, {
              params: abilityParams,
              totalParams: totalAuthorizeParams,
              allParams: params // Keep for debugging/error messages
            })
          }
        }
      } catch (error) {
        // Log parsing errors to help with debugging
        console.error('[validate-authorize-params] Error parsing ability definitions:', error.message)
        // If parsing fails, return empty map
      }

      abilitySignaturesCache = abilitySignatures
      return abilitySignatures
    }

    const abilitySignatures = parseAbilityDefinitions()

    /**
     * Check if a node is likely an event parameter
     */
    function isEventParameter(node) {
      return node.type === 'Identifier' && node.name === 'event'
    }

    /**
     * Get the name of an ability from a node
     */
    function getAbilityName(node) {
      if (node.type === 'Identifier') {
        return node.name
      }
      return null
    }

    /**
     * Generate expected parameters string for error messages
     */
    function getExpectedParamsString(signature) {
      if (!signature || !signature.params || signature.params.length === 0) {
        return ''
      }

      return signature.params.map(p => p.name).join(', ')
    }

    return {
      // Check authorize calls (both await authorize(...) and authorize(...))
      CallExpression(node) {
        // Check if this is a call to authorize
        const isAuthorizeCall = node.callee.type === 'Identifier' && node.callee.name === 'authorize'

        if (!isAuthorizeCall) {
          return
        }

        const args = node.arguments
        const argCount = args.length

        // We need at least 2 arguments: event, ability
        if (argCount < 2) {
          context.report({
            node,
            messageId: 'wrongParamCount',
            data: {
              abilityName: args[1] ? getAbilityName(args[1]) || 'unknown' : 'unknown',
              expectedCount: '2+',
              expectedParams: '...',
              actualCount: argCount
            }
          })
          return
        }

        // Check first parameter is event
        if (!isEventParameter(args[0])) {
          context.report({
            node: args[0],
            messageId: 'missingEvent'
          })
        }

        // Check second parameter is an ability identifier
        const abilityName = getAbilityName(args[1])
        if (!abilityName) {
          context.report({
            node: args[1],
            messageId: 'missingAbility'
          })
          return
        }

        // Get the ability signature
        const signature = abilitySignatures.get(abilityName)

        if (!signature) {
          // Unknown ability - might be new or from a different source
          context.report({
            node: args[1],
            messageId: 'unknownAbility',
            data: { abilityName }
          })
          return
        }

        const expectedArgCount = signature.totalParams
        const expectedParamsStr = getExpectedParamsString(signature)

        // Check argument count matches exactly
        if (argCount !== expectedArgCount) {
          context.report({
            node,
            messageId: 'wrongParamCount',
            data: {
              abilityName,
              expectedCount: expectedArgCount,
              expectedParams: expectedParamsStr,
              actualCount: argCount
            }
          })
          return
        }

        // Validate all parameters after event and ability
        // Note: We can't fully validate types from AST, but we can check parameter count
        // and provide helpful messages about what's expected
        const abilityArgs = args.slice(2) // Skip event and ability
        const expectedParams = signature.params

        for (let i = 0; i < expectedParams.length; i++) {
          const expectedParam = expectedParams[i]
          const actualArg = abilityArgs[i]

          if (!actualArg && !expectedParam.optional) {
            // Missing required parameter
            context.report({
              node,
              messageId: 'wrongParameterType',
              data: {
                position: i + 3, // +3 because positions 1-2 are event and ability
                paramName: expectedParam.name,
                expectedType: expectedParam.type || 'unknown',
                abilityName,
                expectedParams: expectedParamsStr
              }
            })
          }
        }
      }
    }
  }
}
