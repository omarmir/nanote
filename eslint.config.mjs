// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import vueI18n from '@intlify/eslint-plugin-vue-i18n'
import requireAuthorize from './eslint-rules/require-authorize.js'
import validateAuthorizeParams from './eslint-rules/validate-authorize-params.js'

export default withNuxt(
  // 1. Global Ignores (Must be a standalone object)
  {
    ignores: [
      // Ignore all JSON files by default to stop .vscode/settings.json errors
      '**/*.json',
      // Un-ignore (!) your locale files so they CAN be linted
      '!i18n/locales/**/*.json',
      // Other ignores
      '.vscode/*',
      'data/*'
    ]
  },
  // 2. Add your custom local rules plugin
  {
    files: ['server/api/**/*.ts', 'server/api/**/*.js'],
    plugins: {
      local: {
        name: 'local',
        rules: {
          'require-authorize': requireAuthorize,
          'validate-authorize-params': validateAuthorizeParams
        }
      }
    },
    rules: {
      'local/require-authorize': 'error',
      'local/validate-authorize-params': 'error'
    }
  },
  // Your custom configs here
  ...vueI18n.configs['flat/recommended'],
  {
    rules: {
      'vue/max-attributes-per-line': 'off',
      'vue/html-closing-bracket-newline': 'off',
      '@typescript-eslint/member-delimiter-style': 'off',
      '@stylistic/operator-linebreak': 'off',
      '@stylistic/arrow-parens': 'off',
      '@stylistic/member-delimiter-style': 'off',
      '@intlify/vue-i18n/no-raw-text': [
        'error',
        {
          ignoreText: [':', '(', ')', '.', '*', '+', '/', '%', '·']
        }
      ]
    },
    settings: {
      'vue-i18n': {
        localeDir: [
          {
            pattern: './i18n/locales/**/*.{json}',
            localeKey: 'file'
          }
        ]
      }
    }
  },
  // 4. SPECIFIC OVERRIDES FOR LOCALE FILES
  {
    // Apply these rules ONLY to files matching this pattern
    files: ['i18n/locales/**/*.json'],
    rules: {
      // Disable the rule you mentioned for these files
      '@intlify/vue-i18n/no-raw-text': 'off',

      // Note: Based on your previous error logs, you might also need these:
      '@intlify/vue-i18n/no-html-messages': 'off',
      '@intlify/vue-i18n/no-deprecated-modulo-syntax': 'off'
    }
  }
)
