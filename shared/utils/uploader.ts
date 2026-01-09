import type { Uploader } from '@milkdown/kit/plugin/upload'
import type { Node } from '@milkdown/kit/prose/model'

const onUpload = async (file: File, path: string): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('path', path)

  const url = await $fetch<string>('/api/attachment', {
    method: 'POST',
    body: formData
  })

  return url
}

const toCheckUploader = async (fileURL: string) => {
  const resp = await $fetch<string>('/api/attachment/check', {
    method: 'GET',
    query: { url: fileURL }
  })

  return resp
}

const createUploader = (path: string | null) => {
  if (!path) return
  const uploader: Uploader = async (files, schema) => {
    const nodes: Node[] = await Promise.all(
      Array.from(files).map(async (file) => {
        const src = await onUpload(file, path)

        // Handle image files
        if (file.type.includes('image')) {
          return schema.nodes.image.createAndFill({
            src,
            alt: file.name
          }) as Node
        }

        // Handle other files as attachment links
        const linkMark = schema.marks.link.create({ href: src })
        const textNode = schema.text(file.name, [linkMark])
        return schema.nodes.paragraph.create({}, textNode)
      })
    )

    return nodes.filter((node): node is Node => !!node)
  }

  return uploader
}

export { createUploader, onUpload, toCheckUploader }
