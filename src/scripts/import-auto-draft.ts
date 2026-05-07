import 'dotenv/config'

import type { File } from 'payload'
import { getPayload } from 'payload'
import { readFile } from 'fs/promises'

import configPromise from '@/payload.config'
import {
  autoDraftAuthorSlug,
  buildAutoDraftRichText,
  formatAutoDraftAssetCaption,
  getReferencedAssetKeys,
  parseAutoDraftPostInput,
  type AutoDraftAsset,
  type AutoDraftPostInput,
} from '@/lib/autoDraft'
import { formatSlug } from '@/lib/slugify'

type Args = {
  dryRun: boolean
  help: boolean
  input?: string
}

type PayloadClient = Awaited<ReturnType<typeof getPayload>>

type SluggedDoc = {
  id: number | string
  slug: string
}

type MediaDoc = {
  id: number | string
}

type CreatedPost = {
  id: number | string
}

type ImportContext = {
  author: SluggedDoc
  section: SluggedDoc
  slug: string
  tags: SluggedDoc[]
}

const defaultDatabaseUrl = 'file:./blog-nerd.db'

function printUsage() {
  console.log(`Usage:
  npm run draft:import -- --input path/to/post.json [--dry-run]

Environment:
  DATABASE_URL                    Target database. Defaults to file:./blog-nerd.db.
  TURSO_AUTH_TOKEN                Required by Turso/libsql targets.
  AUTO_DRAFT_ALLOW_PRODUCTION     Must be "true" for libsql:// writes.
`)
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    dryRun: false,
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--dry-run') {
      args.dryRun = true
      continue
    }

    if (arg === '--help' || arg === '-h') {
      args.help = true
      continue
    }

    if (arg === '--input') {
      args.input = argv[index + 1]
      index += 1
      continue
    }

    if (arg.startsWith('--input=')) {
      args.input = arg.slice('--input='.length)
      continue
    }

    throw new Error(`Argumento desconhecido: ${arg}`)
  }

  return args
}

function isProductionDatabaseTarget() {
  const databaseUrl = process.env.DATABASE_URL || defaultDatabaseUrl

  return databaseUrl.startsWith('libsql://')
}

function getDatabaseTargetLabel() {
  const databaseUrl = process.env.DATABASE_URL || defaultDatabaseUrl

  if (databaseUrl.startsWith('file:')) {
    return databaseUrl
  }

  const parsed = new URL(databaseUrl)

  return `${parsed.protocol}//${parsed.host}`
}

async function readInput(pathname: string) {
  const raw = await readFile(pathname, 'utf8')

  return parseAutoDraftPostInput(JSON.parse(raw))
}

