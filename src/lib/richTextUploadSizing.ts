import type { CSSProperties } from 'react'

export type UploadResizeFields = {
  height?: number | string | null
  width?: number | string | null
}

function parseUploadDimension(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.round(value)
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()

    if (!trimmed) {
      return undefined
    }

    const parsed = Number(trimmed)

    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.round(parsed)
    }
  }

  return undefined
}

export function getUploadResizeValues(fields?: Record<string, unknown> | null) {
  return {
    height: parseUploadDimension(fields?.height),
    width: parseUploadDimension(fields?.width),
  }
}

export function getUploadResizeStyle(fields?: Record<string, unknown> | null): CSSProperties {
  const { height, width } = getUploadResizeValues(fields)

  return {
    display: 'block',
    height: height ? `${height}px` : width ? 'auto' : 'auto',
    maxWidth: '100%',
    objectFit: 'contain',
    width: width ? `${width}px` : height ? 'auto' : '100%',
  }
}
