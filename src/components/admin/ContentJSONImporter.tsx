'use client'

import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { RenderLexical } from '@payloadcms/richtext-lexical/client'
import type { RichTextFieldClientProps } from 'payload'
import { Button, useConfig, useField } from '@payloadcms/ui'
import { useEffect, useId, useMemo, useState, type ChangeEvent } from 'react'

import { RichText } from '@/components/RichText'

import styles from './ContentJSONImporter.module.css'

type LexicalDocument = DefaultTypedEditorState
type WorkspaceTab = 'json' | 'preview' | 'visual'

type PreviewMediaDoc = {
  alt?: string | null
  filename: string
  height?: number | null
  id: number | string
  mimeType: string
  sizes?: Record<
    string,
    | {
        filename?: string | null
        filesize?: number | null
        height?: number | null
        mimeType?: string | null
        url?: string | null
        width?: number | null
      }
    | null
    | undefined
  >
  url: string
  width?: number | null
}

type PreviewNode = {
  children?: PreviewNode[]
  relationTo?: string
  root?: PreviewNode
  type?: string
  value?: PreviewMediaDoc | number | string
}

const TABS: Array<{ label: string; value: WorkspaceTab }> = [
  {
    label: 'Visual',
    value: 'visual',
  },
  {
    label: 'JSON',
    value: 'json',
  },
  {
    label: 'Preview',
    value: 'preview',
  },
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function stripCodeFences(input: string) {
  const trimmed = input.trim()

  if (!trimmed.startsWith('```')) {
    return trimmed
  }

  return trimmed.replace(/^```[a-zA-Z0-9_-]*\s*/, '').replace(/\s*```$/, '').trim()
}

function extractLexicalDocument(value: unknown): LexicalDocument {
  const candidate = isRecord(value) && 'content' in value ? value.content : value

  if (!isRecord(candidate)) {
    throw new Error('O JSON precisa ser um objeto com `root`, ou um objeto com `content.root`.')
  }

  if (!isRecord(candidate.root)) {
    throw new Error('O conteudo precisa ter a propriedade `root`.')
  }

  if (candidate.root.type !== 'root') {
    throw new Error('`content.root.type` precisa ser `root`.')
  }

  if (!Array.isArray(candidate.root.children)) {
    throw new Error('`content.root.children` precisa ser um array.')
  }

  return candidate as LexicalDocument
}

function collectUploadIDsFromNode(node: PreviewNode, ids: Set<number | string>) {
  const uploadValue = node.value
  const isUploadReference = typeof uploadValue === 'number' || typeof uploadValue === 'string'

  if (node.type === 'upload' && node.relationTo === 'media' && isUploadReference) {
    ids.add(uploadValue)
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      collectUploadIDsFromNode(child, ids)
    }
  }
}

function collectUploadIDs(document: LexicalDocument | null | undefined) {
  if (!document || !isRecord(document.root)) {
    return []
  }

  const ids = new Set<number | string>()
  collectUploadIDsFromNode(document.root as PreviewNode, ids)

  return Array.from(ids)
}

function enrichUploadNodes(node: PreviewNode, mediaMap: Map<string, PreviewMediaDoc>): PreviewNode {
  const nextNode: PreviewNode = { ...node }
  const uploadValue = node.value
  const isUploadReference = typeof uploadValue === 'number' || typeof uploadValue === 'string'

  if (Array.isArray(node.children)) {
    nextNode.children = node.children.map((child) => enrichUploadNodes(child, mediaMap))
  }

  if (node.type === 'upload' && node.relationTo === 'media' && isUploadReference) {
    const mediaDoc = mediaMap.get(String(uploadValue))

    if (mediaDoc) {
      nextNode.value = mediaDoc
    }
  }

  return nextNode
}

function buildPreviewDocument(
  document: LexicalDocument | null | undefined,
  mediaMap: Map<string, PreviewMediaDoc>,
) {
  if (!document || !isRecord(document.root)) {
    return null
  }

  return {
    ...document,
    root: enrichUploadNodes(document.root as PreviewNode, mediaMap),
  } as LexicalDocument
}

function buildMediaEndpoint(serverURL: string, apiRoute: string, ids: Array<number | string>) {
  const params = new URLSearchParams()

  params.set('depth', '1')
  params.set('limit', String(ids.length))
  params.set('where[id][in]', ids.join(','))

  return `${serverURL}${apiRoute}/media?${params.toString()}`
}

function normalizeSchemaPath(schemaPath: string) {
  if (schemaPath.startsWith('collection.') || schemaPath.startsWith('global.')) {
    return schemaPath
  }

  return `collection.${schemaPath}`
}

