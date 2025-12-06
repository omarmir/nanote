export default defineAppConfig({
  theme: {
    radius: 0.25,
    blackAsPrimary: false
  },
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'neutral'
    },
    button: {
      slots: {
        // These classes will be applied to ALL buttons by default
        base: 'cursor-pointer'
      }
    }
  }
})
