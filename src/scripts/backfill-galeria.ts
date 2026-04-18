import { createClient } from '@libsql/client/sqlite3'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { getDatabaseClientConfig } from '@/lib/database'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const projectRoot = path.resolve(dirname, '../..')
const mediaDir = path.join(projectRoot, 'media')

type MediaRow = {
  alt: string
  height: number
  id: number
  mime_type: string
  sizes_galeria_filename: null | string
  sizes_galeria_filesize: null | number
  sizes_galeria_height: null | number
  sizes_galeria_mime_type: null | string
  sizes_galeria_url: null | string
  sizes_galeria_width: null | number
  url: string
  width: number
}

function getSourceFilename(url: string) {
  const rawFilename = url.split('/').pop()

  if (!rawFilename) {
    throw new Error(`Unable to derive source filename from url: ${url}`)
  }

  return decodeURIComponent(rawFilename)
}

function parseFilename(sourceImage: string) {
  const extension = sourceImage.split('.').pop()
  const name = sourceImage.substring(0, sourceImage.lastIndexOf('.')) || sourceImage

  return {
    ext: extension,
    name: name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim(),
  }
}

function generateImageSizeFilename({
  extension,
  height,
  outputImageName,
  width,
}: {
  extension: string
  height: number
  outputImageName: string
  width: number
}) {
  return `${outputImageName}-${width}x${height}.${extension}`
}

async function main() {
  const db = createClient(getDatabaseClientConfig())
  const result = await db.execute(
    'select id, alt, filename, mime_type, url, width, height, sizes_galeria_url, sizes_galeria_width, sizes_galeria_height, sizes_galeria_mime_type, sizes_galeria_filesize, sizes_galeria_filename from media',
  )

  const rows = result.rows as unknown as MediaRow[]

  for (const row of rows) {
    if (row.sizes_galeria_url) {
      continue
    }

    const sourceFilename = getSourceFilename(row.url)
    const sourcePath = path.join(mediaDir, sourceFilename)

    const parsed = parseFilename(sourceFilename)
    const targetFilename = generateImageSizeFilename({
      extension: parsed.ext || 'jpg',
      height: 900,
      outputImageName: parsed.name,
      width: 1600,
    })
    const targetPath = path.join(mediaDir, targetFilename)

    const image = sharp(sourcePath).resize({
      fit: 'cover',
      height: 900,
      position: 'center',
      width: 1600,
    })

    const info = await image.toFile(targetPath)

    await db.execute({
      args: [
        `/api/media/file/${encodeURIComponent(targetFilename)}`,
        1600,
        900,
        row.mime_type,
        info.size,
        targetFilename,
        row.id,
      ],
      sql: 'update media set sizes_galeria_url = ?, sizes_galeria_width = ?, sizes_galeria_height = ?, sizes_galeria_mime_type = ?, sizes_galeria_filesize = ?, sizes_galeria_filename = ? where id = ?',
    })

    console.log(`Backfilled galeria for media ${row.id}: ${row.alt}`)
  }

  db.close()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
