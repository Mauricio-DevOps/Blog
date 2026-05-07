export const autoDraftAuthorSlug = 'equipe-nebulosa'

export const autoDraftSectionSlugs = ['filmes', 'series', 'animes', 'games'] as const

export const autoDraftPostTypes = [
  'curiosidade',
  'explicador',
  'lista',
  'novidade',
  'review',
] as const

export type AutoDraftSectionSlug = (typeof autoDraftSectionSlugs)[number]
export type AutoDraftPostType = (typeof autoDraftPostTypes)[number]

export type AutoDraftAsset = {
  alt: string
  caption: string
  credit: string
  downloadUrl: string
  key: string
  license: string
  sourceUrl: string
}

export type AutoDraftSource = {
  publisher?: string
  publishedAt?: string
  title: string
  url: string
}

export type AutoDraftBlock =
  | {
      level?: 2 | 3 | 4
      text: string
      type: 'heading'
    }
  | {
      text: string
      type: 'paragraph'
    }
  | {
      assetKey: string
      height?: number
      type: 'image'
      width?: number
    }

export type AutoDraftPostInput = {
  assets: AutoDraftAsset[]
  blocks: AutoDraftBlock[]
  coverAssetKey: string
  excerpt: string
  postType: AutoDraftPostType
  sectionSlug: AutoDraftSectionSlug
  seoDescription: string
  seoTitle: string
  sources: AutoDraftSource[]
  tagSlugs: string[]
  title: string
  topic: string
}

type LexicalTextNode = {
  detail: number
  format: number
  mode: 'normal'
  style: string
  text: string
  type: 'text'
  version: 1
}

type LexicalBlockNode = {
  children: LexicalTextNode[]
  direction?: 'ltr'
  format: string
  indent?: number
  tag?: 'h2' | 'h3' | 'h4'
  type: 'heading' | 'paragraph'
  version: 1
}

type LexicalUploadNode = {
  fields?: {
    height?: number
    width?: number
  }
  format: string
  id: string
  relationTo: 'media'
  type: 'upload'
  value: number | string
  version: 3
}

type LexicalNode = LexicalBlockNode | LexicalUploadNode

const blockedImageHosts = [
  'facebook.com',
  'fbcdn.net',
  'google.com',
  'googleusercontent.com',
  'gstatic.com',
  'instagram.com',
  'pinimg.com',
  'pinterest.com',
  'reddit.com',
  'tiktok.com',
  'twimg.com',
  'twitter.com',
  'x.com',
] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

function readString(source: Record<string, unknown>, key: string) {
  const value = source[key]

  assert(typeof value === 'string' && value.trim().length > 0, `Campo obrigatorio invalido: ${key}`)

  return value.trim()
}

function readOptionalString(source: Record<string, unknown>, key: string) {
  const value = source[key]

  if (value === undefined || value === null) {
    return undefined
  }

  assert(typeof value === 'string', `Campo opcional invalido: ${key}`)

  return value.trim() || undefined
}

function readStringArray(source: Record<string, unknown>, key: string) {
  const value = source[key]

  assert(Array.isArray(value), `Campo obrigatorio precisa ser array: ${key}`)

  return value.map((item, index) => {
    assert(
      typeof item === 'string' && item.trim().length > 0,
      `Item invalido em ${key}[${index}]`,
    )

    return item.trim()
  })
}

function readHttpsUrl(source: Record<string, unknown>, key: string) {
  const value = readString(source, key)
  const url = new URL(value)

  assert(url.protocol === 'https:', `${key} precisa usar HTTPS`)

  return url.toString()
}

function isBlockedImageHost(url: string) {
  const hostname = new URL(url).hostname.toLowerCase()

  return blockedImageHosts.some((blockedHost) => {
    return hostname === blockedHost || hostname.endsWith(`.${blockedHost}`)
  })
}

function parseAsset(value: unknown, index: number): AutoDraftAsset {
  assert(isRecord(value), `Asset invalido em assets[${index}]`)

  const asset = {
    alt: readString(value, 'alt'),
    caption: readString(value, 'caption'),
    credit: readString(value, 'credit'),
    downloadUrl: readHttpsUrl(value, 'downloadUrl'),
    key: readString(value, 'key'),
    license: readString(value, 'license'),
    sourceUrl: readHttpsUrl(value, 'sourceUrl'),
  }

  assert(!isBlockedImageHost(asset.downloadUrl), `Host de download bloqueado para imagem: ${asset.key}`)
  assert(!isBlockedImageHost(asset.sourceUrl), `Host de origem bloqueado para imagem: ${asset.key}`)

  return asset
}

function parseSource(value: unknown, index: number): AutoDraftSource {
  assert(isRecord(value), `Fonte invalida em sources[${index}]`)

  return {
    publisher: readOptionalString(value, 'publisher'),
    publishedAt: readOptionalString(value, 'publishedAt'),
    title: readString(value, 'title'),
    url: readHttpsUrl(value, 'url'),
  }
}

function parseBlock(value: unknown, index: number): AutoDraftBlock {
  assert(isRecord(value), `Bloco invalido em blocks[${index}]`)

  const type = readString(value, 'type')

  if (type === 'heading') {
    const level = value.level ?? 2

    assert(level === 2 || level === 3 || level === 4, `Nivel de heading invalido em blocks[${index}]`)

    return {
      level,
      text: readString(value, 'text'),
      type,
    }
  }

  if (type === 'paragraph') {
    return {
      text: readString(value, 'text'),
      type,
    }
  }

  if (type === 'image') {
    return {
      assetKey: readString(value, 'assetKey'),
      height: readPositiveInteger(value, 'height'),
      type,
      width: readPositiveInteger(value, 'width'),
    }
  }

  throw new Error(`Tipo de bloco invalido em blocks[${index}]: ${type}`)
}

