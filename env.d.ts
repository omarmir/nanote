import type { StorageValue, Storage } from 'unstorage'
import type { AttachmentParams } from './server/plugins/attachments'

declare module 'h3' {
  interface H3EventContext {
    $attachment: {
      storage?: Storage<StorageValue>
      addToQueueForAttachmentMarking: (params: AttachmentParams) => string
    }
  }
}
