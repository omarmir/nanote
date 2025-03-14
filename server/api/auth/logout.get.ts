export default defineEventHandler(async (event): Promise<void> => {
  deleteCookie(event, 'token')
})