function readPositiveInteger(source: Record<string, unknown>, key: string) {
  const value = source[key]

  if (value === undefined || value === null) {
    return undefined
  }

  assert(typeof value === 'number' && Number.isFinite(value) && value > 0, `${key} precisa ser numero positivo`)

  return Math.round(value)
}

function hasUniqueValues(values: string[]) {
  return new Set(values).size === values.length
}

export function parseAutoDraftPostInput(value: unknown): AutoDraftPostInput {
  assert(isRecord(value), 'O arquivo precisa conter um objeto JSON')

  const sectionSlug = readString(value, 'sectionSlug')
  const postType = readString(value, 'postType')
  const assetsValue = value.assets
  const blocksValue = value.blocks
  const sourcesValue = value.sources

  assert(
    autoDraftSectionSlugs.includes(sectionSlug as AutoDraftSectionSlug),
    `sectionSlug precisa ser um destes valores: ${autoDraftSectionSlugs.join(', ')}`,
  )
  assert(
    autoDraftPostTypes.includes(postType as AutoDraftPostType),
    `postType precisa ser um destes valores: ${autoDraftPostTypes.join(', ')}`,
  )
  assert(Array.isArray(assetsValue) && assetsValue.length > 0, 'assets precisa ter ao menos uma imagem')
  assert(Array.isArray(blocksValue) && blocksValue.length > 0, 'blocks precisa ter conteudo')
  assert(Array.isArray(sourcesValue), 'sources precisa ser um array')

  const assets = assetsValue.map(parseAsset)
  const blocks = blocksValue.map(parseBlock)
  const sources = sourcesValue.map(parseSource)
  const coverAssetKey = readString(value, 'coverAssetKey')
  const tagSlugs = readStringArray(value, 'tagSlugs')
  const assetKeys = assets.map((asset) => asset.key)
  const imageBlocks = blocks.filter((block) => block.type === 'image')

  assert(hasUniqueValues(assetKeys), 'assets precisa ter keys unicas')
  assert(assets.some((asset) => asset.key === coverAssetKey), 'coverAssetKey precisa existir em assets')
  assert(imageBlocks.length <= 2, 'blocks pode conter no maximo 2 imagens internas')
  assert(blocks.some((block) => block.type === 'paragraph'), 'blocks precisa ter ao menos um paragrafo')

  for (const block of imageBlocks) {
    assert(assetKeys.includes(block.assetKey), `Imagem interna referencia asset ausente: ${block.assetKey}`)
  }

  return {
    assets,
    blocks,
    coverAssetKey,
    excerpt: readString(value, 'excerpt'),
    postType: postType as AutoDraftPostType,
    sectionSlug: sectionSlug as AutoDraftSectionSlug,
    seoDescription: readString(value, 'seoDescription'),
    seoTitle: readString(value, 'seoTitle'),
    sources,
    tagSlugs,
    title: readString(value, 'title'),
    topic: readString(value, 'topic'),
  }
}

function createTextNode(text: string): LexicalTextNode {
  return {
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    text,
    type: 'text',
    version: 1,
  }
}

function createParagraphNode(text: string): LexicalBlockNode {
  return {
    children: [createTextNode(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'paragraph',
    version: 1,
  }
}

function createHeadingNode(text: string, level: 2 | 3 | 4 = 2): LexicalBlockNode {
  return {
    children: [createTextNode(text)],
    format: '',
    tag: `h${level}`,
    type: 'heading',
    version: 1,
  }
}

function createUploadNode(
  assetKey: string,
  mediaId: number | string,
  fields?: {
    height?: number
    width?: number
  },
): LexicalUploadNode {
  return {
    fields,
    format: '',
    id: `auto-draft-${assetKey.replace(/[^a-z0-9_-]+/gi, '-')}`,
    relationTo: 'media',
    type: 'upload',
    value: mediaId,
    version: 3,
  }
}

export function buildAutoDraftRichText(
  input: AutoDraftPostInput,
  mediaIdsByAssetKey: Map<string, number | string>,
) {
  const children: LexicalNode[] = []

  for (const block of input.blocks) {
    if (block.type === 'heading') {
      children.push(createHeadingNode(block.text, block.level))
      continue
    }

    if (block.type === 'paragraph') {
      children.push(createParagraphNode(block.text))
      continue
    }

    const mediaId = mediaIdsByAssetKey.get(block.assetKey)

    assert(mediaId, `Media ausente para imagem interna: ${block.assetKey}`)
    children.push(
      createUploadNode(block.assetKey, mediaId, {
        height: block.height,
        width: block.width,
      }),
    )
  }

  if (input.sources.length > 0) {
    children.push(createHeadingNode('Fontes consultadas', 2))

    for (const source of input.sources) {
      const publisher = source.publisher ? `${source.publisher}: ` : ''
      children.push(createParagraphNode(`${publisher}${source.title} - ${source.url}`))
    }
  }

  return {
    root: {
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

export function formatAutoDraftAssetCaption(asset: AutoDraftAsset) {
  return [
    asset.caption,
    `Fonte: ${asset.sourceUrl}`,
    `Credito: ${asset.credit}`,
    `Licenca: ${asset.license}`,
  ].join('\n')
}

export function getReferencedAssetKeys(input: AutoDraftPostInput) {
  return [
    input.coverAssetKey,
    ...input.blocks
      .filter((block): block is Extract<AutoDraftBlock, { type: 'image' }> => block.type === 'image')
      .map((block) => block.assetKey),
  ].filter((key, index, keys) => keys.indexOf(key) === index)
}
