'use client'
/* eslint-disable @next/next/no-img-element */

import type { LexicalEditorViewMap } from '@payloadcms/richtext-lexical'
import { $getNodeByKey } from 'lexical'
import { Button, useConfig } from '@payloadcms/ui'
import { useEffect, useId, useState } from 'react'

import { getUploadResizeStyle, getUploadResizeValues } from '@/lib/richTextUploadSizing'

import styles from './PostUploadView.module.css'

type UploadMediaDoc = {
  alt?: string | null
  filename?: string | null
  thumbnailURL?: string | null
  url?: string | null
}

type UploadNodeData = {
  fields?: Record<string, unknown> | null
  getData?: () => {
    fields?: Record<string, unknown> | null
    value?: number | string | UploadMediaDoc | null
  }
  getKey?: () => string
  remove?: () => void
  setData?: (data: {
    fields?: Record<string, unknown> | null
    value?: number | string | UploadMediaDoc | null
  }) => void
  value?: number | string | UploadMediaDoc | null
}

type UploadEditorViewProps = {
  config: {
    routes: {
      api: string
    }
    serverURL: string
  }
  editor: {
    getEditorState: () => {
      read: <T>(fn: () => T) => T
    }
    registerUpdateListener: (listener: () => void) => () => void
    update: (fn: () => void) => void
  }
  node: UploadNodeData
}

function buildMediaURL(serverURL: string, apiRoute: string, id: unknown) {
  return `${serverURL.replace(/\/$/, '')}${apiRoute}/media/${encodeURIComponent(String(id))}?depth=0`
}

function isPopulatedUpload(value: UploadNodeData['value']): value is UploadMediaDoc {
  return typeof value === 'object' && value !== null && typeof value.url === 'string'
}

function readUploadSnapshot(editor: UploadEditorViewProps['editor'], node: UploadNodeData) {
  return editor.getEditorState().read(() => {
    const nodeKey = node.getKey?.() || ''
    const liveNode = $getNodeByKey(nodeKey) as UploadNodeData | null

    if (!nodeKey || !liveNode?.getData) {
      return {
        data: null,
        nodeKey,
      }
    }

    return {
      data: liveNode.getData(),
      nodeKey,
    }
  })
}

function setNodeField(
  nodeKey: string,
  editor: UploadEditorViewProps['editor'],
  patch: Record<string, unknown>,
) {
  editor.update(() => {
    const target = $getNodeByKey(nodeKey) as UploadNodeData | null

    if (!target?.getData || !target.setData) {
      return
    }

    const currentData = target.getData()
    const currentFields = currentData.fields || {}
    const nextFields = { ...currentFields }

    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === null || value === '') {
        delete nextFields[key]
        continue
      }

      nextFields[key] = value
    }

    target.setData({
      ...currentData,
      fields: nextFields,
    })
  })
}

function clearNodeSize(
  nodeKey: string,
  editor: UploadEditorViewProps['editor'],
  fields: Record<string, unknown>,
) {
  editor.update(() => {
    const target = $getNodeByKey(nodeKey) as UploadNodeData | null

    if (!target?.getData || !target.setData) {
      return
    }

    const currentData = target.getData()
    const nextFields = { ...(currentData.fields || fields) }

    delete nextFields.width
    delete nextFields.height

    target.setData({
      ...currentData,
      fields: nextFields,
    })
  })
}

function UploadEditorViewClient({
  editor,
  node,
}: UploadEditorViewProps) {
  const { config } = useConfig()
  const [snapshot, setSnapshot] = useState(() => readUploadSnapshot(editor, node))
  const data = snapshot.data
  const nodeKey = snapshot.nodeKey
  const uploadValue = data?.value
  const fields = data?.fields || {}
  const [media, setMedia] = useState<UploadMediaDoc | null>(
    isPopulatedUpload(uploadValue) ? uploadValue : null,
  )
  const widthInputId = useId()
  const heightInputId = useId()
  const { height, width } = getUploadResizeValues(fields)

  useEffect(() => {
    setSnapshot(readUploadSnapshot(editor, node))
  }, [editor, node])

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      setSnapshot(readUploadSnapshot(editor, node))
    })
  }, [editor, node])

  useEffect(() => {
    if (isPopulatedUpload(uploadValue)) {
      setMedia(uploadValue)
      return
    }

    if (!uploadValue || typeof uploadValue === 'object') {
      setMedia(null)
      return
    }

    const controller = new AbortController()

    async function loadMedia() {
      try {
        const response = await fetch(
          buildMediaURL(config.serverURL, config.routes.api, uploadValue),
          {
            credentials: 'include',
            signal: controller.signal,
          },
        )

        if (!response.ok) {
          throw new Error(`Falha ao carregar a imagem (${response.status}).`)
        }

        const payload = (await response.json()) as UploadMediaDoc
        setMedia(payload)
      } catch {
        if (!controller.signal.aborted) {
          setMedia(null)
        }
      }
    }

    void loadMedia()

    return () => {
      controller.abort()
    }
  }, [config.routes.api, config.serverURL, uploadValue])

  const image = media ? (
    <img
      alt={media.alt || media.filename || ''}
      className={styles.image}
      loading="lazy"
      src={media.thumbnailURL || media.url || ''}
      style={getUploadResizeStyle(fields)}
    />
  ) : (
    <div className={styles.placeholder}>Carregando imagem...</div>
  )

  return (
    <div className={styles.root}>
      <div className={styles.preview}>{image}</div>

      <div className={styles.controls}>
        <div className={styles.field}>
          <label htmlFor={widthInputId}>Largura (px)</label>
          <input
            id={widthInputId}
            inputMode="numeric"
            min="1"
            onChange={(event) => {
              const value = event.currentTarget.value.trim()
              setNodeField(nodeKey, editor, {
                width: value ? Number(value) : undefined,
              })
            }}
            placeholder="100%"
            type="number"
            value={width ?? ''}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={heightInputId}>Altura (px)</label>
          <input
            id={heightInputId}
            inputMode="numeric"
            min="1"
            onChange={(event) => {
              const value = event.currentTarget.value.trim()
              setNodeField(nodeKey, editor, {
                height: value ? Number(value) : undefined,
              })
            }}
            placeholder="auto"
            type="number"
            value={height ?? ''}
          />
        </div>

        <div className={styles.actions}>
          <Button
            buttonStyle="subtle"
            onClick={() => {
              clearNodeSize(nodeKey, editor, fields)
            }}
            size="small"
            type="button"
          >
            Redefinir tamanho
          </Button>

          <Button
            buttonStyle="error"
            onClick={() => {
              editor.update(() => {
                const target = $getNodeByKey(nodeKey) as UploadNodeData | null
                target?.remove?.()
              })
            }}
            size="small"
            type="button"
          >
            Remover
          </Button>
        </div>
      </div>
    </div>
  )
}

function UploadEditorView(props: UploadEditorViewProps) {
  return <UploadEditorViewClient {...props} />
}

export const postContentViews: LexicalEditorViewMap = {
  default: {
    nodes: {
      upload: {
        Component: UploadEditorView as never,
      },
    },
  },
}