export function ContentJSONField(props: RichTextFieldClientProps<LexicalDocument>) {
  const { path } = props
  const contentPath = path || 'content'
  const schemaPath = normalizeSchemaPath(props.schemaPath || 'posts.content')
  const fileInputId = useId()
  const textAreaId = useId()
  const {
    config: {
      routes: { api: apiRoute },
      serverURL,
    },
  } = useConfig()
  const { setValue, value } = useField<LexicalDocument | null>({
    path: contentPath,
  })

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('visual')
  const [rawJSON, setRawJSON] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewUploadError, setPreviewUploadError] = useState<string | null>(null)
  const [previewMediaMap, setPreviewMediaMap] = useState<Map<string, PreviewMediaDoc>>(new Map())

  useEffect(() => {
    if (!value) {
      setRawJSON('')
      return
    }

    setRawJSON(JSON.stringify(value, null, 2))
  }, [value])

  const uploadIDs = useMemo(() => collectUploadIDs(value), [value])

  useEffect(() => {
    if (!uploadIDs.length) {
      setPreviewUploadError(null)
      return
    }

    const missingIDs = uploadIDs.filter((id) => !previewMediaMap.has(String(id)))

    if (!missingIDs.length) {
      return
    }

    const controller = new AbortController()

    async function loadPreviewMedia() {
      try {
        const response = await fetch(buildMediaEndpoint(serverURL, apiRoute, missingIDs), {
          credentials: 'include',
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Falha ao carregar uploads do preview (${response.status}).`)
        }

        const payload = (await response.json()) as {
          docs?: PreviewMediaDoc[]
        }

        setPreviewMediaMap((currentMap) => {
          const nextMap = new Map(currentMap)

          for (const doc of payload.docs || []) {
            nextMap.set(String(doc.id), doc)
          }

          return nextMap
        })
        setPreviewUploadError(null)
      } catch (caughtError) {
        if (controller.signal.aborted) {
          return
        }

        const message =
          caughtError instanceof Error
            ? caughtError.message
            : 'Nao foi possivel carregar as imagens para o preview.'

        setPreviewUploadError(message)
      }
    }

    void loadPreviewMedia()

    return () => {
      controller.abort()
    }
  }, [apiRoute, previewMediaMap, serverURL, uploadIDs])

  const previewDocument = useMemo(() => buildPreviewDocument(value, previewMediaMap), [previewMediaMap, value])
  const visualField = useMemo(() => {
    return {
      ...(props.field || {}),
      admin: {
        ...(props.field?.admin || {}),
        components: null,
      },
    }
  }, [props.field])

  const handleApplyJSON = () => {
    try {
      const input = stripCodeFences(rawJSON)

      if (!input) {
        throw new Error('Cole ou carregue um JSON antes de gerar o preview.')
      }

      const parsed = JSON.parse(input)
      const nextDocument = extractLexicalDocument(parsed)

      setValue(nextDocument)
      setError(null)
      setFeedback('Preview atualizado. Esse JSON ja foi aplicado ao campo content.')
      setActiveTab('preview')
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Nao foi possivel interpretar o JSON informado.'

      setFeedback(null)
      setError(message)
    }
  }

  const handleLoadCurrentValue = () => {
    if (!value) {
      setFeedback(null)
      setError('O campo content ainda esta vazio.')
      return
    }

    setRawJSON(JSON.stringify(value, null, 2))
    setError(null)
    setFeedback('O valor atual de content foi carregado no editor JSON.')
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      const text = await file.text()

      setRawJSON(text)
      setError(null)
      setFeedback(`Arquivo ${file.name} carregado. Agora clique em Preview / Aplicar.`)
      setActiveTab('json')
    } catch {
      setFeedback(null)
      setError('Nao foi possivel ler o arquivo selecionado.')
    } finally {
      event.target.value = ''
    }
  }

  const handleClearJSON = () => {
    setRawJSON('')
    setFeedback(null)
    setError(null)
  }

  return (
    <div className={styles.workspace}>
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <strong>Content workspace</strong>
          <p className={styles.helperText}>
            Alterne entre o editor visual, o JSON real do campo e o preview do mesmo
            conteudo. As imagens continuam sendo inseridas visualmente no editor.
          </p>
        </div>

        <div className={styles.tabList} role="tablist" aria-label="Content workspace tabs">
          {TABS.map((tab) => (
            <button
              aria-selected={activeTab === tab.value}
              className={`${styles.tab} ${activeTab === tab.value ? styles.tabActive : ''}`.trim()}
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value)
              }}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`${styles.panel} ${activeTab === 'visual' ? '' : styles.panelHidden}`.trim()}>
        <RenderLexical
          field={visualField as never}
          initialValue={value ?? undefined}
          path={contentPath}
          schemaPath={schemaPath}
          setValue={setValue as never}
          value={value ?? undefined}
        />
      </div>

      <div className={`${styles.panel} ${activeTab === 'json' ? '' : styles.panelHidden}`.trim()}>
        <div className={styles.fieldBlock}>
          <label htmlFor={fileInputId}>Carregar arquivo .json</label>
          <input
            accept=".json,application/json"
            id={fileInputId}
            onChange={handleFileChange}
            type="file"
          />
        </div>

        <div className={styles.fieldBlock}>
          <label htmlFor={textAreaId}>Cole o JSON do content</label>
          <textarea
            className={styles.textArea}
            id={textAreaId}
            onChange={(event) => {
              setRawJSON(event.target.value)
            }}
            placeholder={'{\n  "root": {\n    "type": "root",\n    "children": []\n  }\n}'}
            spellCheck={false}
            value={rawJSON}
          />
        </div>

        <div className={styles.buttonRow}>
          <Button buttonStyle="primary" onClick={handleApplyJSON} size="small" type="button">
            Preview / Aplicar
          </Button>

          <Button
            buttonStyle="secondary"
            onClick={handleLoadCurrentValue}
            size="small"
            type="button"
          >
            Carregar content atual
          </Button>

          <Button buttonStyle="subtle" onClick={handleClearJSON} size="small" type="button">
            Limpar JSON
          </Button>
        </div>
      </div>

      <div className={`${styles.panel} ${activeTab === 'preview' ? '' : styles.panelHidden}`.trim()}>
        {previewUploadError ? <p className={styles.error}>{previewUploadError}</p> : null}

        {previewDocument ? (
          <div className={styles.previewSurface}>
            <RichText content={previewDocument} />
          </div>
        ) : (
          <p className={styles.emptyState}>O campo content ainda esta vazio.</p>
        )}
      </div>

      {feedback ? <p className={styles.feedback}>{feedback}</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  )
}
