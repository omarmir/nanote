export type MultiPartData = { name?: string; data: Buffer<ArrayBufferLike> | string; filename?: string }

export const PDF_STORAGE_PREFIX = 'pdf-token:'

export const SHARED_ATTACHMENT_PREFIX = 'shared-attach:'
