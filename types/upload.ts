export type MultiPartData = { name?: string; data: Buffer<ArrayBufferLike> | string; filename?: string }

export type UploadItem = { path: string; fileName: string; deleted: boolean }
