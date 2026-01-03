export default defineEventHandler(async event => {
  await authorize(event, 'nonExistentAbility')
  return 'hello'
})
