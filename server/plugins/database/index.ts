import { useDatabase } from '#imports'

export default defineNitroPlugin(async (_nitroApp) => {
  const db = useDatabase()
})
