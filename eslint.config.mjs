// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import vueI18n from '@intlify/eslint-plugin-vue-i18n'

export default withNuxt(
  // Your custom configs here
  ...vueI18n.configs['flat/recommended'],
  {
    ignores: ['*.json', '.vscode/*', '!/src', 'data/*'],
    rules: {
      'vue/max-attributes-per-line': 'off',
      'vue/html-closing-bracket-newline': 'off',
      '@typescript-eslint/member-delimiter-style': 'off',
      '@stylistic/member-delimiter-style': 'off'
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
  }
)