async function findBySlug(
  payload: PayloadClient,
  collection: 'authors' | 'posts' | 'sections' | 'tags',
  slug: string,
) {
  const result = await payload.find({
    collection,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return (result.docs[0] as SluggedDoc | undefined) || null
}

async function requireBySlug(
  payload: PayloadClient,
  collection: 'authors' | 'sections' | 'tags',
  slug: string,
) {
  const doc = await findBySlug(payload, collection, slug)

  if (!doc) {
    throw new Error(`Documento ausente em ${collection}: ${slug}`)
  }

  return doc
}

async function createPayloadDoc<T>(payload: PayloadClient, options: Record<string, unknown>) {
  const create = payload.create as unknown as (options: Record<string, unknown>) => Promise<unknown>

  return (await create(options)) as T
}

async function resolvePostSlug(payload: PayloadClient, input: AutoDraftPostInput) {
  const baseSlug = formatSlug(input.title)

  if (!baseSlug) {
    throw new Error('Nao foi possivel gerar slug a partir do titulo')
  }

  const existingBase = await findBySlug(payload, 'posts', baseSlug)

  if (!existingBase) {
    return baseSlug
  }

  const datedSlug = `${baseSlug}-${new Date().toISOString().slice(0, 10)}`
  const existingDated = await findBySlug(payload, 'posts', datedSlug)

  if (!existingDated) {
    return datedSlug
  }

  throw new Error(`Slug ja existe mesmo com sufixo de data: ${datedSlug}`)
}

async function prepareImportContext(payload: PayloadClient, input: AutoDraftPostInput): Promise<ImportContext> {
  const [author, section, slug, tags] = await Promise.all([
    requireBySlug(payload, 'authors', autoDraftAuthorSlug),
    requireBySlug(payload, 'sections', input.sectionSlug),
    resolvePostSlug(payload, input),
    Promise.all(input.tagSlugs.map((tagSlug) => requireBySlug(payload, 'tags', tagSlug))),
  ])

  return {
    author,
    section,
    slug,
    tags,
  }
}

function sanitizeFilenamePart(value: string) {
  return formatSlug(value) || 'asset'
}

function getExtensionFromMimeType(mimeType: string) {
  if (mimeType === 'image/jpeg') {
    return 'jpg'
  }

  if (mimeType === 'image/png') {
    return 'png'
  }

  if (mimeType === 'image/webp') {
    return 'webp'
  }

  if (mimeType === 'image/gif') {
    return 'gif'
  }

  if (mimeType === 'image/svg+xml') {
    return 'svg'
  }

  return undefined
}

function getExtensionFromUrl(url: string) {
  const pathname = new URL(url).pathname
  const filename = pathname.split('/').pop() || ''
  const extension = filename.includes('.') ? filename.split('.').pop() : undefined

  return extension?.replace(/[^a-z0-9]+/gi, '').toLowerCase() || undefined
}

async function downloadAsset(asset: AutoDraftAsset, filenameBase: string): Promise<File> {
  const response = await fetch(asset.downloadUrl, {
    headers: {
      'user-agent': 'NebulosaPopAutoDraft/1.0',
    },
    signal: AbortSignal.timeout(30_000),
  })

  if (!response.ok) {
    throw new Error(`Falha ao baixar imagem ${asset.key}: HTTP ${response.status}`)
  }

  const mimeType = response.headers.get('content-type')?.split(';')[0]?.toLowerCase() || ''

  if (!mimeType.startsWith('image/')) {
    throw new Error(`Download de ${asset.key} nao retornou imagem: ${mimeType || 'sem content-type'}`)
  }

  const extension = getExtensionFromMimeType(mimeType) || getExtensionFromUrl(asset.downloadUrl) || 'img'
  const data = Buffer.from(await response.arrayBuffer())

  return {
    data,
    mimetype: mimeType,
    name: `${filenameBase}.${extension}`,
    size: data.byteLength,
  }
}

async function createMediaDocs(
  payload: PayloadClient,
  input: AutoDraftPostInput,
  context: ImportContext,
) {
  const runId = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
  const assetsByKey = new Map(input.assets.map((asset) => [asset.key, asset]))
  const mediaIdsByAssetKey = new Map<string, number | string>()

  for (const assetKey of getReferencedAssetKeys(input)) {
    const asset = assetsByKey.get(assetKey)

    if (!asset) {
      throw new Error(`Asset referenciado nao encontrado: ${assetKey}`)
    }

    const mediaSlug = `auto-${context.slug}-${sanitizeFilenamePart(asset.key)}-${runId}`
    const file = await downloadAsset(asset, mediaSlug)
    const media = await createPayloadDoc<MediaDoc>(payload, {
      collection: 'media',
      data: {
        alt: asset.alt,
        caption: formatAutoDraftAssetCaption(asset),
        slug: mediaSlug,
      },
      file,
      overrideAccess: true,
    })

    mediaIdsByAssetKey.set(asset.key, media.id)
  }

  return mediaIdsByAssetKey
}

async function createDraftPost(
  payload: PayloadClient,
  input: AutoDraftPostInput,
  context: ImportContext,
  mediaIdsByAssetKey: Map<string, number | string>,
) {
  const coverImage = mediaIdsByAssetKey.get(input.coverAssetKey)

  if (!coverImage) {
    throw new Error(`Imagem de capa ausente: ${input.coverAssetKey}`)
  }

  return createPayloadDoc<CreatedPost>(payload, {
    collection: 'posts',
    data: {
      affiliateDisclosure: false,
      author: context.author.id,
      content: buildAutoDraftRichText(input, mediaIdsByAssetKey),
      coverImage,
      excerpt: input.excerpt,
      featured: false,
      postType: input.postType,
      publishedAt: null,
      section: context.section.id,
      seoDescription: input.seoDescription,
      seoTitle: input.seoTitle,
      slug: context.slug,
      status: 'draft',
      tags: context.tags.map((tag) => tag.id),
      title: input.title,
    },
    overrideAccess: true,
  })
}

function assertProductionWriteAllowed(dryRun: boolean) {
  if (dryRun || !isProductionDatabaseTarget()) {
    return
  }

  if (process.env.AUTO_DRAFT_ALLOW_PRODUCTION !== 'true') {
    throw new Error(
      'Escrita em libsql:// bloqueada. Defina AUTO_DRAFT_ALLOW_PRODUCTION=true para importar no Turso.',
    )
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.help) {
    printUsage()
    return
  }

  if (!args.input) {
    printUsage()
    throw new Error('Informe --input caminho.json')
  }

  assertProductionWriteAllowed(args.dryRun)

  const input = await readInput(args.input)
  const payload = await getPayload({
    config: await configPromise,
  })
  const context = await prepareImportContext(payload, input)
  const summary = {
    assets: input.assets.length,
    database: getDatabaseTargetLabel(),
    dryRun: args.dryRun,
    internalImages: input.blocks.filter((block) => block.type === 'image').length,
    postType: input.postType,
    section: input.sectionSlug,
    slug: context.slug,
    status: 'draft',
    tags: input.tagSlugs,
    title: input.title,
    topic: input.topic,
  }

  if (args.dryRun) {
    console.log(JSON.stringify(summary, null, 2))
    return
  }

  const mediaIdsByAssetKey = await createMediaDocs(payload, input, context)
  const post = await createDraftPost(payload, input, context, mediaIdsByAssetKey)

  console.log(
    JSON.stringify(
      {
        ...summary,
        mediaIds: Object.fromEntries(mediaIdsByAssetKey),
        postId: post.id,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)

  console.error(message)
  process.exitCode = 1
})
