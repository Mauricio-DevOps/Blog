/* eslint-disable @next/next/no-img-element */
import type { LexicalEditorNodeMap } from '@payloadcms/richtext-lexical'

import { getUploadResizeStyle } from '@/lib/richTextUploadSizing'

type UploadMediaDoc = {
  alt?: string | null
  filename?: string | null
  thumbnailURL?: string | null
  url?: string | null
}

type UploadNodeData = {
  fields?: Record<string, unknown> | null
  value?: number | string | UploadMediaDoc | null
}

function isPopulatedUpload(value: UploadNodeData['value']): value is UploadMediaDoc {
  return typeof value === 'object' && value !== null && typeof value.url === 'string'
}

function UploadNodeRenderer({ node }: { node: UploadNodeData }) {
  if (!isPopulatedUpload(node.value)) {
    return null
  }

  const media = node.value

  return (
    <img
      alt={media.alt || media.filename || ''}
      loading="lazy"
      src={media.thumbnailURL || media.url || ''}
      style={getUploadResizeStyle(node.fields)}
    />
  )
}

export const richTextNodeMap = {
  upload: {
    Component: UploadNodeRenderer as never,
  },
} satisfies LexicalEditorNodeMap
