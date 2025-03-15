import type { EventHandlerRequest, H3Event } from 'h3'
import { type StorageValue, type Storage, createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import { uploadPath } from '~/server/folder'

type EventHandlerWithSearch<T extends EventHandlerRequest, D> = (
  event: H3Event<T>,
  storage: Storage<StorageValue>
) => Promise<D>

const storage = createStorage({
  driver: fsDriver({ base: uploadPath })
})

export function defineEventHandlerWithStorage<T extends EventHandlerRequest, D>(handler: EventHandlerWithSearch<T, D>) {
  return defineEventHandler(async (event) => {
    return await handler(event, storage)
  })
}
