export default defineNuxtPlugin({
  enforce: 'post',
  setup() {
    const primaryColour = window.localStorage.getItem('nuxt-ui-primary')
    const neutralColour = window.localStorage.getItem('nuxt-ui-neutral')

    const newAppConfig = {
      ui: {
        colors: {
          primary: primaryColour ?? 'blue',
          neutral: neutralColour ?? 'neutral'
        }
      }
    }

    updateAppConfig(newAppConfig)
  }
})
