import type {
  DefaultNodeTypes,
  DefaultTypedEditorState,
  SerializedLinkNode,
} from '@payloadcms/richtext-lexical'
import type { LexicalEditorNodeMap } from '@payloadcms/richtext-lexical'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as PayloadRichText,
} from '@payloadcms/richtext-lexical/react'

import { richTextNodeMap } from '@/components/richtext/UploadNode'

type NodeTypes = DefaultNodeTypes

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { relationTo, value } = linkNode.fields.doc || {}

  if (!relationTo || !value || typeof value !== 'object' || !('slug' in value)) {
    return '#'
  }

  if (relationTo === 'posts') {
    return `/post/${value.slug}`
  }

  if (relationTo === 'sections') {
    return `/${value.slug}`
  }

  if (relationTo === 'tags') {
    return `/tag/${value.slug}`
  }

  return '#'
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
})

const nodeMap: LexicalEditorNodeMap = {
  ...richTextNodeMap,
}

type Props = {
  className?: string
  content: DefaultTypedEditorState
}

export function RichText({ className = '', content }: Props) {
  return (
    <PayloadRichText
      className={`article-richtext ${className}`.trim()}
      converters={jsxConverters}
      data={content}
      nodeMap={nodeMap}
    />
  )
}
